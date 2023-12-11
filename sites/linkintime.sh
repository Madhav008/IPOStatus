#!/bin/bash


# Check if all required arguments are provided
if [ "$#" -ne 4 ]; then
    # Assign command-line arguments to variables
    clientId="$1"
    pan="$2"
    keyWord="$3"
fi

# # Define variables
# clientId='11717'
# pan='ASGPP6175M'
# keyWord='PAN'

# Execute curl command
curl --insecure 'https://linkintime.co.in/mipo/IPO.aspx/SearchOnPan' \
-H 'authority: linkintime.co.in' \
-H 'accept: application/json, text/javascript, */*; q=0.01' \
-H 'accept-language: en-US,en;q=0.9' \
-H 'cache-control: no-cache' \
-H 'content-type: application/json; charset=UTF-8' \
-H 'cookie: _gid=GA1.3.1883102452.1701604269; _ga=GA1.3.1184761687.1701604269; _ga_TH4DT3SZPV=GS1.1.1701604269.1.1.1701604806.0.0.0; ASP.NET_SessionId=nrrplqekalwgf455r3rfujnm' \
-H 'dnt: 1' \
-H 'origin: https://linkintime.co.in' \
-H 'pragma: no-cache' \
-H 'referer: https://linkintime.co.in/mipo/Ipoallotment.html' \
-H 'sec-ch-ua: "Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"' \
-H 'sec-ch-ua-mobile: ?0' \
-H 'sec-ch-ua-platform: "Windows"' \
-H 'sec-fetch-dest: empty' \
-H 'sec-fetch-mode: cors' \
-H 'sec-fetch-site: same-origin' \
-H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36' \
-H 'x-requested-with: XMLHttpRequest' \
--data-raw "{\"clientid\": \"$clientId\",\"PAN\": \"$pan\",\"key_word\": \"$keyWord\"}" \
--compressed
