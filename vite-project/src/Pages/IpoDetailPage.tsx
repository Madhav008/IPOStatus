import IpoChart from '@/components/IpoChart';
import { Card } from '@/components/ui/card';
import { ipoStatusApi } from '@/services/ipostatusApi';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';

import { useParams } from 'react-router-dom';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import { logAnalyticsEvent } from '@/store/firebase';


const IpoDetailPage = () => {


    const { ipoid } = useParams();
    const [chart, setChart] = useState([])
    const [ipodata, setIpoData] = useState<any>(null)


    async function getChartData() {
        const resp = await ipoStatusApi.getipopremium(ipoid + '')
        setChart(resp.data)
    }

    async function getIpoData() {
        const resp = await ipoStatusApi.getipolistdata(ipoid + '')
        if (resp.data.status) {
            setIpoData(resp.data.data)
        }
    }

    useEffect(() => {
        logAnalyticsEvent("IPO DETAIL PAGE OPENED");
        getChartData()
        getIpoData()
    }, [])
    const { user } = useSelector((state: RootState) => state?.auth)

    return (
        <div>

            <div className=" flex items-center justify-between m-auto p-6">

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
            <IpoChart name={ipodata?.name} chartdata={chart} />
            <div className='max-w-6xl items-center text-start  m-auto'>

                <div className='flex text-lg text-center m-6 font-semibold font-mono justify-center align-middle items-center'>
                    <Avatar>
                        <AvatarImage src={ipodata?.icon_url} alt="@shadcn" />
                        <AvatarFallback>CN</AvatarFallback>
                    </Avatar>

                    <h1 className='text-lg text-center m-6 font-semibold font-mono'>
                        {ipodata?.name}
                    </h1>
                </div>
                <Card className='m-6'>
                    <div className='p-1 m-4' dangerouslySetInnerHTML={{ __html: ipodata?.subscription }} />
                </Card>
                <Card className='m-6'>
                    <div className='p-1 m-4' dangerouslySetInnerHTML={{ __html: ipodata?.about }} />
                </Card>
                <Card className='m-6'>
                    <div className='p-1 m-4' dangerouslySetInnerHTML={{ __html: ipodata?.registrar }} />
                </Card>
                <Card className='m-6'>
                    <div className='p-1 m-4' dangerouslySetInnerHTML={{ __html: ipodata?.lead_manager }} />
                </Card>
                <Card className='m-6'>
                    <div className='p-1 m-4' dangerouslySetInnerHTML={{ __html: ipodata?.address }} />
                </Card>

            </div>
        </div>
    )
}

export default IpoDetailPage