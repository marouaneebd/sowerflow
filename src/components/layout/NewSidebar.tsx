"use client"
import * as React from "react"
import {
  Book,
  CreditCard,
  LayoutDashboardIcon,
  LogOut,
  Mail,
} from "lucide-react"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger
} from "@/components/ui/sidebar"
import { type LucideIcon } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { useSession } from "next-auth/react"
import { Profile } from "@/types/profile"
import { useCallback, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

const data = {
  navMain: [
    {
      title: "Tableau de bord",
      url: "/home",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Facturation",
      url: "/billing",
      icon: CreditCard,
    },
    {
      title: "Contact",
      url: "/contact",
      icon: Mail,
    },
    {
      title: "Guide",
      url: "/guide",
      icon: Book,
    },
    {
      title: "Déconnexion",
      url: "#",
      icon: LogOut,
    },
  ]
}

export function NewSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <div className="flex items-center gap-2">
                  <img src="/images/fire.png" className="overflow-hidden transition-all w-6 h-6" alt="SowerFlow Logo" />
                  <h1 className="overflow-hidden transition-all w-32 font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b2b] to-[#d22dfc] text-xl">
                    SowerFlow
                  </h1>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={session?.user?.email} />
      </SidebarFooter>
    </Sidebar>
  )
}

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
  }[]
}) {
  const pathname = usePathname()
  const { setOpenMobile, isMobile } = useSidebar()

  const handleClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  tooltip={item.title}
                  className={isActive ? "bg-accent" : ""}
                >
                  <Link href={item.url} onClick={handleClick}>
                    {item.icon && <item.icon />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function NavUser({ email }: { email?: string | null }) {
  if (!email) return null;
  
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="cursor-default">
              <Mail className="h-4 w-4" />
              <span className="text-sm truncate">{email}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export function SiteHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);

  const redirectBilling = useCallback((): void => {
    router.push("/billing");
  }, [router]);

  // Fetch profile data
  useEffect(() => {
    let isMounted = true;

    async function fetchProfileData() {
      try {
        const response = await fetch('api/profile', {
          headers: {
            'Cache-Control': 'no-store'
          }
        });
        if (!isMounted) return;

        if (response.ok) {
          const profileData = await response.json();
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Failed to fetch profile data:', error);
      }
    }

    if (session) {
      fetchProfileData();
    }

    return () => {
      isMounted = false;
    };
  }, [session]);

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        {profile?.subscription?.is_active === false && (
          <div className="flex items-center gap-2 bg-red-50 rounded-md px-4 py-1.5 text-sm text-red-500">
            <span>Compte inactif</span>
            <button
              onClick={redirectBilling}
              className="underline hover:text-orange-200 transition-colors duration-200"
            >
              Activer mon compte
            </button>
          </div>
        )}
      </div>
    </header>
  )
}