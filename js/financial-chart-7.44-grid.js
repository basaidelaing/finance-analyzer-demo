/**
 * 7.44 股权质押对外担保关联资金占用 - 专用渲染函数
 * 多图联动、2x2网格布局
 */

async function build744Dashboard(container, config, data, currentGroup, currentCompany) {
    // 清空容器
    container.innerHTML = '';
    container.style.display = 'block';
    
    // 按年份排序并去重
    const yearMap = new Map();
    data.forEach(d => {
        const year = d.year;
        if (!yearMap.has(year)) {
            yearMap.set(year, d);
        }
    });
    const processedData = [...yearMap.values()].sort((a, b) => parseInt(a.year) - parseInt(b.year));
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
        chartDiv.id = `744-chart-${i}`;
        wrapper.appendChild(chartDiv);
        chartContainers.push(chartDiv);
        gridContainer.appendChild(wrapper);
    }

    container.appendChild(gridContainer);

    // ========== 初始化4个图表 ==========
    const charts = [];

    // ========== 子图1：货币资金占比 vs 有息负债占比 ==========
    const chart1 = echarts.init(chartContainers[0]);
    const data1_money = processedData.map(d => parseFloat(d.money_cap_ratio) || 0);
    const data1_debt = processedData.map(d => parseFloat(d.debt_cap_ratio) || 0);
    const option1 = {
        title: { text: '货币资金占比 vs 有息负债占比', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['货币资金占比', '有息负债占比'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(1) + '%';
                }
            }
        },
        series: [
            {
                name: '货币资金占比',
                type: 'line',
                data: data1_money,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.blue },
                itemStyle: { color: GLOBAL_COLORS.blue },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.blue,
                    formatter: function(params) { return params.value.toFixed(1) + '%'; }
                }
            },
            {
                name: '有息负债占比',
                type: 'line',
                data: data1_debt,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.yellow },
                itemStyle: { color: GLOBAL_COLORS.yellow },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.yellow,
                    formatter: function(params) { return params.value.toFixed(1) + '%'; }
                }
            }
        ],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart1.setOption(option1);
    charts.push(chart1);

    // ========== 子图2：净利润增速 vs 经营现金流增速 ==========
    const chart2 = echarts.init(chartContainers[1]);
    const data2_profit = processedData.map(d => parseFloat(d.net_profit_growth) || 0);
    const data2_ocf = processedData.map(d => parseFloat(d.ocf_growth) || 0);
    const option2 = {
        title: { text: '净利润增速 vs 经营现金流增速', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['净利润增速', '经营现金流增速'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '增速 (%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(1) + '%';
                }
            }
        },
        series: [
            {
                name: '净利润增速',
                type: 'line',
                data: data2_profit,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.green },
                itemStyle: { color: GLOBAL_COLORS.green },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.green,
                    formatter: function(params) { return params.value.toFixed(1) + '%'; }
                }
            },
            {
                name: '经营现金流增速',
                type: 'line',
                data: data2_ocf,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.yellow },
                itemStyle: { color: GLOBAL_COLORS.yellow },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.yellow,
                    formatter: function(params) { return params.value.toFixed(1) + '%'; }
                }
            }
        ],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart2.setOption(option2);
    charts.push(chart2);

    // ========== 子图3：关联方其他应收款占比和受限资金占比 ==========
    const chart3 = echarts.init(chartContainers[2]);
    const data3_related = processedData.map(d => parseFloat(d.related_receivable_ratio) || 0);
    const data3_restricted = processedData.map(d => 0); // CSV中没有受限资金字段，暂时用0
    const option3 = {
        title: { text: '关联方其他应收款占比和受限资金占比', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['关联方其他应收款占比', '受限资金占比'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(1) + '%';
                }
            }
        },
        series: [
            {
                name: '关联方其他应收款占比',
                type: 'line',
                data: data3_related,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.blue },
                itemStyle: { color: GLOBAL_COLORS.blue },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.blue,
                    formatter: function(params) { return params.value.toFixed(1) + '%'; }
                },
                markLine: {
                    data: [
                        { yAxis: 20, name: '警戒线=20%', lineStyle: { color: GLOBAL_COLORS.red, type: 'dashed', width: 2 } }
                    ]
                }
            },
            {
                name: '受限资金占比',
                type: 'line',
                data: data3_restricted,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.gray },
                itemStyle: { color: GLOBAL_COLORS.gray },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.gray,
                    formatter: function(params) { return params.value.toFixed(1) + '%'; }
                }
            }
        ],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart3.setOption(option3);
    charts.push(chart3);

    // ========== 子图4：对外担保净资产占比 ==========
    const chart4 = echarts.init(chartContainers[3]);
    const data4 = processedData.map(d => parseFloat(d.guarantee_ratio) || 0);
    const option4 = {
        title: { text: '对外担保净资产占比', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['对外担保净资产占比'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(1) + '%';
                }
            }
        },
        series: [{
            name: '对外担保净资产占比',
            type: 'bar',
            data: data4,
            itemStyle: { color: GLOBAL_COLORS.yellow },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: GLOBAL_COLORS.yellow,
                formatter: function(params) { return params.value.toFixed(1) + '%'; }
            },
            markLine: {
                data: [
                    { yAxis: 15, name: '警戒线=15%', lineStyle: { color: GLOBAL_COLORS.red, type: 'dashed', width: 2 } }
                ]
            }
        }],
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