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
all_data = []

for batch in batches:
    try:
        print(f"Downloading batch: {batch}")
        data = yf.download(batch, start='2023-06-01', end=today, threads=True, timeout=30)
        valid_data = data.dropna(how='all', axis=1)  # 去除無效股票
        all_data.append(valid_data)

        # 下載一次後等待 2 秒
        time.sleep(2)  

    except Exception as e:
        print(f"Failed to download batch: {batch} with error: {e}")

# 合併所有數據、儲存
final_data = pd.concat(all_data, axis=1)
final_data.to_csv('stock_data_TW.csv')

print("\nAll data downloaded and saved to stock_data_TW.csv.")


# 成功下載的股票數量
file_path = "stock_data_TW.csv"
data = pd.read_csv(file_path, header=None, low_memory=False)  # 不設定標題，完整讀取
stock_names = data.iloc[1]  # 第 1 行是股票名稱

# 使用 unique() 函數提取所有不同的股票名稱
unique_stock_names = stock_names.unique()
unique_stock_names = np.delete(unique_stock_names, np.where(unique_stock_names == 'Ticker'))
# 計算下載股票的數量
num_unique_stocks = len(unique_stock_names)
print("\nNumber of stocks successfully downloaded:", num_unique_stocks)