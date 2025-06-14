import PrivateHeader from "@/components/layouts/PrivateHeader";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import LeftSideBar from "@/components/layouts/LeftSideBar";

export default function PrivateLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
    <div className="flex flex-col min-h-screen">
        <PrivateHeader />
        <SidebarProvider>
            <LeftSideBar />
            <main>
                <SidebarTrigger />
                {children}
            </main>
        </SidebarProvider>
    </div>
    )
}
