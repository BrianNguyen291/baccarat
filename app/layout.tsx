import type { Metadata, Viewport } from 'next'
import { Noto_Sans_TC, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

const _notoSansTC = Noto_Sans_TC({ subsets: ["latin"], variable: "--font-noto-sans-tc" });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '百家樂牌權重計算器',
  description: '百家樂牌權重計算工具 - 手動輸入牌面，計算加總分數，輸出下一局建議',
}

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-TW">
      <body className="font-sans antialiased">
        {children}
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  )
}
