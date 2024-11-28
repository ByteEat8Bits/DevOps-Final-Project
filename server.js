const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3333;

// 設定靜態文件夾
app.use(express.static(path.join(__dirname)));

// 設定路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 啟動伺服器
app.listen(PORT, () => {
    console.log(`伺服器正在運行於 http://localhost:${PORT}`);
});