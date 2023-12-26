#!/bin/bash

# Check if all required arguments are provided
if [ "$#" -ne 4 ]; then
    # Assign command-line arguments to variables
    IPO_CODE="$1"
    PAN="$2"
    CAPTCHA="$3"
fi

# Define variables
# IPO_CODE='INOL~inox_indiapleqfv2~0~20/12/2023~20/12/2023~EQT'
# PAN='AEMPO5769C'
# CAPTCHA='304512'


curl --location 'https://kprism.kfintech.com/ipostatus/' \
--header 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
--header 'Accept-Language: en-US,en;q=0.9' \
--header 'Cache-Control: max-age=0' \
--header 'Connection: keep-alive' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--header 'Cookie: ASP.NET_SessionId=pnixijnc3qfvw1uttuycgwyg; __AntiXsrfToken=7ab7d4f88e7f4689a4685658dfadb26a; BIGipServer~Prod_web_bd3~KPRISM_PROD_WEB=rd3o00000000000000000000ffff0a29036fo443; TS0113a171=0176bf02acd356236eb4ebcb19a9a558b8135cbd9f17aa6bd018c56e80b75615694b6be2dfe3e274c0db4091c4a48ce4339e79d01542568efe2ded60a23f246da6b02c9f0bb2acb0b0fd2905e4444a1b36516cabde7cbf901256fcc027c7ac72bf509b4fa09f5ef8dd583c526206d3120866fc0df5' \
--header 'Origin: https://kprism.kfintech.com' \
--header 'Referer: https://kprism.kfintech.com/' \
--header 'Sec-Fetch-Dest: document' \
--header 'Sec-Fetch-Mode: navigate' \
--header 'Sec-Fetch-Site: same-origin' \
--header 'Sec-Fetch-User: ?1' \
--header 'Upgrade-Insecure-Requests: 1' \
--header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
--header 'sec-ch-ua: "Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"' \
--header 'sec-ch-ua-mobile: ?0' \
--header 'sec-ch-ua-platform: "Windows"' \
--data-urlencode '__EVENTTARGET=btn_submit_query' \
--data-urlencode '__EVENTARGUMENT=' \
--data-urlencode '__LASTFOCUS=' \
--data-urlencode '__VIEWSTATE=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' \
--data-urlencode '__VIEWSTATEGENERATOR=7CE23556' \
--data-urlencode '__VIEWSTATEENCRYPTED=' \
--data-urlencode '__EVENTVALIDATION=7tFydM1hCYH2xvVLcmOlAMdIaf1fATcUQObaRoQjFrIjAE2PgeuPv+DUtAk9cJhiMm2SsAmhTQ36gLvmp31XkamXv9RcS9czwOSU0xXS247A5yCQKbcC5BA159x1RUKBluj9YUZMWsBoBXA3/Tb/oR+N+HXyz6shzniu98/X1aHGSsYDceHKOWVdut1/ccVKopSb76GhlqMoWpi3L+mWYEF/J9B8dBJr9RakG02JcfGFWsCQ7A9dlzjzefPZLtP/Du6vtS5yuaeJN2AXqPm5IEu60+fabCJ7hPF+wHxfrU1WYiZT4vQfmsVdhoi7Vyr0yDzSsArcEro7Y9JHCSbmcJ824iyxnAWzqioBPQG0OjXlEIiP9BWe+wi95/TqOh3J+dm1UkUfE8rSYeN/1d7OrH9bKE+vuJdoReVFcmprSAeT+PGrHeP9Kk7SfR00Kp5hLvWemqhn53b0l1+ybKSmXYIrJhu59rGsHltM8gLRjY92cZaAQyoIZxg/QMAx1nudE+cHpqJYhbKp33l4CXwUw0X9ts8NCD+glQzOvcfA0NR7teH/1OfnxEnCtAst4vztU+LPcq/5fcCeQVnD2n+iiZGB/7bif8/0YJCBtBF1AKBwU38kPhtmJ8OFqGbDi9iEpGo8+Q2BC21aXwRDoWT6PqLYUsvqn/++Qj4xHW2U+TgrC7NTLLxCq8GAyq+Vb29ZPSctfz9A48WpSLLgoidLeRw67XmbSyuPjwVjb5rulKgJt8wDFhhbgvH2S2btvrR56ER6SC52sC5GXwPqyPHppd+AwGEO3U595JGTc6eQKUbtk1j8sFwjGrqPcZUzV4nesH/9a/Z0OI+FvbtQq+LxUw==' \
--data-urlencode 'chkOnOff=on' \
--data-urlencode "ddl_ipo=$IPO_CODE" \
--data-urlencode 'query=pan' \
--data-urlencode 'txt_applno=' \
--data-urlencode 'ddl_depository=N' \
--data-urlencode 'txt_nsdl_dpid=' \
--data-urlencode 'txt_nsdl_clid=' \
--data-urlencode 'txt_cdsl_clid=' \
--data-urlencode 'txt_pan=riDVGvPsdqIIWl0XeJbHOA==' \
--data-urlencode "txt_captcha=$CAPTCHA" \
--data-urlencode 'txt_conf_pan=' \
--data-urlencode '_h_query=pan' \
--data-urlencode 'encrypt_payload=Y' \
--data-urlencode 'req_src='


# curl -L --insecure 'https://kprism.kfintech.com/ipostatus/' \
# --header 'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' \
# --header 'Accept-Language: en-US,en;q=0.9' \
# --header 'Cache-Control: no-cache' \
# --header 'Connection: keep-alive' \
# --header 'Content-Type: application/x-www-form-urlencoded' \
# --header 'Cookie: _gcl_au=1.1.1203312273.1702976078; BIGipServer~Prod_web_bd3~KPRISM_PROD_WEB=rd3o00000000000000000000ffff0a29036fo443; ASP.NET_SessionId=m3y5updne3qw5nkznho41xn1; __AntiXsrfToken=971719bd06394d3a845eddcdaa5959cf; _gid=GA1.2.1856744422.1703254914; _ga_68QR35XHGR=GS1.1.1703254914.3.0.1703254914.0.0.0; _ga=GA1.1.154013747.1702976077; TS0113a171=0176bf02ac9b0ba69bae999659958eb1e66e8924d777b42422e23fbb13e9280b6815c58a2b4a6d2e9db7f5a5860c51be72b3b6e2ca932771a3c54ed3ed932c3f824a5d5d305832713d68cfc1002712e46f6c728fbc4a96e6f7ff37ad7066d88a2d544a9e9aab2a7f81595890345b3128a5010ff0f9; TS0113a171=0176bf02aceb36e13ab8a0f9a2bb0ad6ee0ec645414a622e249ec573cd829cf354b40db8a9f47e9139916b2d1d5b47731691c84c9f5b0e87c46e11a20d69f60adf937950cece81a71748103315479285a348c06443297f9f21e231fac748f547594beeab38bcbd56aa9e5d450edd84b6aaa96560da' \
# --header 'DNT: 1' \
# --header 'Origin: https://kprism.kfintech.com' \
# --header 'Pragma: no-cache' \
# --header 'Referer: https://kprism.kfintech.com/' \
# --header 'Sec-Fetch-Dest: document' \
# --header 'Sec-Fetch-Mode: navigate' \
# --header 'Sec-Fetch-Site: same-origin' \
# --header 'Sec-Fetch-User: ?1' \
# --header 'Upgrade-Insecure-Requests: 1' \
# --header 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' \
# --header 'sec-ch-ua: "Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"' \
# --header 'sec-ch-ua-mobile: ?0' \
# --header 'sec-ch-ua-platform: "Windows"' \
# --data-urlencode '__EVENTTARGET=btn_submit_query' \
# --data-urlencode '__EVENTARGUMENT=' \
# --data-urlencode '__LASTFOCUS=' \
# --data-urlencode '__VIEWSTATE=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' \
# --data-urlencode '__VIEWSTATEGENERATOR=7CE23556' \
# --data-urlencode '__VIEWSTATEENCRYPTED=' \
# --data-urlencode '__EVENTVALIDATION=o9eImHs31skWsWLJtze1+ykGZKwATdL8yO/qvc7HULl84ozI/0K1bi1wzl8C1gu9FwJN0Bnpdj1lkSZtwaxo7UiIWA1fm/tb0yxF3GTtrtpaFm0BfCFDocA4tDgZKzanJ0Zi8J0dEMswnEoBze2IVDTuHLs4EgLTT8nTPBcNNAXMkkge/Ai66nBLzJxVVxCHnezfE5orpXDauw1jftQVH2h2kV1Y8r51K/q5s7mp/Z5746aVDl3GsZqoUgZWkWft6OGtWcIFSjgslvFZupHIdkCdjqEMEsZgeQtaEtREJwytn08pc8+YKcZr4vvxXIUnCYlQCpfG41IN0SDMloX+wS3PLXq970d1Ldc+H3Zi/U3x+rMmPOFV+Mzp7nbNZFQT88oam3CNoPcT7UL0AA8+JZKnLtUwVlyWja522dpwu3dVQAX/db3yqQrtxW4IfTPBJwRYHQMETh/OLBFg0/TK0cGHOZ8mPYbtAIeReIEkCVNYjQXvOd1I6ZmHqH1mA7ztwJ1ZPDW5q743gfXIgTH2daGL4ZBCbNCQEie632/m+eLhlypxBHu0ukmsPrTo/U1tIbGeWQ9nav/LJ9UnOS+1pE6QKQVWGqD5wU1AIB6J7TeFOduCPi/VIe5arbAPUOD/725q8MORDOaKUtv4F7L3VxCCzpwBGJgANMi/lfb/vkI9XJRsLmCDzgCyN0o+DQ0IqHIYzEEsDINhAHpxP21QETYxZNB5nbe/u7MBhJSL84VDikHgE0Hd0DS2ciGUXg8hyOsNszGbeL9tiMz9iCpR+fAlaYA6tCKfsO99pU3rUfkrWH+rTgsVaroqf0EHmoQeQ6cSMttP1WIMZXKeYxg3ig==' \
# --data-urlencode 'chkOnOff=on' \
# --data-urlencode "ddl_ipo=$IPO_CODE" \
# --data-urlencode 'query=pan' \
# --data-urlencode 'txt_applno=' \
# --data-urlencode 'ddl_depository=N' \
# --data-urlencode 'txt_nsdl_dpid=' \
# --data-urlencode 'txt_nsdl_clid=' \
# --data-urlencode 'txt_cdsl_clid=' \
# --data-urlencode "txt_pan=$PAN" \
# --data-urlencode "txt_captcha=$CAPTCHA" \
# --data-urlencode 'txt_conf_pan=' \
# --data-urlencode '_h_query=pan' \
# --data-urlencode 'encrypt_payload=Y' \
# --data-urlencode 'req_src='