import './globals.css';
import SessionProvider from './SessionProvider';
import Sidebar from '@/components/layout/Sidebar';

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en" className="h-full bg-orange-500">
      <body className="h-full">
      <SessionProvider>
      <div className="h-full flex">
      <Sidebar></Sidebar>
      <div className="flex-grow p-8 bg-gray-50">
        {children}
      </div>
      </div>
      </SessionProvider>
      </body>
    </html>
  )
}