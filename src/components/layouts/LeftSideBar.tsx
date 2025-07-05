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
          <SidebarGroupLabel className="text-white">Plax</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <div className="flex">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton className="text-white cursor-pointer">
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
                  <div className="flex items-center justify-between px-2 py-1 text-white hover:bg-gray-800 rounded-md">
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
