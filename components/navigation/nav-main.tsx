"use client";

// lucide
import { type LucideIcon } from "lucide-react";
// components
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
// next-nav
import { usePathname, useRouter } from "next/navigation";

interface Props {
  nav: {
    title: string;
    url: string;
    icon: LucideIcon;
  }[];
}

export function NavMain({ nav }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarMenu>
        {nav.map((item) => {
          const isActive = pathname === item.url;
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton size="lg" isActive={isActive} asChild>
                <div
                  onClick={() => router.push(item.url)}
                  role="link"
                  tabIndex={0}
                  className="flex items-center cursor-pointer"
                >
                  <item.icon />
                  <span>{item.title}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
