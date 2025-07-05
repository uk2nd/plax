import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSubItem,
  SidebarMenuSub,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import CreateProject from "@/components/project/CreateProject"
import ProjectList from "@/components/project/ProjectList"
import { fetchProjectList } from "@/lib/actions/project/fetchProjectList"
import Setting from "./Setting";
import { auth } from "@/auth";

export default async function LeftSideBar() {
  const projects = await fetchProjectList()
  const session = await auth(); // サーバーサイドでセッション情報を取得
  if (!session?.user?.email) throw new Error("不正なリクエストです");

  return (
    <Sidebar side="left" className="bg-black text-white">
      <SidebarContent className="bg-black text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-2xl font-semibold text-slate-100 tracking-wide px-4 py-3 bg-gradient-to-r from-slate-600 to-slate-800 rounded-lg shadow-sm font-serif">
            Plax
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <div className="flex">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="text-lg font-semibold text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 cursor-pointer">
                        プロジェクト
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CreateProject />
                  </div>
                  <CollapsibleContent>
                      <SidebarMenuSub>
                          <SidebarMenuSubItem>
                            <ProjectList projects={projects} />
                          </SidebarMenuSubItem>
                      </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
                                <SidebarMenu>
                  <div className="flex items-center justify-between text-lg font-semibold text-white px-3 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200">
                    <div>アカウント</div>
                    <Setting session={session} />
                  </div>
                </SidebarMenu>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
