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
      <body className={`${montserrat.className} h-full bg-white`}>
      <SessionProvider>
      <TopBar></TopBar>
      <div className="h-full flex">
      <Sidebar></Sidebar>
      <div className="flex-grow bg-white">
        {children}
      </div>
      </div>
      </SessionProvider>
      </body>
    </html>
  )
}