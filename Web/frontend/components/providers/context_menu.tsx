import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { Home, FileText, Camera, CircleAlert, BarChart2, Lightbulb } from "lucide-react"

const contextMenuItems = [
    {
        label: "Главная",
        href: "/",
        icon: Home,
    },
    {
        label: "Документация",
        href: "/docs",
        icon: FileText,
    },
    {
        label: "Здания",
        href: "/buildings",
        icon: Camera,
    },
    {
        label: "Аналитика",
        href: "/analysis",
        icon: BarChart2,
    },
    {
        label: "Уведомления",
        href: "/alerts",
        icon: CircleAlert,
    },
    {
        label: "Возможности",
        href: "/possibilities",
        icon: Lightbulb,
    },
]

export function ContextMenuProvider({ children }: { children: React.ReactNode }) {
    return (
        <ContextMenu>
            <ContextMenuTrigger asChild>
                {children}
            </ContextMenuTrigger>
            <ContextMenuContent>
                {contextMenuItems.map((item) => (
                    <ContextMenuItem key={item.label} asChild>
                        <a href={item.href}>
                            <item.icon className="w-4 h-4 mr-2" />
                            {item.label}
                        </a>
                    </ContextMenuItem>
                ))}
            </ContextMenuContent>
        </ContextMenu>
    )
}
