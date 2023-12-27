import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import ProfileForm from './ProfileForm'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { ipoStatusApi } from '@/services/ipostatusApi'
import { Label } from '@/components/ui/label'
import SidebarPage from '@/components/SidebarPage'
import { useDispatch } from 'react-redux'
import { setUser } from '@/store/authSlice'
import { logAnalyticsEvent } from '@/store/firebase'


const Home = () => {
    logAnalyticsEvent("HOME PAGE OPENED");


    const [ipoList, setIpoList] = useState([])
    const [loading, setLoading] = useState(false)
    const [lsite, setSite] = useState('')
    const dispatch = useDispatch();

    async function getProfile() {
        const res = await ipoStatusApi.getProfile()
        dispatch(setUser(res.data))
    }

    const handleForm = async (site: any) => {

        try {

            setSite(site)
            setLoading(true)
            var res = await ipoStatusApi.getIpoList(site)
            setIpoList(res.data)
            setLoading(false)
            toast.success("Fecthing Complete")

        } catch (error: any) {
            setLoading(false)
            toast.error(error)
        }

    }



    const [failed, setFailed] = useState(0)
    const [total, settotal] = useState(0)
    const [Alloted, SetAlloted] = useState(0);
    const [NotAlloted, SetNotAlloted] = useState(0);



    const handleIpoStatusData = (data: any) => {
        setFailed(data.failed_data.length)
        settotal(data.failed_data.length + data.result.length)
        SetAlloted(0)
        SetNotAlloted(0)
        getProfile()

        if (data.site === 'Linkintime') {
            logAnalyticsEvent("LINKINTIME DATA REQUESTED ");

            data.result.forEach((ele: any) => {
                if (ele.Qty > 0) {
                    SetAlloted((prevAlloted: any) => prevAlloted + 1);
                } else {
                    SetNotAlloted((prevNotAlloted: any) => prevNotAlloted + 1)
                }
            });
        }

        if (data.site === 'Bigshare') {
            logAnalyticsEvent("BIGSHARE DATA REQUESTED ");

            data.result.forEach((ele: any) => {
                if (ele.Alloted != 'NON-ALLOTTE' && ele.Alloted != "") {
                    SetAlloted((prevAlloted: any) => prevAlloted + 1);
                } else {
                    SetNotAlloted((prevNotAlloted: any) => prevNotAlloted + 1)
                }
            });
        }

        if (data.site === 'Karvy') {
            logAnalyticsEvent("KARVY DATA REQUESTED ");

            data.result.forEach((ele: any) => {
                if (ele.Alloted && ele.Alloted != "0") {
                    SetAlloted((prevAlloted: any) => prevAlloted + 1);
                } else {
                    SetNotAlloted((prevNotAlloted: any) => prevNotAlloted + 1)
                }
            });
        }
    }



    return (
        <SidebarPage>

            <div className="flex items-start justify-between h-[80vh]">
                <div className="space-y-6  w-[100%] ">
                    <div>
                        <h3 className="text-lg font-medium">Allotment</h3>
                        <p className="text-sm text-muted-foreground">
                            Upload the Excel file With Column Name "PAN NO".
                        </p>
                    </div>
                    <Separator />
                    <div>
                        <Label className='text-md mb-2'>Choose the site</Label>
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

                    </div>
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
                            <div className="text-2xl font-bold text-center">{Alloted}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium w-[100px]">
                                Not Alloted
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-center">{NotAlloted}</div>
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
        </SidebarPage>
    )
}

export default Home