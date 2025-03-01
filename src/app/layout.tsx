import './globals.css';
import SessionProvider from './SessionProvider';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { Montserrat } from 'next/font/google'


const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
})

export const metadata = {
  title: 'SowerFlow',
  description: '',
}


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="fr" className={`${montserrat.variable}`}>
      <body className={`${montserrat.className} h-screen bg-white`}>
        <SessionProvider>
          <div className="flex h-screen flex-col">
            <TopBar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}