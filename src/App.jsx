import React, { useState, useEffect } from 'react';

const App = () => {
  const [ipoData, setIPOData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const url = 'http://localhost:3001/getStatus';

      try {
        const response = await fetch(url, {
          method: 'GET',
        });

        if (response.ok) {
          const data = await response.json();
          const htmlContent = parseXmlToHtml(data.d);
          setIPOData(htmlContent);
        } else {
          console.error('Failed to fetch data:', response.statusText);
        }
      } catch (error) {
        console.error('Error during fetch:', error);
      }
    };

    fetchData();
  }, []);
  const parseXmlToHtml = (xmlString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "text/xml");
    console.log(xmlDoc)
    const serializer = new XMLSerializer();

    const htmlString = serializer.serializeToString(xmlDoc);
    return { __html: htmlString };
  };
  return (
    <div>
      <h1>IPO Data Fetch Example</h1>
      {ipoData && <div dangerouslySetInnerHTML={ipoData} className="ipo-table" />}
    </div>
  );
};

export default App;
