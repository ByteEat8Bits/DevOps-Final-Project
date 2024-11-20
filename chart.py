import pandas as pd
import plotly.graph_objects as go

file_path = "stock_data.csv"
data = pd.read_csv(file_path, header=None)  # 不設定標題，完整讀取

header_row = data.iloc[0]  # 第 0 行是標題
stock_names = data.iloc[1]  # 第 1 行是股票名稱

columns_2330 = stock_names[stock_names == "2330.TW"].index.tolist()
columns_to_extract = [0] + columns_2330  # 包括日期列


filtered_data = data.iloc[3:, columns_to_extract]  # 從第 3 行開始提取數據
filtered_data.columns = ["Date", "Adj Close", "Close", "High", "Low", "Open", "Volume"]


df = filtered_data.dropna().copy()

print(df.head(5))  # 顯示前 5 行

df[["Adj Close", "Close", "High", "Low", "Open", "Volume"]]= df[
    ["Adj Close", "Close", "High", "Low", "Open", "Volume"]
].astype(float)

# 安全轉換 "Date" 欄位為日期格式
df["Date"] = pd.to_datetime(df["Date"])

print(df.dtypes)
