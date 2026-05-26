import { S, B } from "../styles";
import { useIsMobile } from "../hooks";
import camiseta from "../assets/Camiseta_Titular_de_la_Seleccion_Argentina_26_Blanco_JM5900_21_model.avif";
import pelota from "../assets/Pelota_Trionda_League_Copa_Mundial_de_la_FIFA_26tm_Blanco_JD8030_01_00_standard.avif";
import champagne from "../assets/salentein-brut-nature.webp";
import reserva from "../assets/salentein-reserva.webp";
import mateSet from "../assets/set-matero.webp";
import vinoPortillo from "../assets/vino-portillo.webp";

const prizes = [
  {
    rank: 1,
    medal: "🥇",
    title: "1er puesto",
    description: "Camiseta original titular de la Selección Argentina + Caja de Champagne Salentein Brut Nature.",
    link: "https://www.adidas.com.ar/camiseta-titular-de-la-seleccion-argentina-26/JM5900.html",
    images: [
      { src: camiseta, alt: "Camiseta Argentina" },
      { src: champagne, alt: "Champagne Salentein" },
    ],
  },
  {
    rank: 2,
    medal: "🥈",
    title: "2do puesto",
    description: "Pelota de fútbol Trionda de la Copa del Mundo + Caja de vino Salentein Reserva.",
    link: "https://www.adidas.com.ar/pelota-trionda-league-copa-mundial-de-la-fifa-26/JD8030.html",
    images: [
      { src: pelota, alt: "Pelota Trionda" },
      { src: reserva, alt: "Vino Salentein Reserva" },
    ],
  },
  {
    rank: 3,
    medal: "🥉",
    title: "3er puesto",
    description: "Set de mate + Caja de Vino El Portillo.",
    link: "https://www.mercadolibre.com.ar/set-matero-termo-mate-y-bombilla-ozz-color-negro/p/MLA65933359?pdp_filters=item_id:MLA2901055438#is_advertising=true&searchVariation=MLA65933359&backend_model=search-backend&be_origin=backend&position=1&search_layout=grid&type=pad&tracking_id=25eddca5-4e63-863b-f1c499ccb7bd&ad_domain=VQCATCORE_LST&ad_position=1&ad_click_id=MGM0MTVhZDUtZDZhYi00YjdiLWI3ZjItYTk5NDM4MjA2YWUz",
    images: [
      { src: mateSet, alt: "Set de mate" },
      { src: vinoPortillo, alt: "Vino El Portillo" },
    ],
  },
];

export default function PrizePodium() {
  const isMobile = useIsMobile();

  return (
    <div style={{ ...S.card, marginBottom: 20 }}>
      <div style={S.cardHeader}>
        <span style={S.cardHeaderTitle}>Premios</span>
      </div>
      <div style={{ padding: "20px", display: "grid", gap: 18 }}>
        <div style={{ color: B.gray70, fontSize: 13, lineHeight: 1.6 }}>
          El podio final entrega premios especiales a los 3 mejores pronosticadores. Cada puesto incluye dos productos destacados para vivir la Copa con estilo.
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            alignItems: "flex-end",
            gap: 14,
            justifyContent: "center",
          }}
        >
          {prizes.map((prize, index) => (
            <div
              key={prize.rank}
              style={{
                ...S.card,
                border: `1px solid ${B.grayBorder}`,
                padding: 16,
                minWidth: isMobile ? "auto" : index === 1 ? 290 : 250,
                maxWidth: isMobile ? "100%" : index === 1 ? 320 : 280,
                alignSelf: index === 1 ? "flex-start" : "flex-end",
                boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
                display: "flex",
                flexDirection: "column",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ fontSize: 22 }}>{prize.medal}</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#2a2a2a" }}>{prize.title}</div>
              </div>
              <div style={{ display: "grid", gap: 10 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {prize.images.map(image => (
                    <img
                      key={image.alt}
                      src={image.src}
                      alt={image.alt}
                      style={{ width: "100%", height: 124, objectFit: "cover", borderRadius: 14, background: B.grayLight }}
                    />
                  ))}
                </div>
                <div style={{ color: B.gray70, fontSize: 13, lineHeight: 1.5 }}>
                  {prize.description}
                </div>
                <a
                  href={prize.link}
                  target="_blank"
                  rel="noreferrer"
                  style={{ fontSize: 13, color: B.blue, fontWeight: 700 }}
                >
                  Ver producto
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
