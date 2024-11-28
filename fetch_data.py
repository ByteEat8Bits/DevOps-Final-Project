import yfinance as yf
from datetime import datetime
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

# 定義股票代碼
tickers = stock_codes

# 獲取今天的日期
today = datetime.today().strftime('%Y-%m-%d')

# 抓取數據，將 end 設定為今天，先預設從2023年開始
data = yf.download(tickers, start='2023-01-01', end=today)

# 保存數據到 CSV 檔案
data.to_csv('stock_data_TW.csv')
