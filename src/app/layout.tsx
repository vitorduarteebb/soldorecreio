import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Sol do Recreio — Cashback",
    template: "%s · Sol do Recreio",
  },
  description:
    "Programa de fidelidade do mercado Sol do Recreio: cashback em cada compra.",
  openGraph: {
    title: "Sol do Recreio — Cashback",
    description:
      "Acumule cashback nas compras e resgate com a equipe do mercado.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-stone-100 text-stone-900">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
