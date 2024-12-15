const API_URL = 'http://54.82.202.216:3000';

async function queryData() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const machineNo = document.getElementById('machineNo').value;
    
    try {
        const response = await fetch(
            `${API_URL}/records/range?startDate=${startDate}&endDate=${endDate}&machineNo=${machineNo}`
        );
        const data = await response.json();
        displayData(data);
    } catch (error) {
        alert('查询失败: ' + error.message);
    }
}

function displayData(data) {
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

function exportExcel() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const machineNo = document.getElementById('machineNo').value;
    
    window.location.href = `${API_URL}/export/excel?startDate=${startDate}&endDate=${endDate}&machineNo=${machineNo}`;
}