import yfinance as yf
import matplotlib.pyplot as plt

#import yfinance as yf

# Initialize the Ticker object for Apple (AAPL)
apple_stock = yf.Ticker("AAPL")

# Fetch historical data for the past year
# df = apple_stock.history(period="5d")

# # Display data
# print(df)

# # Optional: Plot closing prices

# plt.figure(figsize=(12, 6))
# plt.plot(df.index, df['Close'], label='AAPL Close Price')
# plt.title('Apple Stock Closing Prices Over the Past Year')
# plt.xlabel('Date')
# plt.ylabel('Close Price (USD)')
# plt.legend()
# plt.show()


df = apple_stock.history(period="1y")

# 計算每日漲跌幅
df['Change'] = df['Close'].diff()  # 計算每日與前一天的差異
df['Color'] = df['Change'].apply(lambda x: 'red' if x < 0 else 'green')  # 設定顏色，跌為紅色，漲為綠色

# 繪製圖表
plt.figure(figsize=(12, 6))
for i in range(1, len(df)):
    plt.plot([df.index[i-1], df.index[i]], [df['Close'][i-1], df['Close'][i]], 
             color=df['Color'][i], linewidth=1.5)  # 根據漲跌幅選顏色

# 添加標題和標籤
plt.title('Apple Stock Closing Prices Over the Past Year with Gains and Losses')
plt.xlabel('Date')
plt.ylabel('Close Price (USD)')
plt.show()


