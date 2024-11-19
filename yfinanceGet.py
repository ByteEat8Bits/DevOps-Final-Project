# import yfinance as yf
# import matplotlib.pyplot as plt
# import pandas as pd

# def main_menu():
#     while True:
#         print("\n===== 股票查詢系統 =====")
#         print("1. 查詢股票走勢圖或 K 線圖")
#         print("2. 顯示股票的基本面資訊")
#         print("3. 顯示股票的籌碼面（僅限台股）")
#         print("0. 退出程式")
#         choice = input("請輸入選項（0-3）：")

#         if choice == '1':
#             stock_chart()
#         elif choice == '2':
#             stock_fundamentals()
#         elif choice == '3':
#             stock_chip_data()
#         elif choice == '0':
#             print("感謝使用，再見！")
#             break
#         else:
#             print("無效的選項，請重新輸入。")

# def stock_chart():
#     market = input("請選擇市場（1.美股 2.台股）：")
#     symbol = input("請輸入股票代碼：")

#     if market == '1':
#         full_symbol = symbol
#     elif market == '2':
#         full_symbol = f"{symbol}.TW"
#     else:
#         print("無效的市場選項。")
#         return

#     ticker = yf.Ticker(full_symbol)
#     data = ticker.history(period="1mo")

#     if data.empty:
#         print("無法取得該股票的資料。")
#         return

#     chart_type = input("選擇圖表類型（1.走勢圖 2.K 線圖）：")
#     if chart_type == '1':
#         data['Close'].plot(title=f"{symbol} 近一個月收盤價走勢圖")
#         plt.xlabel("日期")
#         plt.ylabel("收盤價")
#         plt.show()
#     elif chart_type == '2':
#         import mplfinance as mpf
#         mpf.plot(data, type='candle', title=f"{symbol} 近一個月 K 線圖", style='charles')
#     else:
#         print("無效的圖表選項。")

# def stock_fundamentals():
#     symbol = input("請輸入美股股票代碼（例如 AAPL）：")
#     ticker = yf.Ticker(symbol)
#     info = ticker.info

#     if not info:
#         print("無法取得該股票的基本面資訊。")
#         return

#     print(f"\n{symbol} 基本面資訊：")
#     print(f"公司名稱：{info.get('longName')}")
#     print(f"市值：{info.get('marketCap')}")
#     print(f"市盈率（PE）：{info.get('trailingPE')}")
#     print(f"每股收益（EPS）：{info.get('trailingEps')}")
#     # 您可以根據需要添加更多基本面資訊

# def stock_chip_data():
#     symbol = input("請輸入台股股票代碼（例如 2330）：")
#     # 由於 yfinance 無法提供籌碼面資訊，這裡需要使用其他資料來源
#     print("籌碼面資訊需要使用其他資料來源，請考慮使用相關 API 或資料庫。")

# if __name__ == "__main__":
#     # 確保安裝必要的模組
#     try:
#         import mplfinance as mpf
#     except ImportError:
#         print("正在安裝必要的模組 mplfinance...")
#         import os
#         os.system('pip install mplfinance')

#     main_menu()

import yfinance as yf
import matplotlib.pyplot as plt
import pandas as pd
import platform

# 設定中文字型
if platform.system() == 'Windows':
    plt.rcParams['font.sans-serif'] = ['Microsoft JhengHei']  # Windows 系統使用 SimHei（黑體）
elif platform.system() == 'Darwin':  # macOS 系統
    plt.rcParams['font.sans-serif'] = ['PingFang TC']  # macOS 系統使用蘋方字型
else:
    plt.rcParams['font.sans-serif'] = ['AR PL UMing CN']  # Linux 系統

plt.rcParams['axes.unicode_minus'] = False  # 解決負號無法顯示的問題

def main_menu():
    while True:
        print("\n===== 股票查詢系統 =====")
        print("1. 查詢股票走勢圖或 K 線圖")
        print("2. 顯示股票的基本面資訊")
        print("3. 顯示股票的籌碼面（僅限台股）")
        print("0. 退出程式")
        choice = input("請輸入選項（0-3）：")

        if choice == '1':
            stock_chart()
        elif choice == '2':
            stock_fundamentals()
        elif choice == '3':
            stock_chip_data()
        elif choice == '0':
            print("感謝使用，再見！")
            break
        else:
            print("無效的選項，請重新輸入。")

def stock_chart():
    market = input("請選擇市場（1.美股 2.台股）：")
    symbol = input("請輸入股票代碼：")

    if market == '1':
        full_symbol = symbol
    elif market == '2':
        full_symbol = f"{symbol}.TW"
    else:
        print("無效的市場選項。")
        return

    ticker = yf.Ticker(full_symbol)
    data = ticker.history(period="1mo")

    if data.empty:
        print("無法取得該股票的資料。")
        return

    chart_type = input("選擇圖表類型（1.走勢圖 2.K 線圖）：")
    if chart_type == '1':
        data['Close'].plot(title=f"{symbol} 近一個月收盤價走勢圖")
        plt.xlabel("日期")
        plt.ylabel("收盤價")
        plt.show()
    elif chart_type == '2':
        try:
            import mplfinance as mpf
        except ImportError:
            print("正在安裝必要的模組 mplfinance...")
            import os
            os.system('pip install mplfinance')
            import mplfinance as mpf

        mpf.plot(data, type='candle', title=f"{symbol} 近一個月 K 線圖", style='charles')
    else:
        print("無效的圖表選項。")

def stock_fundamentals():
    symbol = input("請輸入美股股票代碼（例如 AAPL）：")
    ticker = yf.Ticker(symbol)
    info = ticker.info

    if not info:
        print("無法取得該股票的基本面資訊。")
        return

    print(f"\n{symbol} 基本面資訊：")
    print(f"公司名稱：{info.get('longName')}")
    print(f"市值：{info.get('marketCap')}")
    print(f"市盈率（PE）：{info.get('trailingPE')}")
    print(f"每股收益（EPS）：{info.get('trailingEps')}")
    # 您可以根據需要添加更多基本面資訊

def stock_chip_data():
    symbol = input("請輸入台股股票代碼（例如 2330）：")
    # 由於 yfinance 無法提供籌碼面資訊，這裡需要使用其他資料來源
    print("籌碼面資訊需要使用其他資料來源，請考慮使用相關 API 或資料庫。")

if __name__ == "__main__":
    # 確保必要的模組已安裝
    try:
        import mplfinance as mpf
    except ImportError:
        print("正在安裝必要的模組 mplfinance...")
        import os
        os.system('pip install mplfinance')
        import mplfinance as mpf

    main_menu()
