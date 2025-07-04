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

export default async function LeftSideBar() {
  const projects = await fetchProjectList()

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
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
