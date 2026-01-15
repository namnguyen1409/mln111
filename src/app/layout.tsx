import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import Navbar from "@/components/layout/Navbar";
import { Toaster } from "@/components/ui/toaster";
import StructuredData from "@/components/seo/StructuredData";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Triết Học PlayHub | Nền tảng học tập tương tác",
    template: "%s | Triết Học PlayHub",
  },
  description: "Chuyển hóa tri thức triết học trừu tượng thành trải nghiệm học tập trực quan, tương tác và đầy hứng khởi.",
  keywords: ["Triết học Mác-Lênin", "MLN111", "Học trực tuyến", "Games học tập", "Sinh viên", "PlayHub"],
  authors: [{ name: "Namnguyen" }],
  openGraph: {
    title: "Triết Học PlayHub",
    description: "Học cùng chơi, hiểu cùng nhớ - Nâng tầm tri thức triết học của bạn.",
    url: "https://mln111.vnbooth.io.vn", // Dynamic base URL would be better but this is a placeholder
    siteName: "Triết Học PlayHub",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Triết Học PlayHub Preview",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Triết Học PlayHub",
    description: "Học Triết học Mác-Lênin theo phong cách mới!",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StructuredData />
          <AuthProvider>
            <Navbar />
            <div className="layout-container pt-20 font-sans">
              {children}
            </div>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
