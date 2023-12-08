const uploadImageAndReceiveResponse = async (imgPath) => {
    const apiUrl = 'https://locahost:5000/upload';  // Replace with the actual API endpoint

    const formData = new FormData();

    const imageFile = await fs.promises.readFile(imgPath);

    formData.append('image', imageFile);

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Assuming the response is in JSON format
        const responseData = await response.json();

        console.log('Response:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error:', error.message);
    }

}

export default uploadImageAndReceiveResponse