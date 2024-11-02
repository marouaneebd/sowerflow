import './globals.css';
import SessionProvider from './SessionProvider';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" className="h-full bg-gray-50">
      <body className="h-full">
      <SessionProvider>
      <TopBar></TopBar>
      <div className="h-full flex">
      <Sidebar></Sidebar>
      <div className="flex-grow bg-gray-50">
        {children}
      </div>
      </div>
      </SessionProvider>
      </body>
    </html>
  )
}