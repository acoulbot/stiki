import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import ClientShell from "@/components/ClientShell";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://hittabak.ru"),
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || "",
  },
  title: "hittabak — Устройства и стики нового поколения",
  description: "Официальный сайт hittabak — устройства нагревания табака, стики, аксессуары. Каталог продукции, блог, поддержка, программа лояльности.",
  keywords: "hittabak, стики, устройства нагревания табака, табачные стики, каталог, магазин",
  openGraph: {
    title: "hittabak — Устройства и стики нового поколения",
    description: "Устройства нагревания табака и стики от hittabak. Каталог продукции, где купить, поддержка.",
    locale: "ru_RU",
    type: "website",
    siteName: "hittabak",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://hittabak.ru";
  const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID || "";
  const gaId = process.env.NEXT_PUBLIC_GA_ID || "";

  return (
    <html lang="ru" className={`h-full antialiased ${inter.variable} ${manrope.variable}`}>
      <head>
        {gaId && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}')` }} />
          </>
        )}
        {ymId && (
          <script dangerouslySetInnerHTML={{ __html: `(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${ymId}','ym');ym(${ymId},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true})` }} />
        )}
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        {ymId && (
          <noscript>
            <div><img src={`https://mc.yandex.ru/watch/${ymId}`} style={{ position: "absolute", left: "-9999px" }} alt="" /></div>
          </noscript>
        )}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "hittabak",
              url: baseUrl,
              logo: `${baseUrl}/logo.png`,
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+7-800-000-00-00",
                contactType: "customer service",
                areaServed: "RU",
                availableLanguage: "Russian",
              },
              sameAs: [
                "https://t.me/tophit_new",
              ],
            }),
          }}
        />
        {children}
        <ClientShell />
      </body>
    </html>
  );
}
