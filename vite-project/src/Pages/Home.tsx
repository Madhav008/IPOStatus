import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProfileForm from './ProfileForm'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import toast from 'react-hot-toast'

const Home = () => {
    const [ipoList, setIpoList] = useState([])
    const [loading, setLoading] = useState(false)
    const [lsite, setSite] = useState('')
    const fetchData = async (selectedSite: string) => {
        const res = await fetch(`http://localhost:3001/getIpoList/${selectedSite}`);
        const data = await res.json();
        // Further processing with the data if needed
        return data;
    };

    const handleForm = async (site: any) => {

        try {
            setSite(site)
            setLoading(true)
            var data = await fetchData(site)
            setIpoList(data)
            console.log(data)
            setLoading(false)
            toast.success("Fecthing Complete")

        } catch (error:any) {
            setLoading(false)
            toast.error(error)
        }

    }



    const [failed, setFailed] = useState(0)
    const [total, settotal] = useState(0)

    

    const handleIpoStatusData = (data:any) => {
        console.log(data)
        setFailed(data.failed_data.length)
        settotal(data.failed_data.length + data.result.length)
    }



    return (
        <div className="flex items-center justify-between ">
            <div className="space-y-6  w-[100%] ">
                <div>
                    <h3 className="text-lg font-medium">Allotment</h3>
                    <p className="text-sm text-muted-foreground">
                        Upload the Excel file With Column Name "PAN NO".
                    </p>
                </div>
                <Separator />

                <Select onValueChange={handleForm}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select The Site" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value="Linkintime">Linkin Time</SelectItem>
                            <SelectItem value="Bigshare">Big Share</SelectItem>
                            <SelectItem value="Karvy">Karvy</SelectItem>
                            <SelectItem value=".">More Sites Comming Soon...</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <Separator />
                <ProfileForm loading={loading} ipoList={ipoList} selectedSite={lsite} handleIpoStatusData={handleIpoStatusData} />
            </div>
            <div className=" flex flex-wrap ml-[200px] gap-2">
                <Card>
                    <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium w-[100px]">
                            Total PAN Processed
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-center">{total}</div>
                    </CardContent>
                </Card>


                <Card>
                    <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium w-[100px]">
                            Error in Processing
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-center">{failed}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium w-[100px]">
                            Alloted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-center">45</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium w-[100px]">
                            Not Alloted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-center">45</div>
                    </CardContent>
                </Card>
                {/*       <Card>
                    <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium w-[100px]">
                            Average Share Per App
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-center">45</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium w-[100px]">
                            Total Share Alloted
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-center">45</div>
                    </CardContent>
                </Card> */}


            </div>
        </div>

    )
}

export default Home