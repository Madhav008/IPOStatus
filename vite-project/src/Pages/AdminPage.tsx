import SidebarPage from '@/components/SidebarPage'

const AdminPage = () => {
    return (
        <SidebarPage>
            <div className="rounded-xl border bg-card text-card-foreground shadow lg:w-[30%]">

                <div className="flex flex-col p-6 space-y-1">
                    <h3 className="font-semibold tracking-tight text-2xl">Create an account</h3>

                    <p className="text-sm text-muted-foreground">Enter your email below to create your account</p>
                </div>

                <div className="p-6 pt-0 grid gap-4">

                    <div className="relative">

                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t">
                            </span>
                        </div>

                    </div>
                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >Name</label>
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder="Full Name" type="text" />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >Email</label>
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" id="email" placeholder="test@fanxange.com" type="email" />

                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >Password</label>
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" id="password" type="password" />
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0">
                    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full">Create account</button>
                </div>
            </div>
        </SidebarPage>
    )
}

export default AdminPage