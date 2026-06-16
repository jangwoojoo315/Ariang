import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const notoSansKR = Noto_Sans_KR({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "아이랑 — 가족 생태여행",
  description: "아이와 함께하는 생태여행 파트너",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${notoSansKR.variable} h-full`} style={{ fontFamily: "var(--font-noto-sans-kr), -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <body style={{ fontFamily: "var(--font-noto-sans-kr), -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
