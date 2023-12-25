import SidebarPage from '@/components/SidebarPage'
import { ipoStatusApi } from '@/services/ipostatusApi'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const AdminPage = () => {
    const [email, setEmail] = useState('')
    const [name, setname] = useState('')
    const [pass, setpass] = useState('')
    const [user, setUser] = useState('')
    const [count, setcount] = useState('')
    const [userdata, setUserData] = useState([])

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


    async function updateUser() {
        const loadingToastId = toast.loading('Getting the Data please wait ...');

        var data = {
            "email": user,
            "count": count
        }

        try {
            const resp = await ipoStatusApi.updateUser(data);
            if (resp.status === 200) {
                toast.dismiss(loadingToastId);
                toast.success("Update Successfull")
            }
        } catch (error) {
            toast.dismiss(loadingToastId);
            console.error("Updation failed:", error);
            toast.error("Updation Failed")
        }
    }

    async function getUsers() {
        const loadingToastId = toast.loading('Getting the Data please wait ...');


        try {
            const resp = await ipoStatusApi.getUsers()
            setUserData(resp.data)
            if (resp.status === 200) {
                toast.dismiss(loadingToastId);
                toast.success("User Fetch Successfully")
            }
        } catch (error) {
            toast.dismiss(loadingToastId);
            console.error("User Fetch failed:", error);
            toast.error("User Fetch Failed")
        }
    }


    useEffect(() => {
        getUsers()
    }, [])



    return (

        <SidebarPage>
            <div className="rounded-xl border bg-card text-card-foreground shadow lg:w-[30%] h-[50%]">

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


            <div className="rounded-xl border bg-card text-card-foreground shadow lg:w-[30%] h-[50%]">

                <div className="flex flex-col p-6 space-y-1">
                    <h3 className="font-semibold tracking-tight text-2xl">Update the User</h3>

                    <p className="text-sm text-muted-foreground">Enter your email below to update the user</p>
                </div>

                <div className="p-6 pt-0 grid gap-4">

                    <div className="relative">

                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t">
                            </span>
                        </div>

                    </div>


                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >User Email</label>
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" placeholder="test@fanxange.com" type="email" value={user} onChange={(e) => setUser(e.target.value)} />

                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" >Count</label>
                        <input className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" type="text" value={count} onChange={(e) => setcount(e.target.value)} />
                    </div>
                </div>
                <div className="flex items-center p-6 pt-0">
                    <button onClick={updateUser} className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2 w-full">Update Count</button>
                </div>
            </div>


            <div className="flex items-start justify-center h-[80vh] w-[520px] overflow-auto">
                <div className="rounded-xl border bg-card text-card-foreground shadow">
                    <div className='flex items-center justify-between '>
                        <div className="flex flex-col space-y-1.5 p-6">
                            <h3 className="font-semibold leading-none tracking-tight">Users</h3>
                            <p className="text-sm text-muted-foreground">Total Users in the Platform.</p>

                        </div>
                        <div className='font-bold m-2'>
                            Count
                        </div>
                    </div>
                    <div className="p-6 pt-0 grid gap-6 ">


                        {userdata.map((e: any) => {
                            return <div className="flex items-center space-x-4 ">
                                <div className='w-[280px]'>
                                    <p className="text-sm font-medium leading-none">{e?.name}</p>
                                    <p className="text-sm text-muted-foreground">{e?.email}</p>

                                </div>
                                <p className="text-sm font-bold items-center text-center truncate"> {e?.count}</p>
                                {/*       <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 1C5.22386 1 5 1.22386 5 1.5C5 1.77614 5.22386 2 5.5 2H9.5C9.77614 2 10 1.77614 10 1.5C10 1.22386 9.77614 1 9.5 1H5.5ZM3 3.5C3 3.22386 3.22386 3 3.5 3H5H10H11.5C11.7761 3 12 3.22386 12 3.5C12 3.77614 11.7761 4 11.5 4H11V12C11 12.5523 10.5523 13 10 13H5C4.44772 13 4 12.5523 4 12V4L3.5 4C3.22386 4 3 3.77614 3 3.5ZM5 4H10V12H5V4Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg> */}
                            </div>
                        })}

                      
                    </div>
                </div>
            </div>
        </SidebarPage>
    )
}

export default AdminPage