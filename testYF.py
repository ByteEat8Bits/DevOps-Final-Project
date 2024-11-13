import yfinance as yf

# 定義股票代碼
tickers = ['AAPL','006208.tw','2330.tw']

# 抓取數據
data = yf.download(tickers, start='2024-01-01', end='2024-11-09')

# 保存數據到 CSV 檔案
data.to_csv('stock_data.csv')