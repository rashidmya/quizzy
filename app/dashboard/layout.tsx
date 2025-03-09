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
            <div className="flex flex-col w-full">
              <div className="relative w-full mx-auto px-5 md:px-0 overflow-hidden p-12 max-w-[890px]">
                {children}
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
