import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { StudyProvider } from '@/lib/study-context'
import { PromptProvider } from "@/hooks/use-floating-prompts"
import { InstallPWA } from "@/components/InstallPWA"
import { NotificationPrompt } from "@/components/NotificationPrompt"
import './globals.css'

export const maxDuration = 60;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: 'Engineering Tracker - Academic Progress Tracker',
  description: 'Track your courses, lectures, and academic progress',
  manifest: '/manifest.json', // السطر ده هو اللي بيربط التطبيق
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PromptProvider>
          <StudyProvider>
            {children}
            <InstallPWA />
            <NotificationPrompt />
          </StudyProvider>
          </PromptProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
