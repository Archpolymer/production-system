// main.js

const API_URL = 'http://54.82.202.216:3000';
let chart = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化图表
    chart = echarts.init(document.getElementById('chartArea'));
    
    // 设置查询类型切换事件
    document.getElementById('queryType').addEventListener('change', updateQueryForm);
    
    // 初始化日期
    setDefaultDates();
});

// 设置默认日期范围
function setDefaultDates() {
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    document.getElementById('startDate').value = formatDate(lastMonth);
    document.getElementById('endDate').value = formatDate(today);
}

// 根据查询类型更新表单
function updateQueryForm() {
    const queryType = document.getElementById('queryType').value;
    const dateInputs = document.querySelectorAll('#queryConditions input[type="date"]');
    const machineInput = document.getElementById('machineNo');
    const staffInput = document.getElementById('staffName');
    const productInput = document.getElementById('productCode');
    const statsType = document.getElementById('statsType');

    // 重置所有输入
    dateInputs.forEach(input => input.style.display = 'none');
    machineInput.style.display = 'none';
    staffInput.style.display = 'none';
    productInput.style.display = 'none';
    statsType.style.display = 'none';

    // 根据查询类型显示相关输入
    switch(queryType) {
        case 'range':
            dateInputs.forEach(input => input.style.display = 'block');
            machineInput.style.display = 'block';
            staffInput.style.display = 'block';
            break;
        case 'inventory':
            productInput.style.display = 'block';
            break;
        case 'daily':
            document.getElementById('startDate').style.display = 'block';
            machineInput.style.display = 'block';
            staffInput.style.display = 'block';
            break;
        case 'weekly':
        case 'monthly':
            dateInputs.forEach(input => input.style.display = 'block');
            machineInput.style.display = 'block';
            staffInput.style.display = 'block';
            break;
    }
}

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
            case 'inventory':
                data = await fetchInventory(params);
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
            case 'productivity':
                data = await fetchProductivityAnalysis(params);
                break;
            case 'efficiency':
                data = await fetchEfficiencyAnalysis(params);
                break;
            case 'trends':
                data = await fetchTrendsAnalysis(params);
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
        machineNo: document.getElementById('machineNo').value,
        staffName: document.getElementById('staffName').value,
        productCode: document.getElementById('productCode').value,
        type: document.getElementById('statsType').value
    };
}

// API 调用函数
async function fetchRangeData(params) {
    const response = await fetch(
        `${API_URL}/records/range?startDate=${params.startDate}&endDate=${params.endDate}&machineNo=${params.machineNo}&staffName=${params.staffName}`
    );
    return await response.json();
}

async function fetchInventory(params) {
    const response = await fetch(
        `${API_URL}/inventory?productCode=${params.productCode}`
    );
    return await response.json();
}

async function fetchDailyStats(params) {
    const response = await fetch(
        `${API_URL}/statistics/daily?date=${params.startDate}&staffName=${params.staffName}&machineNo=${params.machineNo}`
    );
    return await response.json();
}

// ... 其他 API 调用函数 ...

// 导出数据
async function exportData(format = 'excel') {
    const params = getQueryParams();
    const queryType = document.getElementById('queryType').value;
    
    try {
        let url = `${API_URL}/export/${format}?`;
        url += `startDate=${params.startDate}&endDate=${params.endDate}`;
        url += `&type=${queryType}&staffName=${params.staffName}&machineNo=${params.machineNo}`;
        url += `&includeStats=true`;
        
        window.location.href = url;
    } catch (error) {
        showError('导出失败: ' + error.message);
    }
}

// 显示数据
function displayData(data, queryType) {
    switch(queryType) {
        case 'range':
            displayTableData(data);
            break;
        case 'inventory':
            displayInventoryData(data);
            break;
        case 'daily':
        case 'weekly':
        case 'monthly':
            displayStatisticsData(data, queryType);
            break;
        case 'productivity':
        case 'efficiency':
        case 'trends':
            displayAnalysisData(data, queryType);
            break;
    }
}

// 显示表格数据
function displayTableData(data) {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';
    
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
}

// 显示图表
function displayChart(data, type) {
    const option = {
        title: {
            text: getChartTitle(type)
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: data.labels
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: data.values,
            type: 'line'
        }]
    };
    
    chart.setOption(option);
}

// 辅助函数
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function showError(message) {
    alert(message);
}

function getChartTitle(type) {
    const titles = {
        'daily': '日统计',
        'weekly': '周统计',
        'monthly': '月统计',
        'productivity': '生产力分析',
        'efficiency': '效率分析',
        'trends': '趋势分析'
    };
    return titles[type] || '数据统计';
}