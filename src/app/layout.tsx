import './globals.css';
import SessionProvider from './SessionProvider';
import TopBar from '@/components/layout/TopBar';
import { Montserrat } from 'next/font/google'
import Hotjar from '@/components/Hotjar';
import { NewSidebar, SiteHeader } from "@/components/layout/NewSidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata = {
  title: 'Sowerflow',
  description: 'Votre plateforme de gestion de projets',
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="fr" className={`${montserrat.variable}`}>
      <head>
        <Hotjar hjid="5254531" hjsv="6" />
      </head>
      <body className={`${montserrat.className} h-screen bg-white`}>
        <SessionProvider>
          <div className="flex h-screen flex-col">
            <SidebarProvider>
              <NewSidebar variant="inset" />
              <SidebarInset>
                <SiteHeader />
                <div className="flex flex-1 overflow-hidden">
                  <main className="flex-1 overflow-auto">
                    {children}
                  </main>
                </div>
              </SidebarInset>
            </SidebarProvider>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}
