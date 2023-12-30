import SidebarPage from "@/components/SidebarPage"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ipoStatusApi } from "@/services/ipostatusApi"
import { useEffect, useState } from "react"

const IpoPage = () => {
    const [ipolist, setIpolist] = useState([])

    async function getIpoList() {
        const res = await ipoStatusApi.getlist()
        if (res.data.status) {
            setIpolist(res.data.data);
        }
    }

    useEffect(() => {
        getIpoList()
    }, [])

    return (
        <SidebarPage>
            <div className="flex items-center justify-center w-full h-[70vh]">
                <div className="rounded-xl border bg-card text-card-foreground shadow ">
                    <div className="flex flex-col space-y-1.5 p-6">
                        <h3 className="font-semibold leading-none tracking-tight">IPO LIST</h3>
                        <p className="text-sm text-muted-foreground"> Mainline and SME IPO List.</p>
                    </div>
                    <div className="p-6 pt-0 grid gap-6 max-h-[60vh] overflow-auto ">
                        {ipolist.map((ipo: any) => (
                            <Card className="w-full">
                                <div key={ipo?.id} className=" flex flex-col items-start">
                                    <div className="px-6 mt-4 flex items-center ">
                                        <div>
                                            <p className="text-sm font-medium leading-none">{ipo.name}</p>
                                            <p className="text-sm text-muted-foreground mt-1">{formatDate(ipo.open)} - {formatDate(ipo.close)}</p>
                                        </div>
                                    </div>
                                    <Separator className="my-4 w-full" />
                                    <div className="mb-4 flex items-center justify-start gap-4 px-6">
                                        <span className="relative flex h-14 w-14 shrink-0 overflow-hidden">
                                            <img className="aspect-square h-full w-full" src={ipo.icon_url} alt={ipo.name} />
                                        </span>
                                        <div >
                                            <div>Price: {ipo.min_price} - {ipo.max_price}</div>
                                            <div className="font-bold text-green-500">Premium: {ipo.premium}</div>
                                            <div>Lot: {ipo.lot_size}</div>
                                        </div>
                                    </div>
                                    <Separator className="my-4 w-full" />
                                    <div className="mb-4 flex items-center justify-start gap-4 px-6 w-full text-sm md:text-lg">
                                        <div className="w-full" >
                                            <div className="flex justify-between w-full items-center">
                                                <div>Allotment Date *</div>
                                                <div>{ipo.allotment_date}</div>

                                            </div>
                                            <div className="flex justify-between m-auto w-full items-center text-sm md:text-lg">
                                                <div>Listing Date *</div>
                                                <div>{ipo.listing_date}</div>

                                            </div>
                                            <div className="flex justify-between  m-auto items-center text-sm md:text-lg">
                                                <div>Est. Profit **</div>
                                                <div>
                                                    {`${ipo.premium * ipo.lot_size} (${ipo.premium_percentage?.toFixed(2)}%)`}
                                                </div>

                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>

                </div>
            </div>

        </SidebarPage>
    )
}
function formatDate(inputDate: any) {
    const dateObject = new Date(inputDate);

    const day = dateObject.getDate();
    const month = new Intl.DateTimeFormat("en", { month: "short" }).format(dateObject);

    return `${day} ${month}`;
}


export default IpoPage