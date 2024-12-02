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
    const addStockButton = document.getElementById('addStock-button');

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

    stockDropdown.innerHTML = '<option value="">已加入的股票</option>';
    addStockButton.addEventListener('click', async () => {
        const stockNum = stockInput.value.trim();
        if (stockDropdown.innerHTML.includes(stockNum)) {
            alert('股票清單已存在');
            stockInput.value = '';
        } else if (await checkStockInput(stockNum)) {
            alert('已加入股票清單');
            stockDropdown.innerHTML += `<option value="${stockNum}">${stockNum}</option>`;
            stockInput.value = '';
        } else {
            alert('請輸入正確的股票代碼');
            stockInput.value = '';
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

    async function checkStockInput(stockNum) {
        try {
            const response = await fetch('stock_data_TW.csv'); // 假設 CSV 文件放在 GitHub Pages 的根目錄
            const data = await response.text();
            const rows = data.split('\n');
            
            // 從第二行開始檢查股票代碼
            for (let i = 1; i < rows.length; i++) {
                const row = rows[i].split(',');
                const stockIndex = row.indexOf(stockNum);
                if (stockIndex !== -1 && stockNum.trim() !== '') {
                    return true; // 找到股票代碼
                }
            }
            return false; // 未找到股票代碼
        } catch (error) {}
    }


    function fetchStockData(symbol) {
        fetch('stock_data_TW.csv') // 假設 CSV 文件放在根目錄
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n');
                const priceTypeRow = rows[0].split(','); // 第一行是價格類型，例如 Adj Close, Close, High 等
                const stockSymbolRow = rows[1].split(','); // 第二行是股票代號，例如 006204.TW
    
                // 找到目標股票代號的列索引
                let stockIndices = [];
                stockSymbolRow.forEach((sym, index) => {
                    if (sym.trim() === symbol) {
                        stockIndices.push(index);
                    }
                });
    
                // 驗證是否找到匹配的股票
                if (stockIndices.length === 0) {
                    alert('未找到該股票資料');
                    return;
                }
    
                // 查找每個價格類型的列索引
                const adjCloseIndices = stockIndices.filter(index => priceTypeRow[index].startsWith('Adj Close'));
                const closeIndices = stockIndices.filter(index => priceTypeRow[index].startsWith('Close'));
                const highIndices = stockIndices.filter(index => priceTypeRow[index].startsWith('High'));
                const lowIndices = stockIndices.filter(index => priceTypeRow[index].startsWith('Low'));
                const openIndices = stockIndices.filter(index => priceTypeRow[index].startsWith('Open'));
                const volumeIndices = stockIndices.filter(index => priceTypeRow[index].startsWith('Volume'));
    
                // 確保每個價格類型都有對應的列索引
                if (!adjCloseIndices.length || !closeIndices.length || !highIndices.length || !lowIndices.length || !openIndices.length || !volumeIndices.length) {
                    alert('未找到完整的股票資料');
                    return;
                }
    
                // 處理數據
                const stockData = rows.slice(3).map(row => row.split(',')); // 第四行開始為數據
    
                // 過濾掉包含缺失值的行，確保所有價格數據存在且有效
                const filteredStockData = stockData.filter(row => {
                    const adjClose = parseFloat(row[adjCloseIndices[0]]);
                    const close = parseFloat(row[closeIndices[0]]);
                    const high = parseFloat(row[highIndices[0]]);
                    const low = parseFloat(row[lowIndices[0]]);
                    const open = parseFloat(row[openIndices[0]]);
                    const volume = parseInt(row[volumeIndices[0]], 10);
    
                    return !isNaN(adjClose) && !isNaN(close) && !isNaN(high) && !isNaN(low) && !isNaN(open) && !isNaN(volume);
                });
    
                if (filteredStockData.length === 0) {
                    alert('未找到有效的該股票資料');
                    return;
                }
    
                // 獲取最新的股票數據
                const latestData = filteredStockData[filteredStockData.length - 1]; // 最下面的一行數據
                const adjCloseValue = parseFloat(latestData[adjCloseIndices[0]]).toFixed(2) || '--'; // 調整後的收盤價
                const closeValue = parseFloat(latestData[closeIndices[0]]).toFixed(2) || '--'; // 收盤價
                const highValue = parseFloat(latestData[highIndices[0]]).toFixed(2) || '--'; // 最高價
                const lowValue = parseFloat(latestData[lowIndices[0]]).toFixed(2) || '--'; // 最低價
                const openValue = parseFloat(latestData[openIndices[0]]).toFixed(2) || '--'; // 開盤價
                const volumeValue = parseInt(latestData[volumeIndices[0]], 10) || '--'; // 成交量
    
                // 更新靜態指標
                openPrice.textContent = openValue; // 開盤價
                closePrice.textContent = closeValue; // 收盤價
                highPrice.textContent = highValue; // 最高價
                lowPrice.textContent = lowValue; // 最低價
    
                // 更新圖表數據
                const timestamps = filteredStockData.map(row => row[0]); // 日期
                const adjClosePrices = filteredStockData.map(row => parseFloat(row[adjCloseIndices[0]]).toFixed(2)); // 調整後的收盤價
                const volumes = filteredStockData.map(row => parseInt(row[volumeIndices[0]], 10)); // 成交量
    
                updateCharts(timestamps, adjClosePrices, volumes);
    
                // 在 fetchStockData 中獲取 K 線圖數據
                const klineData = filteredStockData.map(row => ({
                    t: row[0], // 日期
                    o: parseFloat(row[openIndices[0]]).toFixed(2), // 開盤價
                    h: parseFloat(row[highIndices[0]]).toFixed(2), // 最高價
                    l: parseFloat(row[lowIndices[0]]).toFixed(2), // 最低價
                    c: parseFloat(row[closeIndices[0]]).toFixed(2)  // 收盤價
                }));
    
                // 繪製 K 線圖
                drawKLineChart(klineData);
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

    let chart = null;
    function drawKLineChart(data) {
        // 將數據格式化為 ApexCharts 所需的格式
        
        const formattedKlineData = data.map(d => ({
            x: new Date(d.t), // 日期
            y: [d.o, d.h, d.l, d.c] // [開盤價, 最高價, 最低價, 收盤價]
        }));
        
        const options = {
            series: [{
                data: formattedKlineData
            }],
            chart: {
                type: 'candlestick',
                height: 350
            },
            title: {
                text: 'CandleStick Chart',
                align: 'left'
            },
            xaxis: {
                type: 'category',
                labels: {
                    formatter: function(val) {
                        const date = new Date(val);
                        return date.toLocaleDateString('zh-TW', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                        });
                    }
                }
            },
            yaxis: {
                tooltip: {
                    enabled: true
                }
            }
        };
        
        if (chart !== null) {
            chart.destroy();
        }

        // 創建並渲染新的圖表
        chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
    }
});
