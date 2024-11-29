import yfinance as yf
from datetime import datetime
import requests  
import json
import pandas as pd
import numpy as np
import time

# 定義API的URL
url = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL'  
res = requests.get(url)  
jsondata = json.loads(res.text)

# 提取股票代碼
stock_codes = [item["Code"] + ".TW" for item in jsondata]

# 分批處理 (每次下載 10 支股票)
batch_size = 10
batches = [stock_codes[i:i + batch_size] for i in range(0, len(stock_codes), batch_size)]

# 獲取今天日期
today = datetime.today().strftime('%Y-%m-%d')

# 下載並保存成批的 CSV 檔案
for i, batch in enumerate(batches):
    try:
        print(f"Downloading batch {i+1}/{len(batches)}: {batch}")
        data = yf.download(batch, start='2024-05-01', end=today, threads=True, timeout= 30)
        valid_data = data.dropna(how='all', axis=1)  # 去除無效股票
        file_name = f"batch_{i+1}.csv"
        valid_data.to_csv(file_name)
        print(f"Batch {i+1} saved as {file_name}")
        time.sleep(4)  # 每批次延遲 4 秒
    except Exception as e:
        print(f"Failed to download batch {i+1} with error: {e}")
        time.sleep(6)  # 錯誤時等待更長時間



# # 成功下載的股票數量
# file_path = "stock_data_TW.csv"
# data = pd.read_csv(file_path, header=None, low_memory=False)  # 不設定標題，完整讀取
# stock_names = data.iloc[1]  # 第 1 行是股票名稱

# # 使用 unique() 函數提取所有不同的股票名稱
# unique_stock_names = stock_names.unique()
# unique_stock_names = np.delete(unique_stock_names, np.where(unique_stock_names == 'Ticker'))
# # 計算下載股票的數量
# num_unique_stocks = len(unique_stock_names)
# print("\nNumber of stocks successfully downloaded:", num_unique_stocks)