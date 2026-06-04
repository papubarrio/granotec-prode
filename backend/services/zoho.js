// Zoho CRM v2 integration
// Setup: create a Server-based OAuth app in https://api-console.zoho.com
// Add ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_DOMAIN to .env
// ZOHO_DOMAIN = zohoapis.com (US) | zohoapis.eu (EU) | zohoapis.com.au (AU)

const TAG_NAME = "prode";

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN } = process.env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) return null;

  const res = await fetch(
    `https://accounts.zoho.com/oauth/v2/token?grant_type=refresh_token&client_id=${ZOHO_CLIENT_ID}&client_secret=${ZOHO_CLIENT_SECRET}&refresh_token=${ZOHO_REFRESH_TOKEN}`,
    { method: "POST" }
  );
  const data = await res.json();
  if (!data.access_token) {
    console.error("[zoho] Failed to get access token:", data);
    return null;
  }
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000;
  return cachedToken;
}

function domain() {
  return process.env.ZOHO_DOMAIN || "zohoapis.com";
}

async function searchByEmail(module, email, token) {
  const res = await fetch(
    `https://www.${domain()}/crm/v2/${module}/search?criteria=(Email:equals:${encodeURIComponent(email)})`,
    { headers: { "Authorization": `Zoho-oauthtoken ${token}` } }
  );
  if (res.status === 204) return null;
  const data = await res.json();
  return data.data?.[0] || null;
}

async function addTag(module, recordId, token) {
  const res = await fetch(
    `https://www.${domain()}/crm/v2/${module}/${recordId}/actions/add_tags`,
    {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags: [{ name: TAG_NAME }] }),
    }
  );
  const data = await res.json();
  const ok = data.data?.[0]?.code === "SUCCESS";
  if (ok) console.log(`[zoho] Tag "${TAG_NAME}" agregado a ${module}/${recordId}`);
  else console.warn("[zoho] No se pudo agregar tag:", JSON.stringify(data));
}

async function createLead({ first_name, last_name, email, company }) {
  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("[zoho] Skipping — credentials not configured");
      return null;
    }

    // 1. Buscar en Leads
    let existing = await searchByEmail("Leads", email, token);
    if (existing) {
      console.log(`[zoho] Lead existente encontrado para ${email} (id: ${existing.id})`);
      await addTag("Leads", existing.id, token);
      return existing.id;
    }

    // 2. Buscar en Contacts
    existing = await searchByEmail("Contacts", email, token);
    if (existing) {
      console.log(`[zoho] Contacto existente encontrado para ${email} (id: ${existing.id})`);
      await addTag("Contacts", existing.id, token);
      return existing.id;
    }

    // 3. No existe → crear Lead nuevo con el tag
    const res = await fetch(`https://www.${domain()}/crm/v2/Leads`, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [{
          First_Name:  first_name,
          Last_Name:   last_name || "-",
          Email:       email,
          Company:     company || "-",
          Lead_Source: "Prode Mundial 2026",
          Description: "Registrado via Prode Mundial 2026 — Granotec",
          Tag:         [{ name: TAG_NAME }],
        }],
        trigger: ["approval", "workflow"],
      }),
    });

    const data = await res.json();
    const result = data.data?.[0];
    if (result?.code === "SUCCESS") {
      console.log(`[zoho] Lead creado: ${first_name} ${last_name} (${email})`);
      return result.details?.id;
    } else {
      console.warn("[zoho] Lead no creado:", result?.message || JSON.stringify(data));
      return null;
    }
  } catch (e) {
    console.error("[zoho] Error:", e.message);
    return null;
  }
}

module.exports = { createLead };
