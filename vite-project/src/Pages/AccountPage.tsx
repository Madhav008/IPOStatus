import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';
import { ipoStatusApi } from '@/services/ipostatusApi';
import SidebarPage from '@/components/SidebarPage';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/authSlice';

interface AccountPageProps { }

interface IpoStatusData {
    success: string;
    result: Array<any>;
    // Add other properties based on your actual response structure
}

const AccountPage: React.FC<AccountPageProps> = () => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const baseURL: string = import.meta.env.VITE_APP_BACKEND_URL;

    const [file, setFile] = useState<File | null>(null);
    const [folders, setFolders] = useState<string[]>([]);
    const [lloading, setLoading] = useState<boolean>(false);
    const [company, setCompany] = useState<string>('');
    const [data, setData] = useState<IpoStatusData | null>(null);
    const [Alloted, setAlloted] = useState(0);
    const [NotAlloted, setNotAlloted] = useState(0);
    const [Proccessed, setProccessed] = useState(0);


    const dispatch = useDispatch();

    async function getProfile() {
        const res = await ipoStatusApi.getProfile()
        dispatch(setUser(res.data))
    }

    const handleDownload = async () => {
        try {
            const { success } = data || {};
            if (success) {
                // Create the download URL
                const downloadUrl = `${baseURL}/api${success}`;

                // Open the download URL in a new tab
                const newTab = window.open(downloadUrl, '_blank');

                // Check if the new tab was successfully opened
                if (!newTab) {
                    console.error('Failed to open new tab for download.');
                    // Handle the error appropriately (e.g., display an error message to the user)
                    return;
                }
            }
        } catch (error) {
            console.error('Error during download:', error);
            // Handle the error appropriately
        }
    };

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
            toast.success('Successfully Uploaded!');
        }
    };

    const checkCountStatus = async (ipoData: IpoStatusData) => {
        setAlloted(0)
        setNotAlloted(0)
        setProccessed(0)
        setProccessed(ipoData?.result.length);
        getProfile()
        ipoData?.result.forEach((pan: any) => {
            console.log(pan)
            if (pan.ALLOT && pan.ALLOT != "0") {
                setAlloted((prevAlloted) => prevAlloted + 1)
            } else {
                setNotAlloted((prevNotAllotted) => prevNotAllotted + 1)
            }
        });
    }

    async function handleSubmit(event: React.FormEvent) {
        const loadingToastId = toast.loading('Getting the Data please wait ...');
        event.preventDefault();

        try {
            const formData = new FormData();
            formData.append('file', file as Blob);
            formData.append('company_name', company);
            const response = await ipoStatusApi.getExcelResult(formData);

            if (response.status !== 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.data;
            setData(result);
            checkCountStatus(result)
            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            console.error('Error:', error);
            return null;
        } finally {
            toast.dismiss(loadingToastId);
        }
    }

    useEffect(() => {
        setLoading(true);

        const loadingToastId = toast.loading('Getting the Companies please wait ...');
        async function getTheData() {
            try {
                const res = await ipoStatusApi.getFolders();
                setFolders(res.data.folders);
                setLoading(false);
                toast.success('Companies Fetched Successfully');
            } catch (error) {
                setLoading(false);
                toast.error('Error while fetching the companies. Try again ...');
            } finally {
                toast.dismiss(loadingToastId);
            }
        }
        getTheData();
    }, []);



    if (lloading) {
        return <div>Loading...</div>;
    }

    return (
        <SidebarPage>
            <div className="flex items-start justify-between h-[80vh]">
                <div className="space-y-6  w-[100%] ">
                    <div>
                        <h3 className="text-lg font-medium">Premium </h3>
                        <p className="text-sm text-muted-foreground">
                            Upload the Excel.
                        </p>
                    </div>
                    <Separator />
                    <div>
                        <Label className='text-md mb-2'>Choose the site</Label>
                        <Select value={company} name='company' onValueChange={(val) => { setCompany(val); }}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select The Site" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {folders.map((item) => (
                                        <SelectItem key={item} value={item}>
                                            {item}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>

                    </div>
                    <div>
                        <Label className='mx-1 my-6 text-md '>Upload the File Here</Label>
                        <input ref={fileInputRef}
                            hidden name='file' id="picture" type="file" className=' flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm  ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50' onChange={handleFile} />

                    </div>
                    <Button onClick={handleSubmit} className={`bg-secondary w-full text-primary-content ${lloading ? 'opacity-50 cursor-not-allowed' : ''} `} disabled={lloading}>
                        Submit
                    </Button>
                    {data !== null && (
                        <>
                            <Separator />
                            <Label>
                                <span className="font-bold text-xl ">
                                    Generated Reports
                                </span>
                            </Label>
                            <Button onClick={handleDownload} className="bg-white w-max m-6">Download Excel</Button>
                        </>
                    )}
                </div>
                <div className=" flex flex-wrap ml-[200px] gap-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium w-[100px]">
                                Total PAN Processed
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-center">{Proccessed}</div>
                        </CardContent>
                    </Card>


                    <Card>
                        <CardHeader className="flex flex-row items-center text-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium w-[100px]">
                                Error in Processing
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-center">{0}</div>
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
                </div>
            </div>
        </SidebarPage>
    )
}

export default AccountPage