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
        title: "Admin Pannel",
        href: "/admin",
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
                    <div className="sm:col-span-2 flex">
                        <a href="/" aria-label="Go home" title="Company" className="inline-flex items-center">
                            <svg className="w-8 text-deep-purple-accent-400" viewBox="0 0 24 24" stroke-linejoin="round" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" stroke="currentColor" fill="none">
                                <rect x="3" y="1" width="7" height="12"></rect>
                                <rect x="3" y="17" width="7" height="6"></rect>
                                <rect x="14" y="1" width="7" height="6"></rect>
                                <rect x="14" y="11" width="7" height="12"></rect>
                            </svg>
                            <span className="ml-2 text-xl font-bold tracking-wide uppercase">IPO STATUS CHECK</span>
                        </a>

                    </div>
                    {/* <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Check the IPO Status By Uploading the Excel with that includes the PAN.
                    </p> */}
                </div>

                <div className='flex flex-col gap-2 font-md'>
                    <span className='font-bold '>Welcome {user?.name}</span>
                    <span className='font-bold font-mono'>
                        <span >Pan Count</span>
                        <span className='font-bold  text-green-500 p-2'>
                            {user?.count}
                        </span>
                    </span>

                </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
                <aside className="-mx-4 lg:w-1/5">
                    <SidebarNav items={user?.isAdmin ? sidebarNavItems : sidebarNavItems.filter(item => item.title !== 'Admin Pannel')} />
                </aside>
                {children}
            </div>

        </div>


    )
}

export default SidebarPage