"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
    const pathname = usePathname()

    // Desktop version with dock and tooltips
    const DesktopNav = () => (
        <TooltipProvider>
            <Dock direction="middle" className="fixed bottom-5 left-1/2 -translate-x-1/2 hidden md:flex">
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

    // Mobile version with native bottom navigation style
    const MobileNav = () => (
        <nav className="fixed pt-2 pb-3 bottom-0 left-0 right-0 flex md:hidden bg-background border-t border-border">
            <div className="flex w-full items-center justify-around">
                {DATA.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 transition-colors",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <item.icon className="size-5" />
                            <span className="text-xs font-medium text-center">{item.label}</span>
                        </Link>
                    )
                })}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 py-2 px-3 flex-1 transition-colors",
                        "text-muted-foreground hover:text-foreground"
                    )}
                >
                    {
                        theme === "light" ?
                        <Moon className="size-5" /> :
                        <Sun className="size-5" />

                    }
                    <span className="text-xs font-medium">Theme</span>
                </Button>
            </div>
        </nav>
    )

    return (
        <>
            <DesktopNav />
            <MobileNav />
        </>
    )
}
