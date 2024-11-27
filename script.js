document.addEventListener('DOMContentLoaded', () => {
    // 定義全域變數
    const stockInput = document.getElementById('stock-input');
    const searchButton = document.getElementById('search-button');
    const stockDropdown = document.createElement('select'); // 股票清單下拉選單
    const currentDate = document.getElementById('current-date');
    const openPrice = document.getElementById('open-price'); // 開盤價
    const closePrice = document.getElementById('close-price'); // 收盤價
    const highPrice = document.getElementById('high-price'); // 最高價
    const lowPrice = document.getElementById('low-price'); // 最低價
    const priceChartCanvas = document.getElementById('price-chart');
    const volumeChartCanvas = document.getElementById('volume-chart');
    const tabs = document.querySelectorAll('.tab-button'); // 按鈕選項
    const tabContents = document.querySelectorAll('.tab'); // 圖表內容區塊

    // 初始化日期
    const today = new Date();
    currentDate.textContent = `今日日期：${today.toISOString().slice(0, 10)}`;

    // 初始化股票清單下拉選單
    stockDropdown.id = 'stock-dropdown';
    stockDropdown.style.marginLeft = '10px';
    stockInput.parentElement.appendChild(stockDropdown);

    // 添加選單變更事件
    stockDropdown.addEventListener('change', () => {
        const selectedStock = stockDropdown.value;
        if (selectedStock) {
            fetchStockData(selectedStock);
        }
    });

    // 搜尋按鈕點擊事件
    searchButton.addEventListener('click', () => {
        const stockSymbol = stockInput.value.trim();
        if (stockSymbol) {
            fetchStockData(stockSymbol);
        }
    });

    // 初始化圖表
    let priceChart, volumeChart;

    function initCharts() {
        priceChart = new Chart(priceChartCanvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: '價格趨勢',
                    data: [],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: '日期' } },
                    y: { title: { display: true, text: '價格' } }
                }
            }
        });

        volumeChart = new Chart(volumeChartCanvas, {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: '成交量趨勢',
                    data: [],
                    backgroundColor: '#e74c3c'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: { title: { display: true, text: '日期' } },
                    y: { title: { display: true, text: '成交量' } }
                }
            }
        });
    }

    initCharts();

    // 價格四捨五入到小數點後兩位
    function roundToTwo(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }

    // 從 CSV 文件抓取資料
    function fetchStockData(symbol) {
        fetch('stock_data.csv') // 假設 CSV 文件放在 GitHub Pages 的根目錄
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n');
                const headerRow = rows[1].split(','); // 第二行為股票代碼
                const stockIndex = headerRow.indexOf(symbol);

                if (stockIndex === -1) {
                    alert('未找到該股票資料');
                    return;
                }

                // 處理數據
                const stockData = rows.slice(2).map(row => row.split(',')); // 第三行開始為數據

                // 過濾指定股票的有效行（非空值）
                const filteredStockData = stockData.filter(row => {
                    const close = row[stockIndex + 3]; // 收盤價
                    return close !== undefined && close.trim() !== '';
                });

                if (filteredStockData.length === 0) {
                    alert('未找到有效的該股票資料');
                    return;
                }

                // 獲取最新的股票數據
                const latestData = filteredStockData[filteredStockData.length - 1]; // 最下面的一行數據
                const latestDate = latestData[0]; // 日期欄位
                const openPriceValue = roundToTwo(parseFloat(latestData[stockIndex + 12])) || '--'; // 開盤價(index = 4*資料集中的股票數量3)
                const closePriceValue = roundToTwo(parseFloat(latestData[stockIndex + 3])) || '--'; // 收盤價(index = 1*3)
                const highPriceValue = roundToTwo(parseFloat(latestData[stockIndex + 6])) || '--'; // 最高價(index = 2*3)
                const lowPriceValue = roundToTwo(parseFloat(latestData[stockIndex + 9])) || '--'; // 最低價(index = 3*3)

                // 更新靜態指標
                openPrice.textContent = openPriceValue; // 開盤價
                closePrice.textContent = closePriceValue; // 收盤價
                highPrice.textContent = highPriceValue; // 最高價
                lowPrice.textContent = lowPriceValue; // 最低價

                // 更新圖表數據
                const timestamps = filteredStockData.map(row => row[0].split(' ')[0]); // 日期 (去掉時間)
                const prices = filteredStockData.map(row => roundToTwo(parseFloat(row[stockIndex]))); // 選中股票價格
                const volumes = filteredStockData.map(row => parseInt(row[stockIndex + 15], 10)); // 成交量(index = 3*5)
                updateCharts(timestamps, prices, volumes);
            })
            .catch(error => {
                console.error('抓取股票資料失敗', error);
            });
    }

    // 更新圖表數據
    function updateCharts(timestamps, prices, volumes) {
        priceChart.data.labels = timestamps;
        priceChart.data.datasets[0].data = prices;
        priceChart.update();

        volumeChart.data.labels = timestamps;
        volumeChart.data.datasets[0].data = volumes;
        volumeChart.update();
    }

    function loadStockList() {
        fetch('stock_data.csv') // 假設 CSV 文件放在 GitHub Pages 的根目錄
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n');
                const headerRow = rows[1].split(','); // 第二行為股票代碼
                const uniqueSymbols = [...new Set(headerRow.slice(1).map(symbol => symbol.trim()))]; // 去除空白並過濾重複項目

                stockDropdown.innerHTML = '<option value="">選擇股票</option>';
                uniqueSymbols.forEach(symbol => {
                    if (symbol) { // 過濾空白值
                        const option = document.createElement('option');
                        option.value = symbol;
                        option.textContent = symbol;
                        stockDropdown.appendChild(option);
                    }
                });
            })
            .catch(error => {
                console.error('載入股票清單失敗', error);
            });
    }

    // 切換按鈕邏輯
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', () => {
            // 移除所有按鈕和內容的活動狀態
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // 激活當前按鈕和內容
            tab.classList.add('active');
            tabContents[index].classList.add('active');
        });
    });

    loadStockList();
});
