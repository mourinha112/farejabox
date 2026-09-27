import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FAREJA · App do tutor",
    short_name: "FAREJA",
    description: "Acompanhe a caixa do mês e a saúde do seu pet.",
    start_url: "/app",
    display: "standalone",
    background_color: "#FFF4E4",
    theme_color: "#F4622F",
    lang: "pt-BR",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
