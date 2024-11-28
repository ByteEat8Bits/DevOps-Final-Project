import requests  
import json

# 定義API的URL
url = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'  
# 發送GET請求
res = requests.get(url)  

jsondata = json.loads(res.text)
# print(jsondata)

# 提取股票編號並加上 .TW
stock_codes = [item["Code"] + ".TW" for item in jsondata]

# 輸出結果
print(stock_codes)
