# 引入requests庫
import requests
import json, pandas as pd

# 定義API的URL
# url = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'  
url = 'https://openapi.twse.com.tw/v1/exchangeReport/MI_5MINS'
# 發送GET請求
res = requests.get(url)
print(res)
jsondata = json.loads(res.text)
# jsondata

# 引入pandas庫
# 將JSON數據轉換為DataFrame
df = pd.DataFrame(jsondata)
# df.set_index("Code", inplace=True)
# df.replace('', '0', inplace=True)
# df[df.columns.difference(['Name'])] = df[df.columns.difference(['Name'])].astype(float)
print(df)

