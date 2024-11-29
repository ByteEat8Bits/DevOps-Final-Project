import pandas as pd
import os
import numpy as np

# 定義存放分批檔案的目錄
directory = "./"  # 假設 CSV 文件存放在當前目錄

# 找出所有以 "batch_" 開頭的 CSV 檔案
csv_files = sorted([file for file in os.listdir(directory) if file.startswith("batch_") and file.endswith(".csv")])

# 合併所有 CSV 檔案
all_data = []
for file in csv_files:
    print(f"Reading {file}")
    data = pd.read_csv(file, index_col=0)  # 保留索引作為日期或其他關鍵欄
    all_data.append(data)

# 合併成一個 DataFrame
final_data = pd.concat(all_data, axis=1)  # 按列合併（不同股票的數據在列上）
final_data.to_csv("stock_data_TW.csv")
print("All batches merged and saved as merged_stock_data_TW.csv.")



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