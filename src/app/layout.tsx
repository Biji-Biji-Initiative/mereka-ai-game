import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ClientWrapper from '@/features/layout/ClientWrapper'
import Providers from './providers'
import { GameIntegration } from '@/components/game/GameIntegration'
import { GlobalErrorBoundary } from '@/components/error/GlobalErrorBoundary'
import { ErrorProvider } from '@/lib/error/ErrorProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Fight Club',
  description: 'Test your cognitive abilities against AI opponents',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ErrorProvider>
            <GlobalErrorBoundary>
              <ClientWrapper>
                <GameIntegration />
                {children}
              </ClientWrapper>
            </GlobalErrorBoundary>
          </ErrorProvider>
        </Providers>
      </body>
    </html>
  )
}
