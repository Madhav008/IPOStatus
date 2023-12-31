import { SidebarNav } from '@/components/sidebar-nav'
import { Separator } from '@/components/ui/separator'
import { ipoStatusApi } from '@/services/ipostatusApi';
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
    {
        title: "IPO List",
        href: "/ipolist",
    },
    // {
    //     title: "Display",
    //     href: "/home/display",
    // },
]



const SidebarPage = ({ children }: any) => {

    const { user } = useSelector((state: RootState) => state?.auth)


    async function handleLogout() {
        await ipoStatusApi.logout();
        window.location.href = '/';
    }

    return (


        <div className="p-6 w-full">
            <div className=" flex items-center justify-between m-auto">

                <div>
                    <div className="sm:col-span-2 flex ">
                        <a href="/" aria-label="Go home" title="Company" className="inline-flex items-center">
                            <svg className="w-8 text-deep-purple-accent-400" viewBox="0 0 24 24" stroke-linejoin="round" stroke-width="2" stroke-linecap="round" stroke-miterlimit="10" stroke="currentColor" fill="none">
                                <rect x="3" y="1" width="7" height="12"></rect>
                                <rect x="3" y="17" width="7" height="6"></rect>
                                <rect x="14" y="1" width="7" height="6"></rect>
                                <rect x="14" y="11" width="7" height="12"></rect>
                            </svg>
                            <span className="ml-2 text-xs md:text-base font-bold tracking-wide uppercase">IPO STATUS CHECK</span>
                        </a>

                    </div>
                    {/* <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-muted-foreground">
                        Check the IPO Status By Uploading the Excel with that includes the PAN.
                    </p> */}
                </div>

                <div className='flex gap-2 font-md  justify-between  flex-wrap ml-2 text-sm md:text-base'>
                    <div className='flex flex-col'>
                        <span className='font-bold font-mono flex items-center text-center justify-center '>
                            <span >Daily Count:</span>
                            <span className='font-bold  text-green-500 px-2'>
                                {user?.count}
                            </span>
                        </span>
                        <span className='font-bold font-mono'>
                            <span >Total Count</span>
                            <span className='font-bold  text-green-500 p-2'>
                                {user?.total_count}
                            </span>
                        </span>

                    </div>
                    <span className='ml-0 md:ml-6 font-bold'>Welcome {user?.name}</span>
                </div>
            </div>
            <Separator className="my-6" />
            <div className="flex flex-col lg:flex-row ">
                <aside className="-mx-4 lg:w-1/5 flex flex-col justify-between mr-2">
                    <SidebarNav items={user?.isAdmin ? sidebarNavItems : sidebarNavItems.filter(item => item.title !== 'Admin Pannel')} />
                    <div onClick={handleLogout} className='p-2  text-lg rounded-lg bg-primary-foreground  flex items-center gap-4 mb-10 mt-2'>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 1C2.44771 1 2 1.44772 2 2V13C2 13.5523 2.44772 14 3 14H10.5C10.7761 14 11 13.7761 11 13.5C11 13.2239 10.7761 13 10.5 13H3V2L10.5 2C10.7761 2 11 1.77614 11 1.5C11 1.22386 10.7761 1 10.5 1H3ZM12.6036 4.89645C12.4083 4.70118 12.0917 4.70118 11.8964 4.89645C11.7012 5.09171 11.7012 5.40829 11.8964 5.60355L13.2929 7H6.5C6.22386 7 6 7.22386 6 7.5C6 7.77614 6.22386 8 6.5 8H13.2929L11.8964 9.39645C11.7012 9.59171 11.7012 9.90829 11.8964 10.1036C12.0917 10.2988 12.4083 10.2988 12.6036 10.1036L14.8536 7.85355C15.0488 7.65829 15.0488 7.34171 14.8536 7.14645L12.6036 4.89645Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                        Logout
                    </div>
                </aside>
                {children}
            </div>

        </div>


    )
}

export default SidebarPage