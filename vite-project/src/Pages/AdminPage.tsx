import SidebarPage from '@/components/SidebarPage'
import { ipoStatusApi } from '@/services/ipostatusApi'
import { useState } from 'react'
import toast from 'react-hot-toast'

const AdminPage = () => {
    const [email, setEmail] = useState('')
    const [name, setname] = useState('')
    const [pass, setpass] = useState('')


    async function handleRegister() {
        const loadingToastId = toast.loading('Getting the Data please wait ...');

        var data = {
            "name": name,
            "email": email,
            "password": pass,
            "isAdmin": false
        }

        try {
            const resp = await ipoStatusApi.register(data);
            if (resp.status === 201) {
                toast.dismiss(loadingToastId);
                toast.success("Registration Successfull")
            }
        } catch (error) {
            toast.dismiss(loadingToastId);
            console.error("Registration failed:", error);
            toast.error("Registration Failed")
        }
    }

    return (

        <SidebarPage>
            <div className="rounded-xl border bg-card text-card-foreground shadow lg:w-[30%] h-[80vh]">

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
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder="Full Name" type="text" value={name} onChange={(e) => setname(e.target.value)} />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >Email</label>
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" id="email" placeholder="test@fanxange.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />

                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >Password</label>
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" id="password" type="password" value={pass} onChange={(e) => setpass(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0">
                    <button onClick={handleRegister} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full">Create account</button>
                </div>
            </div>
        </SidebarPage>
    )
}

export default AdminPage