import yfinance as yf
from datetime import datetime

# 定義股票代碼
tickers = ['AAPL', '006208.tw', '2330.tw']

# 獲取今天的日期
today = datetime.today().strftime('%Y-%m-%d')

# 抓取數據，將 end 設定為今天
data = yf.download(tickers, start='2024-01-01', end=today)

# 保存數據到 CSV 檔案
data.to_csv('stock_data.csv')
