import { SidebarNav } from '@/components/sidebar-nav'
import { Separator } from '@/components/ui/separator'
import { RootState } from '@/store/store';
import { useSelector } from 'react-redux'
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



const SidebarPage = ({ children }: any) => {

    const { user } = useSelector((state: RootState) => state?.auth)


    return (


        <div className="space-y-6 p-10 pb-16">
            <div className="space-y-0.5 flex align-middle  items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Check the IPO Status By Uploading the Excel with that includes the PAN.
                    </p>
                </div>

                <div className='flex flex-col gap-2'>
                    <span className='font-bold text-lg'>Welcome {user?.name}</span>
                    <span>
                        <span className='text-lg '>Remaning Pan Count:-</span>
                        <span className='font-bold text-xl text-green-500 p-2'>
                            {user?.count}
                        </span>
                    </span>

                </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SidebarNav items={sidebarNavItems} />
                </aside>
                {children}
            </div>
        </div>


    )
}

export default SidebarPage