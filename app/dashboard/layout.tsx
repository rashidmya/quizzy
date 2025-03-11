// components
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex justify-center overflow-auto">
          <div className="flex w-full h-full">
            <div className="flex flex-col w-full">{children}</div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
