/**
 * 7.52 有息负债偿债保障 - 专用渲染函数
 * 多图联动、2x2网格布局
 */

async function build752Dashboard(container, config, data, currentGroup, currentCompany) {
    // 清空容器
    container.innerHTML = '';
    container.style.display = 'block';
    
    // 按年份排序
    const processedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());

    // ========== 全局样式配置 - 统一色号规范 ==========
    const GLOBAL_COLORS = {
        blue: '#1E88E5',
        red: '#f44336',
        yellow: '#FF9800',
        green: '#2E7D32',
        gray: '#9E9E9E',
        darkGray: '#616161',
        black: '#424242'
    };

    // ========== 外层卡片容器高度 ==========
    container.style.minHeight = '1000px';
    container.style.height = 'auto';
    if (container.parentElement) {
        container.parentElement.style.height = 'auto';
        container.parentElement.style.minHeight = '1000px';
    }

    // ========== 创建2x2网格布局 ==========
    const gridContainer = document.createElement('div');
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = '1fr 1fr';
    gridContainer.style.gap = '20px';
    gridContainer.style.marginBottom = '20px';

    const chartContainers = [];
    for (let i = 0; i < 4; i++) {
        const wrapper = document.createElement('div');
        wrapper.className = 'chart-wrapper';
        wrapper.style.width = '100%';
        wrapper.style.minHeight = '450px';
        wrapper.style.background = 'white';
        wrapper.style.borderRadius = '8px';
        wrapper.style.padding = '15px';
        const chartDiv = document.createElement('div');
        chartDiv.className = 'chart';
        chartDiv.style.height = '380px';
        chartDiv.id = `752-chart-${i}`;
        wrapper.appendChild(chartDiv);
        chartContainers.push(chartDiv);
        gridContainer.appendChild(wrapper);
    }

    container.appendChild(gridContainer);

    // ========== 初始化4个图表 ==========
    const charts = [];

    // ========== 子图1：有息负债率 ==========
    const chart1 = echarts.init(chartContainers[0]);
    const data1 = processedData.map(d => {
        const keys = Object.keys(d);
        const val = parseFloat(d[keys[3]]);
        return isNaN(val) ? 0 : val;
    });
    const option1 = {
        title: { text: '有息负债率', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
        tooltip: { 
            trigger: 'axis',
            formatter: function(params) {
                let result = `<div><strong>${params[0].name}年</strong></div>`;
                params.forEach(p => {
                    result += `<div style="color:${p.color}">■ ${p.seriesName}: ${p.value.toFixed(2)}%</div>`;
                });
                return result;
            }
        },
        legend: { top: 35, data: ['有息负债率'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2) + '%';
                }
            }
        },
        series: [{
            name: '有息负债率',
            type: 'line',
            data: data1,
            smooth: true,
            lineStyle: { width: 2, color: GLOBAL_COLORS.blue },
            itemStyle: { color: GLOBAL_COLORS.blue },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: GLOBAL_COLORS.blue,
                formatter: function(params) { return params.value.toFixed(2) + '%'; }
            }
        }],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart1.setOption(option1);
    charts.push(chart1);

    // ========== 子图2：利息保障倍数 ==========
    const chart2 = echarts.init(chartContainers[1]);
    const data2 = processedData.map(d => {
        const keys = Object.keys(d);
        const val = parseFloat(d[keys[4]]);
        return isNaN(val) ? 0 : val;
    });
    const option2 = {
        title: { text: '利息保障倍数', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
        tooltip: { 
            trigger: 'axis',
            formatter: function(params) {
                let result = `<div><strong>${params[0].name}年</strong></div>`;
                params.forEach(p => {
                    result += `<div style="color:${p.color}">■ ${p.seriesName}: ${p.value.toFixed(2)}</div>`;
                });
                return result;
            }
        },
        legend: { top: 35, data: ['利息保障倍数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '倍数',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2);
                }
            }
        },
        series: [{
            name: '利息保障倍数',
            type: 'bar',
            data: data2,
            itemStyle: { color: GLOBAL_COLORS.yellow },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: GLOBAL_COLORS.yellow,
                formatter: function(params) { return params.value.toFixed(2); }
            }
        }],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart2.setOption(option2);
    charts.push(chart2);

    // ========== 子图3：短期债务覆盖率 ==========
    const chart3 = echarts.init(chartContainers[2]);
    const data3 = processedData.map(d => {
        const keys = Object.keys(d);
        const val = parseFloat(d[keys[5]]);
        return isNaN(val) ? 0 : val;
    });
    const option3 = {
        title: { text: '短期债务覆盖率', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
        tooltip: { 
            trigger: 'axis',
            formatter: function(params) {
                let result = `<div><strong>${params[0].name}年</strong></div>`;
                params.forEach(p => {
                    result += `<div style="color:${p.color}">■ ${p.seriesName}: ${p.value.toFixed(2)}</div>`;
                });
                return result;
            }
        },
        legend: { top: 35, data: ['短期债务覆盖率'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '覆盖率',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2);
                }
            }
        },
        series: [{
            name: '短期债务覆盖率',
            type: 'line',
            data: data3,
            smooth: true,
            lineStyle: { width: 2, color: GLOBAL_COLORS.green },
            itemStyle: { color: GLOBAL_COLORS.green },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: GLOBAL_COLORS.green,
                formatter: function(params) { return params.value.toFixed(2); }
            },
            markLine: {
                data: [
                    { yAxis: 3, name: '基准线=3', lineStyle: { color: GLOBAL_COLORS.red, type: 'dashed', width: 2 } }
                ]
            }
        }],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart3.setOption(option3);
    charts.push(chart3);

    // ========== 子图4：对外担保比率 vs 受限货币资金占比 ==========
    const chart4 = echarts.init(chartContainers[3]);
    const data4_guarantee = processedData.map(d => {
        const keys = Object.keys(d);
        const val = parseFloat(d[keys[6]]);
        return isNaN(val) ? 0 : val;
    });
    const data4_restricted = processedData.map(d => {
        const keys = Object.keys(d);
        const val = parseFloat(d[keys[7]]);
        return isNaN(val) ? 0 : val;
    });
    const option4 = {
        title: { text: '对外担保比率 vs 受限货币资金占比', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
        tooltip: { 
            trigger: 'axis',
            formatter: function(params) {
                let result = `<div><strong>${params[0].name}年</strong></div>`;
                params.forEach(p => {
                    result += `<div style="color:${p.color}">■ ${p.seriesName}: ${p.value.toFixed(2)}%</div>`;
                });
                return result;
            }
        },
        legend: { top: 35, data: ['对外担保比率', '受限货币资金占比'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2) + '%';
                }
            }
        },
        series: [
            {
                name: '对外担保比率',
                type: 'line',
                data: data4_guarantee,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.red },
                itemStyle: { color: GLOBAL_COLORS.red },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.red,
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
                }
            },
            {
                name: '受限货币资金占比',
                type: 'line',
                data: data4_restricted,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.blue },
                itemStyle: { color: GLOBAL_COLORS.blue },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.blue,
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
                }
            }
        ],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart4.setOption(option4);
    charts.push(chart4);

    // ========== 窗口大小变化时重绘 ==========
    window.addEventListener('resize', function() {
        charts.forEach(chart => chart.resize());
    });
    
    // ========== 最后：渲染分析结论卡片，并插到最上面 ==========
    console.log('>>> 准备渲染分析结论卡片到最上面');
    const tempDiv = document.createElement('div');
    await renderAnalysisCards(tempDiv, config, currentGroup, currentCompany);
    
    // 把tempDiv里的所有元素插到container最前面
    while (tempDiv.firstChild) {
        container.insertBefore(tempDiv.firstChild, container.firstChild);
    }
}