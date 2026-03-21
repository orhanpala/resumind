import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import NavbarWrapper from "./components/NavbarWrapper"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata = {
  title: "Resumind - Yapay Zeka ile CV Oluştur",
  description: "Yapay zeka ile saniyeler içinde profesyonel CV oluştur. 12 şablon, PDF indirme, LinkedIn özeti, referans mektubu ve daha fazlası.",
  keywords: "cv oluştur, özgeçmiş oluştur, yapay zeka cv, ai cv, profesyonel cv, cv şablonu",
  openGraph: {
    title: "Resumind - Yapay Zeka ile CV Oluştur",
    description: "Yapay zeka ile saniyeler içinde profesyonel CV oluştur.",
    url: "https://www.resumind.com.tr",
    siteName: "Resumind",
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resumind - Yapay Zeka ile CV Oluştur",
    description: "Yapay zeka ile saniyeler içinde profesyonel CV oluştur.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://www.resumind.com.tr",
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <NavbarWrapper />
        {children}
      </body>
    </html>
  )
}