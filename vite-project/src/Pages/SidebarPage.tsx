import { SidebarNav } from '@/components/sidebar-nav'
import { Separator } from '@/components/ui/separator'
import Home from './Home'
const sidebarNavItems = [
    {
        title: "Check Allotment",
        href: "/home",
    },
    {
        title: "Premium Service ",
        href: "/account",
    },
    {
        title: "Appearance",
        href: "/home/appearance",
    },
    // {
    //     title: "Notifications",
    //     href: "/home/notifications",
    // },
    // {
    //     title: "Display",
    //     href: "/home/display",
    // },
]
const SidebarPage = () => {
    return (
        <div className="space-y-6 p-10 pb-16">
            <div className="space-y-0.5">
                <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Check the IPO Status By Uploading the Excel with that includes the PAN.
                </p>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SidebarNav items={sidebarNavItems} />
                </aside>
                <Home />
            </div>
        </div>
    )
}

export default SidebarPage