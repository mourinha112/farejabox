import type { Metadata, Viewport } from "next";
import { Archivo, Baloo_2 } from "next/font/google";
import { site } from "@/lib/config";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "FAREJA · Box funcional do pet",
    template: "%s · FAREJA",
  },
  description:
    "Assinatura mensal de petiscos naturais e suplemento funcional, montada pelo perfil do seu pet. Faça a avaliação de preferências em 2 minutos.",
  openGraph: {
    title: "FAREJA · O box que seu pet fareja de longe",
    description:
      "Petiscos naturais + suplemento funcional, montados pelo perfil do seu pet e entregues todo mês.",
    locale: "pt_BR",
    type: "website",
    siteName: "FAREJA",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4622F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${archivo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
