#!/bin/bash

# Check if a cookie argument is provided
if [ -z "$1" ]; then
  echo "Usage: $0 <cookie>"
  exit 1
fi

# Capture the cookie argument
cookie="$1"

# Generate a random ID
randomid=$(echo $((RANDOM%10000)))

# Define the output file
output_file="screenshot_${randomid}.png"

curl --location -s 'https://kosmic.kfintech.com/ipostatus/captcha.ashx?q=null' \
--header 'Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8' \
--header 'Accept-Language: en-US,en;q=0.9' \
--header 'Connection: keep-alive' \
--header "Cookie: $cookie" \
--header 'Referer: https://kosmic.kfintech.com/' \
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

