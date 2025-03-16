'use client';
import { ChevronLeft, ChevronRight, CircleUser, Book } from 'lucide-react';
import { CreditCard, HomeIcon, LogOut, Mail } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const { data: session } = useSession();
  const pathname = usePathname(); // Hook to get the current path

  const [alertItem] = useState("");

  // Determine active item based on the current path
  const activeItem = pathname?.includes('facturation') 
    ? "Facturation" 
    : pathname?.includes('contact') 
    ? "Contact" 
    : pathname?.includes('guide')
    ? "Guide"
    : "Accueil";

  const setPage = (item: string): void => {
    if (item === "Déconnexion") {
      signOut();
      router.push('/signin');
      return;
    }
    const pageMapping: Record<string, string> = {
      "Accueil": "/home",
      "Facturation": "/billing",
      "Contact": "/contact",
      "Guide": "/guide",
    };
    router.push(pageMapping[item]);
  };

  const SidebarItem = ({ icon, name }: { icon: React.ReactNode; name: string }) => {
    const active = name === activeItem;
    const alert = name === alertItem;
    return (
      <button onClick={() => setPage(name)}>
        <li
          className={`
            relative flex items-center
            font-medium rounded-md cursor-pointer
            transition-colors group
            ${
              expanded 
                ? "py-1.5 px-2 my-1" 
                : "p-1.5 mx-3 my-1"
            }
            ${active ? "bg-gradient-to-tr bg-gray-100 text-gray-800" : "hover:bg-gray-600 text-gray-200"}
          `}
        >
          {icon}
          <span className={`overflow-hidden transition-all ${expanded ? "w-40 ml-3" : "w-0"}`}>
            {name}
          </span>
          {alert && (
            <div className={`absolute right-2 w-2 h-2 rounded bg-gray-100 ${expanded ? "" : "top-2"}`} />
          )}

          {!expanded && (
            <div
              className={`
                absolute left-full rounded-md px-2 py-1 ml-6
                bg-gray-200 text-gray-600 text-sm
                invisible opacity-20 -translate-x-3 transition-all
                group-hover:visible group-hover:opacity-100 group-hover:translate-x-0
              `}
            >
              {name}
            </div>
          )}
        </li>
      </button>
    );
  };

  if (!session) return null; // Do not render the sidebar if there is no session

  return (
    <aside className="h-full">
      <nav className="h-full flex flex-col bg-[#000000] shadow-sm">
        <div className="p-4 pb-2 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/images/fire.png" className={`overflow-hidden transition-all ${expanded ? "w-10" : "w-0"}`} alt="" />
            <h1 className={`overflow-hidden transition-all ${expanded ? "w-32" : "w-0"} font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-xl`}>
              SowerFlow
            </h1>
          </div>
          <button onClick={() => setExpanded((curr) => !curr)} className="p-1.5 rounded-lg bg-gray-850 hover:bg-gray-600">
            {expanded ? <ChevronLeft style={{ color: 'white' }} /> : <ChevronRight style={{ color: 'white' }} />}
          </button>
        </div>
        <ul className="flex flex-col flex-1 px-3">
          <SidebarItem icon={<HomeIcon size={20} />} name="Accueil" />
          <SidebarItem icon={<CreditCard size={20} />} name="Facturation" />
          <SidebarItem icon={<Mail size={20} />} name="Contact" />
          <SidebarItem icon={<Book size={20} />} name="Guide" />
          <SidebarItem icon={<LogOut size={20} />} name="Déconnexion" />
        </ul>
        <div className="flex p-3">
          <CircleUser />
          <div className={`flex justify-between items-center overflow-hidden transition-all ${expanded ? "w-40 ml-3" : "w-0"}`}>
            <div className="leading-4">
              <h4 className="font-semibold">{session?.user?.name}</h4>
              <span className="text-xs text-gray-400">{session?.user?.email}</span>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
