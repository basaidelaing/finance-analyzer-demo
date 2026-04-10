/**
 * 7.41 盈余质量预测Beneish M-score - 专用渲染函数
 * 多图联动、2x2网格布局、背景颜色分区、警戒线
 */

async function build741Dashboard(container, config, data, currentGroup, currentCompany) {
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
        gray: '#424242'
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
        chartDiv.id = `741-chart-${i}`;
        wrapper.appendChild(chartDiv);
        chartContainers.push(chartDiv);
        gridContainer.appendChild(wrapper);
    }

    container.appendChild(gridContainer);

    // ========== 初始化4个图表 ==========
    const charts = [];

    // ========== 子图1：SLOAN应计利润异象趋势 ==========
    const chart1 = echarts.init(chartContainers[0]);
    const data1 = processedData.map(d => (Math.abs(parseFloat(d.sloan_total_accrual) || 0)) * 100); // 转换为百分比
    const option1 = {
        title: { text: 'SLOAN应计利润异象趋势', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['SLOAN应计利润异象'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            min: 0,
            max: 60
        },
        series: [{
            name: 'SLOAN应计利润异象',
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
                formatter: function(params) { return params.value.toFixed(2); }
            }
        }],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
    };
    chart1.setOption(option1);
    charts.push(chart1);

    // ========== 子图2：应收账款指数趋势 ==========
    const chart2 = echarts.init(chartContainers[1]);
    const data2 = processedData.map(d => parseFloat(d.dsri) || 0);
    const option2 = {
        title: { text: '应收账款指数趋势', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['应收账款指数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '倍数',
            min: 0,
            max: 2.5
        },
        series: [{
            name: '应收账款指数',
            type: 'line',
            data: data2,
            smooth: true,
            lineStyle: { width: 2, color: GLOBAL_COLORS.yellow },
            itemStyle: { color: GLOBAL_COLORS.yellow },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: GLOBAL_COLORS.yellow,
                formatter: function(params) { return params.value.toFixed(2); }
            }
        }],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
    };
    chart2.setOption(option2);
    charts.push(chart2);

    // ========== 子图3：毛利率指数和营业收入增速指数趋势 ==========
    const chart3 = echarts.init(chartContainers[2]);
    const data3_gmi = processedData.map(d => parseFloat(d.gmi) || 0);
    const data3_sgi = processedData.map(d => parseFloat(d.sgi) || 0);
    const option3 = {
        title: { text: '毛利率指数和营业收入增速指数趋势', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['毛利率指数', '营业收入增速指数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '倍数',
            min: 0,
            max: 2
        },
        series: [
            {
                name: '毛利率指数',
                type: 'line',
                data: data3_gmi,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.blue },
                itemStyle: { color: GLOBAL_COLORS.blue },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.blue,
                    formatter: function(params) { return params.value.toFixed(2); }
                }
            },
            {
                name: '营业收入增速指数',
                type: 'line',
                data: data3_sgi,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.yellow },
                itemStyle: { color: GLOBAL_COLORS.yellow },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.yellow,
                    formatter: function(params) { return params.value.toFixed(2); }
                }
            }
        ],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
    };
    chart3.setOption(option3);
    charts.push(chart3);

    // ========== 子图4：利润缓冲垫趋势 ==========
    const chart4 = echarts.init(chartContainers[3]);
    const data4 = processedData.map(d => parseFloat(d.profit_buffer_pct) || 0);
    const option4 = {
        title: { text: '利润缓冲垫趋势', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['利润缓冲垫'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            min: 0,
            max: 60
        },
        series: [{
            name: '利润缓冲垫',
            type: 'bar',
            data: data4,
            itemStyle: { color: '#4CAF50' },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: '#4CAF50',
                formatter: function(params) { return params.value.toFixed(2); }
            },
            markLine: {
                data: [
                    { yAxis: 30, name: '30%黄线', lineStyle: { color: GLOBAL_COLORS.yellow, type: 'dashed', width: 2 } },
                    { yAxis: 50, name: '50%红线', lineStyle: { color: GLOBAL_COLORS.red, type: 'dashed', width: 2 } }
                ]
            },
            markArea: {
                silent: true,
                data: [
                    [
                        { yAxis: 0, itemStyle: { color: 'rgba(76, 175, 80, 0.1)' } },
                        { yAxis: 30 }
                    ],
                    [
                        { yAxis: 30, itemStyle: { color: 'rgba(255, 152, 0, 0.1)' } },
                        { yAxis: 50 }
                    ],
                    [
                        { yAxis: 50, itemStyle: { color: 'rgba(244, 67, 54, 0.1)' } },
                        { yAxis: 60 }
                    ]
                ]
            }
        }],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
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