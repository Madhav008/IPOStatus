#!/bin/bash

# Generate a random ID
randomid=$(echo $((RANDOM%10000)))

# Define the output file
output_file="screenshot_${randomid}.png"

# Run the curl command and save the output to the file
curl --location -s 'https://kprism.kfintech.com/ipostatus/captcha.ashx?=null' \
--header 'Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' \
--header 'Accept-Language: en-US,en;q=0.9' \
--header 'Connection: keep-alive' \
--header 'Cookie: ASP.NET_SessionId=pnixijnc3qfvw1uttuycgwyg; __AntiXsrfToken=7ab7d4f88e7f4689a4685658dfadb26a; BIGipServer~Prod_web_bd3~KPRISM_PROD_WEB=rd3o00000000000000000000ffff0a29036fo443; TS0113a171=0176bf02acd356236eb4ebcb19a9a558b8135cbd9f17aa6bd018c56e80b75615694b6be2dfe3e274c0db4091c4a48ce4339e79d01542568efe2ded60a23f246da6b02c9f0bb2acb0b0fd2905e4444a1b36516cabde7cbf901256fcc027c7ac72bf509b4fa09f5ef8dd583c526206d3120866fc0df5; TS0113a171=0176bf02ac61e8146717fd857308a68ac29706f2e5cd8c92594d07ed53b4b3008a5623e65a885ea19af5799c5aa71edde8206dc0b0753d603cbf16d6bdf324ba3fae5514bb7cf1508ae6cad108203ee38ef145439efcfdad3f53f8136896a45d14a43a58f021f74d421dc0fdde026f6440713c9faf' \--header 'Referer: https://kprism.kfintech.com/' \
--header 'Sec-Fetch-Dest: image' \
--header 'Sec-Fetch-Mode: no-cors' \
--header 'Sec-Fetch-Site: same-origin' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
--header 'sec-ch-ua: "Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "Windows"' \
-o "$output_file"

# Print the filename
echo "$output_file"


