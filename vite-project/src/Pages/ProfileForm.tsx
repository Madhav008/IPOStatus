import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { ipoStatusApi } from '@/services/ipostatusApi';

interface IpoList {
    company_id: string;
    companyname: string;
}

interface ProfileFormProps {
    loading: boolean;
    ipoList: IpoList[];
    selectedSite: string;
    handleIpoStatusData: (data: any) => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ loading, ipoList, selectedSite, handleIpoStatusData }) => {
    const baseURL = import.meta.env.VITE_APP_BACKEND_URL;

    const [iponame, setIponame] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [lloading, setLoading] = useState(false);
    const [data, setData] = useState<any | null>(null);

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
            // Handle the error appropriately (e.g., display an error message to the user)
        }
    };
    const handleFailed = async () => {
        try {
            const { failed } = data || {};
            if (failed) {
                // Create the download URL
                const downloadUrl = `${baseURL}/api${failed}`;

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
            // Handle the error appropriately (e.g., display an error message to the user)
        }
    };

    const getIpoData = async (url: string) => {
        if (!file) {
            toast.error('Please Upload the file');
            return null;
        }
        if (!iponame) {
            toast.error('Please Select the IPO name');
            return null;
        }
        setLoading(true);
        try {
            const formdata = new FormData();
            formdata.append('file', file);
            formdata.append('clientId', iponame);
            const response = await ipoStatusApi.getIpoData(url, formdata);


            if (response.status != 200) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const result = await response.data;
            setLoading(false);
            return result;
        } catch (error) {
            setLoading(false);
            console.error('Error:', error);
            return null;
        }
    };

    const getLinkinIpoData = async () => {
        const url = `linkintime`;
        return getIpoData(url);
    };

    const getBigShareIpoData = async () => {
        const url = `bigshare`;
        return getIpoData(url);
    };

    const getKarvyIpoData = async () => {
        const url = `Karvy`;
        return getIpoData(url);
    };

    const handleFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setFile(event.target.files[0]);
            toast.success('Successfully Uploaded!');
        }
    };

    async function handleSubmit(event: any) {
        setData(null)
        const loadingToastId = toast.loading('Getting the Data please wait ...')
        event.preventDefault();
        if (!loading) {
            if (selectedSite === 'Linkintime') {
                try {
                    const ldata = await getLinkinIpoData();

                    setData(ldata)
                    handleIpoStatusData(ldata)
                    toast.dismiss(loadingToastId);
                    toast.success("Data Fetched Successfully")
                } catch (error) {
                    toast.dismiss(loadingToastId);
                    console.error('Error while fetching data:', error);
                    toast.error('Error while fetching data. Please try again.');
                }
            } else if (selectedSite === 'Bigshare') {
                try {
                    const ldata = await getBigShareIpoData();
                    console.log(ldata)
                    setData(ldata)
                    handleIpoStatusData(ldata)
                    toast.dismiss(loadingToastId);
                    toast.success("Data Fetched Successfully")
                } catch (error) {
                    toast.dismiss(loadingToastId);
                    console.error('Error while fetching data:', error);
                    toast.error('Error while fetching data. Please try again.');
                }
            } else if (selectedSite === 'Karvy') {
                try {
                    const ldata = await getKarvyIpoData();
                    setData(ldata)
                    handleIpoStatusData(ldata)
                    toast.dismiss(loadingToastId);
                    toast.success("Data Fetched Successfully")
                } catch (error) {
                    toast.dismiss(loadingToastId);
                    console.error('Error while fetching data:', error);
                    toast.error('Error while fetching data. Please try again.');
                }
            } else {
                toast.dismiss(loadingToastId);
                toast.error("More sites coming soon");
            }
        }
    }

    if (loading) {
        return <div>Loading..</div>
    }
    return (
        <div>

            <div className="space-y-8">
                <div className='mt-0 '>
                    <Label className=' FormLabel  mx-1  text-md '>Choose the IPO</Label>
                    <Select name='iponame' onValueChange={(val) => { setIponame(val); }}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a name " />
                        </SelectTrigger>

                        <SelectContent>
                            <SelectGroup>
                                {ipoList?.map((item: any, index: any) => (
                                    <SelectItem key={index} value={item.company_id}>
                                        {item.companyname}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label className='mx-1 my-6 text-md '>Upload the File Here</Label>
                    <input hidden name='file' id="picture" type="file" className=' flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm  ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-white placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50' onChange={handleFile} />

                </div>
                <Button onClick={handleSubmit} className={`bg-secondary w-full text-primary-content ${lloading ? 'opacity-50 cursor-not-allowed' : ''} `} disabled={lloading}>
                    Submit
                </Button>
            </div>
            {data !== null && (
                <>
                    <Separator />
                    <Label>
                        <span className="font-bold text-xl ">
                            Generated Reports
                        </span>
                    </Label>
                    <Button onClick={handleDownload} className="bg-white w-max m-6">Download Excel</Button>
                    {data.failed !== null && (
                        <Button onClick={handleFailed} className="bg-white w-max m-6">
                            Download Failed PAN's
                        </Button>
                    )}
                </>
            )}

        </div>
    )
}

export default ProfileForm