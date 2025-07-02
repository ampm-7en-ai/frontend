
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  LayoutDashboard,
  Settings,
  MessageSquare,
  Plus,
  Users,
  BrainCircuit,
  FileCode2,
  LucideIcon
} from "lucide-react"

interface SidebarItemProps {
  href: string;
  icon: LucideIcon;
  title: string;
}

const sidebarItems: SidebarItemProps[] = [
  {
    href: "/dashboard",
    icon: LayoutDashboard,
    title: "Dashboard",
  },
  {
    href: "/agents",
    icon: BrainCircuit,
    title: "AI Agents",
  },
  {
    href: "/knowledge",
    icon: FileCode2,
    title: "Knowledge Base",
  },
  {
    href: "/users",
    icon: Users,
    title: "Users",
  },
  {
    href: "/settings",
    icon: Settings,
    title: "Settings",
  },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 w-60">
      <ScrollArea className="flex-1 space-y-4 p-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Platform
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <TooltipProvider key={item.href}>
                <Tooltip delayDuration={50}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-start px-4 py-2 font-normal text-sm group"
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                      {item.title === 'AI Agents' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/agents/builder/new');
                          }}
                          className="h-6 w-6 p-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" align="center">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
