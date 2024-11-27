import pandas as pd
import numpy as np

file_path = "stock_data.csv"
data = pd.read_csv(file_path, header=None)  # 不設定標題，完整讀取

header_row = data.iloc[0]  # 第 0 行是標題
stock_names = data.iloc[1]  # 第 1 行是股票名稱

# 使用 unique() 函數提取所有不同的股票名稱
unique_stock_names = stock_names.unique()
unique_stock_names = np.delete(unique_stock_names, np.where(unique_stock_names == 'Ticker'))
print("Different stocks in the data:", unique_stock_names)

# 迴圈處理每一個不同的股票名稱
for stock in unique_stock_names:
    # 根據股票名稱選擇相關的列
    columns = stock_names[stock_names == stock].index.tolist()
    columns_to_extract = [0] + columns  # 包括日期列

    # 選擇股票資料
    filtered_data = data.iloc[3:, columns_to_extract]  # 從第 3 行開始提取數據
    filtered_data.columns = ["Date", "Adj Close", "Close", "High", "Low", "Open", "Volume"]

    # 清理和格式化資料
    df = filtered_data.dropna().copy()
    df[["Adj Close", "Close", "High", "Low", "Open", "Volume"]] = df[
        ["Adj Close", "Close", "High", "Low", "Open", "Volume"]
    ].astype(float)

    # 將數值欄位四捨五入到兩位小數
    df[["Adj Close", "Close", "High", "Low", "Open", "Volume"]] = df[
        ["Adj Close", "Close", "High", "Low", "Open", "Volume"]
    ].round(2)

    # 安全轉換 "Date" 欄位為日期格式
    df["Date"] = pd.to_datetime(df["Date"])

    # 只保留日期部分（去除時間）
    df["Date"] = df["Date"].dt.date

    # 重設索引，並丟掉原本的索引
    df_reset = df.reset_index(drop=True)

    # 將數值欄位格式化為不顯示多餘的 0
    for column in ["Adj Close", "Close", "High", "Low", "Open", "Volume"]:
        df_reset[column] = df_reset[column].map(lambda x: f"{x:.2f}".rstrip('0').rstrip('.') if pd.notna(x) else x)

    # 將結果輸出到 CSV 檔案
    output_file_path = f"{stock}.csv"
    df_reset.to_csv(output_file_path, index=False)  # index=False 不將索引列寫入檔案

    print(f"CSV file for {stock} has been saved to {output_file_path}")

print("Data cleaning is completed, and all stock files have been generated")