// js/main.js

const API_URL = 'http://54.82.202.216:3000';

// 查询数据
async function queryData() {
    const queryType = document.getElementById('queryType').value;
    const params = getQueryParams();
    
    try {
        let data;
        switch(queryType) {
            case 'range':
                data = await fetchRangeData(params);
                break;
            case 'daily':
                data = await fetchDailyStats(params);
                break;
            case 'weekly':
                data = await fetchWeeklyStats(params);
                break;
            case 'monthly':
                data = await fetchMonthlyStats(params);
                break;
            case 'inventory':
                data = await fetchInventory(params);
                break;
        }
        displayData(data, queryType);
    } catch (error) {
        showError('查询失败: ' + error.message);
    }
}

// 获取查询参数
function getQueryParams() {
    return {
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        machineNo: document.getElementById('machineNo').value || null,
        staffName: document.getElementById('staffName').value || null,
        productCode: document.getElementById('productCode').value || null
    };
}

// 日期范围查询
async function fetchRangeData(params) {
    const response = await fetch(
        `${API_URL}/records/range?` + 
        `startDate=${params.startDate}&` +
        `endDate=${params.endDate}&` +
        `machineNo=${params.machineNo || ''}&` +
        `staffName=${params.staffName || ''}`
    );
    if (!response.ok) throw new Error('查询失败');
    return await response.json();
}

// 日统计
async function fetchDailyStats(params) {
    const response = await fetch(
        `${API_URL}/statistics/daily?` +
        `date=${params.startDate}&` +
        `machineNo=${params.machineNo || ''}&` +
        `staffName=${params.staffName || ''}`
    );
    if (!response.ok) throw new Error('查询失败');
    return await response.json();
}

// 周统计
async function fetchWeeklyStats(params) {
    const date = new Date(params.startDate);
    const year = date.getFullYear();
    const week = getWeekNumber(date);
    
    const response = await fetch(
        `${API_URL}/statistics/weekly?` +
        `year=${year}&week=${week}&` +
        `machineNo=${params.machineNo || ''}&` +
        `staffName=${params.staffName || ''}`
    );
    if (!response.ok) throw new Error('查询失败');
    return await response.json();
}

// 月统计
async function fetchMonthlyStats(params) {
    const date = new Date(params.startDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    const response = await fetch(
        `${API_URL}/statistics/monthly?` +
        `year=${year}&month=${month}&` +
        `machineNo=${params.machineNo || ''}&` +
        `staffName=${params.staffName || ''}`
    );
    if (!response.ok) throw new Error('查询失败');
    return await response.json();
}

// 库存查询
async function fetchInventory(params) {
    const response = await fetch(
        `${API_URL}/inventory?` +
        `productCode=${params.productCode || ''}`
    );
    if (!response.ok) throw new Error('查询失败');
    return await response.json();
}

// 显示数据
function displayData(data, queryType) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
    if (Array.isArray(data)) {
        // 显示记录列表
        data.forEach(record => {
            tbody.innerHTML += `
                <tr>
                    <td>${new Date(record.scanTime).toLocaleDateString()}</td>
                    <td>${record.staffName}</td>
                    <td>${record.machineNo}</td>
                    <td>${record.barcode}</td>
                    <td>${new Date(record.scanTime).toLocaleString()}</td>
                </tr>
            `;
        });
    } else {
        // 显示统计数据
        for (const [key, value] of Object.entries(data)) {
            tbody.innerHTML += `
                <tr>
                    <td>${key}</td>
                    <td colspan="4">${JSON.stringify(value)}</td>
                </tr>
            `;
        }
    }
}

// 辅助函数
function getWeekNumber(d) {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    var weekNo = Math.ceil(( ( (d - yearStart) / 86400000) + 1)/7);
    return weekNo;
}

function showError(message) {
    alert(message);
}

// 导出数据
function exportData(format = 'excel') {
    const params = getQueryParams();
    const queryType = document.getElementById('queryType').value;
    
    const url = `${API_URL}/export/${format}?` +
        `startDate=${params.startDate}&` +
        `endDate=${params.endDate}&` +
        `type=${queryType}&` +
        `staffName=${params.staffName || ''}&` +
        `machineNo=${params.machineNo || ''}&` +
        `includeStats=true`;
    
    window.location.href = url;
}