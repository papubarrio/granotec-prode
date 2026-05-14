// Zoho CRM v2 integration
// Setup: create a Server-based OAuth app in https://api-console.zoho.com
// Add ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_DOMAIN to .env
// ZOHO_DOMAIN = zohoapis.com (US) | zohoapis.eu (EU) | zohoapis.com.au (AU)

let cachedToken = null;
let tokenExpiry = 0;

async function getAccessToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const { ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_DOMAIN } = process.env;
  if (!ZOHO_CLIENT_ID || !ZOHO_CLIENT_SECRET || !ZOHO_REFRESH_TOKEN) return null;

  const domain = ZOHO_DOMAIN || "zohoapis.com";
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
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh 1 min early
  return cachedToken;
}

async function createLead({ first_name, last_name, email, company }) {
  const { ZOHO_DOMAIN } = process.env;
  const domain = ZOHO_DOMAIN || "zohoapis.com";

  try {
    const token = await getAccessToken();
    if (!token) {
      console.log("[zoho] Skipping lead creation — credentials not configured");
      return null;
    }

    const res = await fetch(`https://www.${domain}/crm/v2/Leads`, {
      method: "POST",
      headers: {
        "Authorization": `Zoho-oauthtoken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: [{
          First_Name:   first_name,
          Last_Name:    last_name || "-",
          Email:        email,
          Company:      company || "-",
          Lead_Source:  "Prode Mundial 2026",
          Description:  "Registrado via Prode Mundial 2026 — Granotec",
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
    // Never block registration if Zoho is down
    console.error("[zoho] Error al crear lead:", e.message);
    return null;
  }
}

module.exports = { createLead };
