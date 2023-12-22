#!/bin/bash

# Generate a random ID
randomid=$(echo $((RANDOM%10000)))

# Define the output file
output_file="screenshot_${randomid}.png"

# Run the curl command and save the output to the file
curl --location -s 'https://kprism.kfintech.com/ipostatus/captcha.ashx?=null' \
--header 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
--header 'Accept-Language: en-US,en;q=0.9' \
--header 'Cache-Control: no-cache' \
--header 'Connection: keep-alive' \
--header 'Cookie: _gcl_au=1.1.1203312273.1702976078; BIGipServer~Prod_web_bd3~KPRISM_PROD_WEB=rd3o00000000000000000000ffff0a29036fo443; ASP.NET_SessionId=m3y5updne3qw5nkznho41xn1; __AntiXsrfToken=971719bd06394d3a845eddcdaa5959cf; _gid=GA1.2.1856744422.1703254914; _ga=GA1.1.154013747.1702976077; _ga_68QR35XHGR=GS1.1.1703259778.4.0.1703259778.0.0.0; TS0113a171=0176bf02ac5067a28bc9f6b003b939deb919aa513b045bd95dd034c77d3173f2e4fa6f904d07be16aeebab703e8bc0adc95596982ec6accc1d586642d589fb5f84e5ecec593bc2bc04e6b09ddc24bde17cbe2c722de7093de1698c55b5b888b3017561325f957ba8e57aa47b1f6d209331369fa892; TS0113a171=0176bf02acfc8db27f3309f88c9f761c6898597a4fb838d68faa1d6561a94c4c39c20d62d594bb6fa41ef0551ee442eb3a773efdf1352857efa2c7e7328acf5cf14c53ee1f10d9c29c261957379dcf568cee42c7250007918e1baf6ab509c624f329d3cd184a0e5613f23669f1ad5c9dd7ea2cfc5f' \
--header 'DNT: 1' \
--header 'Pragma: no-cache' \
--header 'Sec-Fetch-Dest: document' \
--header 'Sec-Fetch-Mode: navigate' \
--header 'Sec-Fetch-Site: none' \
--header 'Sec-Fetch-User: ?1' \
--header 'Upgrade-Insecure-Requests: 1' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
--header 'sec-ch-ua: "Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "Windows"' \
-o "$output_file"

# Print the filename
echo "$output_file"
