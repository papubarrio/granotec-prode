import logoPositivo  from "../assets/logo-positivo.png";
import logoInvertido from "../assets/logo-invertido.png";

export default function GranotecLogo({ height = 36, white = false }) {
  return (
    <img
      src={white ? logoInvertido : logoPositivo}
      alt="Granotec"
      style={{ height, width: "auto", display: "block" }}
    />
  );
}
