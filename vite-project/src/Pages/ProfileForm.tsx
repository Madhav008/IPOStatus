import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import toast from 'react-hot-toast';


const ProfileForm = ({ loading, ipoList, selectedSite, handleIpoStatusData }) => {



    const [iponame, setIponame] = useState('')

    const [file, setFile] = useState(null)
    const [lloading, setLoading] = useState(false)
    const [data, setData] = useState(null)

    const handleDownload = async () => {
        const { success } = data
        try {
            // Create the download URL
            const downloadUrl = `http://localhost:3001${success}`;

            // Open the download URL in a new tab
            const newTab = window.open(downloadUrl, '_blank');


            // Check if the new tab was successfully opened
            if (!newTab) {
                console.error('Failed to open new tab for download.');
                // Handle the error appropriately (e.g., display an error message to the user)
                return;
            }
        } catch (error) {
            console.error('Error during download:', error);
            // Handle the error appropriately (e.g., display an error message to the user)
        }
    }

    const handleFailed = async () => {
        const { failed } = data
        try {
            // Create the download URL
            const downloadUrl = `http://localhost:3001${failed}`;

            // Open the download URL in a new tab
            const newTab = window.open(downloadUrl, '_blank');


            // Check if the new tab was successfully opened
            if (!newTab) {
                console.error('Failed to open new tab for download.');
                // Handle the error appropriately (e.g., display an error message to the user)
                return;
            }
        } catch (error) {
            console.error('Error during download:', error);
            // Handle the error appropriately (e.g., display an error message to the user)
        }
    }

    const getLinkinIpoData = async () => {

        if (!file) {
            toast("Please Upload the file")
            return null
        }
        if (!iponame) {
            toast("Please Select the ipo name")
            return null
        }
        setLoading(true)
        try {
            var formdata = new FormData();
            formdata.append("file", file);
            formdata.append("clientId", iponame);

            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow'
            };

            const response = await fetch("http://localhost:3001/linkintime", requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
                setLoading(false)
            }

            const data = await response.json();
            setLoading(false)
            // Further processing with the data if needed
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null
            // Handle the error as needed, you might want to show an error message
        }
    };
    const getBigShareIpoData = async () => {

        if (!file) {
            toast("Please Upload the file")
            return null
        }
        if (!iponame) {
            toast("Please Select the ipo name")
            return null
        }
        setLoading(true)
        try {
            var formdata = new FormData();
            formdata.append("file", file);
            formdata.append("clientId", iponame);

            var requestOptions = {
                method: 'POST',
                body: formdata,
                redirect: 'follow'
            };

            const response = await fetch("http://localhost:3001/bigshare", requestOptions);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
                setLoading(false)
            }

            const data = await response.json();
            setLoading(false)
            // Further processing with the data if needed
            return data;
        } catch (error) {
            console.error('Error:', error);
            return null
            // Handle the error as needed, you might want to show an error message
        }
    };


    async function handleFile(event: any) {
        setFile(event.target.files[0])
        toast.success('Successfully Uploaded!')
    }
    async function handleSubmit(event: any) {
        setData(null)
        const loadingToastId = toast.loading('Getting the Data please wait ...')
        event.preventDefault();
        console.log(selectedSite);
        if (!loading) {
            if (selectedSite === 'Linkintime') {
                try {
                    const ldata = await getLinkinIpoData();
                    setData(ldata)
                    handleIpoStatusData(ldata)
                    toast.dismiss(loadingToastId);
                    toast.success("Data Fetched Successfully")
                } catch (error) {
                    console.error('Error while fetching data:', error);
                    toast.error('Error while fetching data. Please try again.');
                }
            } else if (selectedSite === 'Bigshare') {
                try {
                    const ldata = await getBigShareIpoData();
                    setData(ldata)
                    handleIpoStatusData(ldata)
                    toast.dismiss(loadingToastId);
                    toast.success("Data Fetched Successfully")
                } catch (error) {
                    console.error('Error while fetching data:', error);
                    toast.error('Error while fetching data. Please try again.');
                }
            } else {
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

                <Select name='iponame' onValueChange={(val) => { setIponame(val); }}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a name " />
                    </SelectTrigger>

                    <SelectContent>
                        <SelectGroup>
                            {ipoList.map((item: any, index: any) => (
                                <SelectItem key={index} value={item.company_id}>
                                    {item.companyname}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>

                <div>

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
                        <Button onClick={handleFailed} className="bg-white w-max m-6">Download Failed PAN's</Button>)
                    }
                </>
            )}

        </div>
    )
}

export default ProfileForm