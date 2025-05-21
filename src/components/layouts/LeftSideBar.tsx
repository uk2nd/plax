"use client"

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

// Menu items.
const items = [
  {
    title: "プロジェクトA",
    url: "#",
  },
  {
    title: "プロジェクトB",
    url: "#",
  },
  {
    title: "+ プロジェクトを作成",
    url: "#",
  },
]

export default function LeftSideBar() {
  return (
    <Sidebar side="left" className="bg-black text-white">
      <SidebarContent className="bg-black text-white">
        <SidebarGroup>
          <SidebarGroupLabel className="text-white">Plax</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="text-white hover:bg-gray-800">
                      プロジェクト
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {items.map((item) => (
                      <SidebarMenuSub key={item.title}>
                          <SidebarMenuSubItem>
                            <a href={item.url}  className="text-white hover:underline">
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuSubItem>
                      </SidebarMenuSub>
                    ))}
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
