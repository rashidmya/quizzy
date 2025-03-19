"use client";

// icons
import { HomeIcon, FoldersIcon, ChartLine } from "lucide-react";
// components
import { NavMain } from "@/components/navigation/nav-main";
import { NavUser } from "@/components/navigation/nav-user";
import { NavHeader } from "@/components/navigation/nav-header";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
// hooks
import { useCurrentUser } from "@/hooks/use-current-user";
// paths
import { PATH_DASHBOARD } from "@/routes/paths";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Home",
      url: PATH_DASHBOARD.root,
      icon: HomeIcon,
    },
    {
      title: "Library",
      url: PATH_DASHBOARD.library.root,
      icon: FoldersIcon,
    },
    {
      title: "Reports",
      url: PATH_DASHBOARD.reports.root,
      icon: ChartLine,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain nav={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
