import yfinance as yf
from datetime import datetime
import requests  
import json
import pandas as pd

# 定義台灣證交所API的URL
TWSE_API_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'

# 嘗試從API獲取股票代碼
try:
    res = requests.get(TWSE_API_URL)
    res.raise_for_status()  # 如果HTTP請求失敗會拋出錯誤
    jsondata = res.json()  # 直接轉換成JSON物件
except requests.exceptions.RequestException as e:
    print(f"Error fetching stock codes: {e}")
    exit()

# 提取股票代碼並附加 `.TW`
stock_codes = [item["Code"] + ".TW" for item in jsondata if "Code" in item]

# 獲取今天的日期
today = datetime.today().strftime('%Y-%m-%d')

# 抓取股票資料
try:
    print(f"Fetching data for {len(stock_codes)} tickers...")
    data = yf.download(stock_codes, start='2023-01-01', end=today, group_by='ticker', threads=True)
    
    # 檢查是否成功獲取資料
    if data.empty:
        print("No data fetched. Please check stock codes or Yahoo Finance API status.")
        exit()
    
    # 將數據保存到 CSV 檔案
    data.to_csv('stock_data_TW.csv')
    print("Stock data saved to 'stock_data_TW.csv'")
except Exception as e:
    print(f"Error fetching stock data: {e}")
