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
        if (await checkStockInput(stockNum)) {
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
            const response = await fetch('stock_data.csv'); // 假設 CSV 文件放在 GitHub Pages 的根目錄
            const data = await response.text();
            const rows = data.split('\n');
            
            // 假設第一行為標題，從第二行開始檢查股票代碼
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
                const openPriceValue = roundToTwo(parseFloat(latestData[stockIndex + 12])) || '--'; // 開盤價(4*amount)
                const closePriceValue = roundToTwo(parseFloat(latestData[stockIndex + 3])) || '--'; // 收盤價
                const highPriceValue = roundToTwo(parseFloat(latestData[stockIndex + 6])) || '--'; // 最高價
                const lowPriceValue = roundToTwo(parseFloat(latestData[stockIndex + 9])) || '--'; // 最低價

                // 更新靜態指標
                openPrice.textContent = openPriceValue; // 開盤價
                closePrice.textContent = closePriceValue; // 收盤價
                highPrice.textContent = highPriceValue; // 最高價
                lowPrice.textContent = lowPriceValue; // 最低價

                // 更新圖表數據
                const timestamps = filteredStockData.map(row => row[0].split(' ')[0]); // 日期 (去掉時間)
                const prices = filteredStockData.map(row => roundToTwo(parseFloat(row[stockIndex]))); // 選中股票價格
                const volumes = filteredStockData.map(row => parseInt(row[stockIndex + 15], 10)); // 成交量

                updateCharts(timestamps, prices, volumes);

                // 在 fetchStockData 中獲取 K 線圖數據
                const klineData = filteredStockData.map(row => ({
                    t: row[0], // 日期
                    o: roundToTwo(parseFloat(row[stockIndex + 12])), // 開盤價
                    h: roundToTwo(parseFloat(row[stockIndex + 6])), // 最高價
                    l: roundToTwo(parseFloat(row[stockIndex + 9])), // 最低價
                    c: roundToTwo(parseFloat(row[stockIndex + 3]))  // 收盤價
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

    function loadStockList() {
        fetch('stock_data.csv') // 假設 CSV 文件放在 GitHub Pages 的根目錄
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n');
                const headerRow = rows[1].split(','); // 第二行為股票代碼
                const uniqueSymbols = [...new Set(headerRow.slice(1).map(symbol => symbol.trim()))]; // 去除空白並過濾重複項目

                stockDropdown.innerHTML = '<option value="">已加入的股票</option>';
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

    // loadStockList();

    // function drawKLineChart(data) {
    //     const svg = d3.select("#kline-svg");
    //     svg.selectAll("*").remove(); // 清空 SVG
    
    //     const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    //     const width = +svg.attr("width") - margin.left - margin.right;
    //     const height = +svg.attr("height") - margin.top - margin.bottom;
    
    //     const x = d3.scaleBand().range([0, width]).padding(0.1);
    //     const y = d3.scaleLinear().range([height, 0]);
    
    //     const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
    
    //     // 格式化數據
    //     data.forEach(d => {
    //         d.date = new Date(d.t);
    //         d.open = +d.o;
    //         d.high = +d.h;
    //         d.low = +d.l;
    //         d.close = +d.c;
    //     });
    
    //     x.domain(data.map(d => d.date));
    //     y.domain([d3.min(data, d => d.low), d3.max(data, d => d.high)]);
    
    //     // 添加縮放功能
    //     const zoom = d3.zoom()
    //         .scaleExtent([1, 5]) // 縮放比例範圍
    //         .translateExtent([[0, 0], [width, height]]) // 限制平移範圍
    //         .on("zoom", zoomed);
    
    //     svg.call(zoom);
    
    //     // 繪製 K 線
    //     const candles = g.selectAll(".candle")
    //         .data(data)
    //         .enter().append("line")
    //         .attr("class", "candle")
    //         .attr("x1", d => x(d.date) + x.bandwidth() / 2)
    //         .attr("x2", d => x(d.date) + x.bandwidth() / 2)
    //         .attr("y1", d => y(d.high))
    //         .attr("y2", d => y(d.low))
    //         .attr("stroke", "black");
    
    //     const bodies = g.selectAll(".body")
    //         .data(data)
    //         .enter().append("rect")
    //         .attr("class", "body")
    //         .attr("x", d => x(d.date))
    //         .attr("y", d => y(Math.max(d.open, d.close)))
    //         .attr("height", d => Math.abs(y(d.open) - y(d.close)))
    //         .attr("width", x.bandwidth())
    //         .attr("fill", d => d.open > d.close ? "red" : "green");
    
    //     // // 添加 X 軸
    //     // const xAxis = g.append("g")
    //     //     .attr("transform", `translate(0, ${height})`)
    //     //     .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d")));
    
    //     // 添加 Y 軸
    //     const yAxis = g.append("g").call(d3.axisLeft(y));
    
    //     // 定義縮放行為
    //     function zoomed(event) {
    //         const transform = event.transform;
    
    //         // 縮放 X 軸
    //         const newX = transform.rescaleX(x);
    //         xAxis.call(d3.axisBottom(newX).tickFormat(d3.timeFormat("%Y-%m-%d")));
    
    //         // 更新 K 線位置
    //         candles.attr("x1", d => newX(d.date) + newX.bandwidth() / 2)
    //             .attr("x2", d => newX(d.date) + newX.bandwidth() / 2);
    //         bodies.attr("x", d => newX(d.date))
    //             .attr("width", newX.bandwidth());
    //     }
    // }

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
                type: 'category',  // 使用 'category' 類型來去除日期間的空隙
                labels: {
                    formatter: function(val) {
                    return new Date(val).toISOString().split('T')[0]; // 格式化日期顯示
                    }
                }
            },
            yaxis: {
                tooltip: {
                    enabled: true
                }
            }
        };
    
        // 渲染 ApexCharts K 線圖
        const chart = new ApexCharts(document.querySelector("#chart"), options);
        chart.render();
        chart.updateSeries([{
            data: formattedKlineData
        }]);
    }
});
