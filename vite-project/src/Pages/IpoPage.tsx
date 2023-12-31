import SidebarPage from "@/components/SidebarPage"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ipoStatusApi } from "@/services/ipostatusApi"
import { filterByType, setlist } from "@/store/ipoSlice"
import { useEffect } from "react"
import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { logAnalyticsEvent } from "@/store/firebase"

const IpoPage = () => {

    const dispatch = useDispatch();
    const { list: ipolist, selectedType } = useSelector((state: any) => state.ipolist);
    async function getIpoList() {
        const res = await ipoStatusApi.getlist()
        if (res.data.status) {
            dispatch(setlist(res.data.data));
            dispatch(filterByType('EQ'));
        }

    }

    // Function to handle checkbox changes
    const handleCheckboxChange = (type: string) => {
        dispatch(filterByType(type));
    };

    useEffect(() => {
        getIpoList()
        logAnalyticsEvent("IPO PAGE OPENED");

    }, [])

    return (
        <SidebarPage>
            <div className="items-center justify-center h-[80vh] w-full ">
                <div className="flex justify-between space-y-1.5 p-6">
                    <div>
                        <h3 className="font-semibold leading-none tracking-tight">IPO LIST</h3>
                        <p className="text-sm text-muted-foreground"> Mainline and SME IPO List.</p>
                    </div>
                    <div>

                        {/* Complete this code if selected type is EQ then check Mainboard other wise vise versa */}
                        <div className="flex items-center space-x-2">
                            {/* Use selectedType to determine the checked state */}
                            <Checkbox
                                id="MAINBOARD"
                                checked={selectedType === 'EQ'}
                                onClick={() => handleCheckboxChange('EQ')}
                            />
                            <label
                                htmlFor="MAINBOARD"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                MAINBOARD
                            </label>

                            {/* Use selectedType to determine the checked state */}
                            <Checkbox
                                id="SME"
                                checked={selectedType === 'SME'}
                                onClick={() => handleCheckboxChange('SME')}
                            />
                            <label
                                htmlFor="SME"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                SME
                            </label>
                        </div>
                    </div>
                </div>

                <div className="p-6 pt-0 grid gap-6 max-h-[60vh] overflow-auto w-full">
                    {ipolist.map((ipo: any) => (
                        <Card >
                            <div key={ipo?.id} className=" flex flex-col items-start">
                                <div className="px-6 mt-4 flex items-center justify-between align-middle w-full">
                                    <div>
                                        <p className="text-sm font-medium leading-none">{ipo.name}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{formatDate(ipo.open)} - {formatDate(ipo.close)}</p>
                                    </div>


                                    <div> <Link to={`/ipo/${ipo.id}`}
                                    > <Button variant="outline" className="text-xs md:text-base md:p-6  h-4 w-2 border-0">VIEW</Button></Link></div>

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