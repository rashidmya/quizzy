"use client";

// components
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
// logo
import LaunchUI from "./logos/launch-ui";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";
import Link from "next/link";

export function NavHeader() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-transparent hover:text-current"
        >
          <Link href={PATH_DASHBOARD.root}>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground dark:bg-white dark:text-black flex aspect-square size-8 items-center justify-center rounded-lg">
              <LaunchUI />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-bold">Quizzy</span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
