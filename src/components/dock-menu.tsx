"use client"

import Link from "next/link"
import { ArrowLeftRight, CircleDollarSign, FolderDown, LayoutDashboard, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Dock, DockIcon } from "./ui/dock"
import { useTheme } from "next-themes"

const DATA = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/expenses", icon: CircleDollarSign, label: "Expenses" },
    { href: "/groups", icon: FolderDown, label: "Groups" },
    { href: "/give-take", icon: ArrowLeftRight, label: "Give/Take" },
]


export default function DockMenu() {
    const { setTheme, theme } = useTheme()

    return (
        <TooltipProvider>
            <Dock direction="middle" className="fixed bottom-5 left-1/2 -translate-x-1/2">
                {DATA.map((item) => (
                    <DockIcon key={item.label}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href={item.href}
                                    aria-label={item.label}
                                    className={cn(
                                        buttonVariants({ variant: "ghost", size: "icon" }),
                                        "size-12 rounded-full"
                                    )}
                                >
                                    <item.icon className="size-4" />
                                </Link>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{item.label}</p>
                            </TooltipContent>
                        </Tooltip>
                    </DockIcon>
                ))}
                <Separator orientation="vertical" className="h-full" />
                <DockIcon>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                            >
                                <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                                <span className="sr-only">Toggle theme</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Toggle theme</p>
                        </TooltipContent>
                    </Tooltip>
                </DockIcon>
            </Dock>
        </TooltipProvider>
    )
}
