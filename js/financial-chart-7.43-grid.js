/**
 * 7.43 高估低估指标综合评分 - 专用渲染函数
 * 多图联动、2x2网格布局、背景颜色分区、警戒线
 */

async function build743Dashboard(container, config, data, allData, currentGroup, currentCompany) {
    // 清空容器
    container.innerHTML = '';
    container.style.display = 'block';
    
    // ========== 先添加卡片显示 ==========
    // 获取最新一年的数据
    const sortedData = [...(allData || data)].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    // 阈值和评级逻辑
    function getRating(index) {
        const idx = parseFloat(index) || 0;
        if (idx < 0.8) {
            return { level: 'green', text: '保守', desc: '计提充分，风险较低' };
        } else if (idx <= 1.2) {
            return { level: 'yellow', text: '中性', desc: '计提适中，风险可控' };
        } else {
            return { level: 'red', text: '激进', desc: '计提不足，风险较高' };
        }
    }
    
    // 获取四个指数的评级
    const arIndex = parseFloat(latestData?.ar_index) || 0;
    const arRating = getRating(arIndex);
    
    const invIndex = parseFloat(latestData?.inventory_index) || 0;
    const invRating = getRating(invIndex);
    
    const faIndex = parseFloat(latestData?.fa_index) || 0;
    const faRating = getRating(faIndex);
    
    const compIndex = parseFloat(latestData?.comprehensive_index) || 0;
    const compRating = getRating(compIndex);
    
    // 综合评级逻辑
    function getOverallRating(ratings) {
        const redCount = ratings.filter(r => r.level === 'red').length;
        const yellowCount = ratings.filter(r => r.level === 'yellow').length;
        
        if (redCount >= 2) {
            return { level: 'red', text: '整体偏激进', desc: '多项指数显示计提不足' };
        } else if (redCount === 1 || yellowCount >= 2) {
            return { level: 'yellow', text: '整体中性', desc: '部分指数需关注' };
        } else {
            return { level: 'green', text: '整体偏保守', desc: '各项指数计提充分' };
        }
    }
    
    const overallRating = getOverallRating([arRating, invRating, faRating, compRating]);
    
    // 颜色映射
    const colorMap = {
        green: { bg: '#ffffff', border: '#2E7D32', text: '#1B5E20', borderWidth: '4px' },
        yellow: { bg: '#ffffff', border: '#FF9800', text: '#E65100', borderWidth: '4px' },
        red: { bg: '#ffffff', border: '#f44336', text: '#B71C1C', borderWidth: '4px' }
    };
    
    // 生成4个指数卡片
    const arColors = colorMap[arRating.level];
    const invColors = colorMap[invRating.level];
    const faColors = colorMap[faRating.level];
    const compColors = colorMap[compRating.level];
    const overallColors = colorMap[overallRating.level];
    
    const cardsHtml = `
        <div style="
            background: transparent;
            padding: 0;
            margin: 0 0 20px 0;
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            ">
                <h3 style="margin: 0; font-size: 14px; color: #374151; font-weight: 600;">
                    📊 ${latestYear}年 高估低估健康度 - 快速概览
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${arColors.bg};
                    border: ${arColors.borderWidth} solid ${arColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${arColors.text};">应收账款指数</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${arColors.text}; margin: 6px 0;">
                        ${arIndex.toFixed(4)}
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${arColors.text}; margin-bottom: 2px;">
                        ${arRating.text}（0.8-1.2为中性）
                    </div>
                    <div style="font-size: 10px; color: ${arColors.text}; opacity: 0.7; line-height: 1.2;">${arRating.desc}</div>
                </div>
                
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${invColors.bg};
                    border: ${invColors.borderWidth} solid ${invColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${invColors.text};">存货指数</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${invColors.text}; margin: 6px 0;">
                        ${invIndex.toFixed(4)}
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${invColors.text}; margin-bottom: 2px;">
                        ${invRating.text}（0.8-1.2为中性）
                    </div>
                    <div style="font-size: 10px; color: ${invColors.text}; opacity: 0.7; line-height: 1.2;">${invRating.desc}</div>
                </div>
                
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${faColors.bg};
                    border: ${faColors.borderWidth} solid ${faColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${faColors.text};">固定资产指数</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${faColors.text}; margin: 6px 0;">
                        ${faIndex.toFixed(4)}
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${faColors.text}; margin-bottom: 2px;">
                        ${faRating.text}（0.8-1.2为中性）
                    </div>
                    <div style="font-size: 10px; color: ${faColors.text}; opacity: 0.7; line-height: 1.2;">${faRating.desc}</div>
                </div>
                
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${overallColors.bg};
                    border: ${overallColors.borderWidth} solid ${overallColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${overallColors.text};">综合评级</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${overallColors.text}; margin: 6px 0;">
                        ${overallRating.text}
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${overallColors.text}; margin-bottom: 2px;">
                        ${compIndex.toFixed(4)}
                    </div>
                    <div style="font-size: 10px; color: ${overallColors.text}; opacity: 0.7; line-height: 1.2;">${overallRating.desc}</div>
                </div>
            </div>
        </div>
    `;
    
    // 添加卡片到容器
    container.innerHTML = cardsHtml;
    
    // 按年份排序（用于图表）
    const processedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());

    // ========== 计算行业中位数 ==========
    // 按年份分组所有数据
    const yearGroups = {};
    (allData || data).forEach(row => {
        const year = row.year;
        if (!yearGroups[year]) {
            yearGroups[year] = [];
        }
        yearGroups[year].push(row);
    });
    
    // 计算每个字段的中位数
    function calculateMedian(year, fieldName) {
        const yearData = yearGroups[year] || [];
        const values = yearData
            .map(row => parseFloat(row[fieldName]))
            .filter(val => !isNaN(val))
            .sort((a, b) => a - b);
        
        if (values.length === 0) return 0;
        
        const mid = Math.floor(values.length / 2);
        if (values.length % 2 === 0) {
            return (values[mid - 1] + values[mid]) / 2;
        } else {
            return values[mid];
        }
    }
    
    // 生成各字段的中位数数组
    const arRatioMedian = years.map(year => calculateMedian(year, 'accounts_receivable_ratio'));
    const invRatioMedian = years.map(year => calculateMedian(year, 'inventory_ratio'));
    const faRatioMedian = years.map(year => calculateMedian(year, 'fixed_assets_ratio'));
    const compRatioMedian = years.map(year => calculateMedian(year, 'comprehensive_ratio'));

    // ========== 全局样式配置 - 统一色号规范 ==========
    const GLOBAL_COLORS = {
        blue: '#1E88E5',
        red: '#f44336',
        yellow: '#FF9800',
        green: '#2E7D32',
        gray: '#9E9E9E',
        darkGray: '#616161'
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
        chartDiv.id = `743-chart-${i}`;
        wrapper.appendChild(chartDiv);
        chartContainers.push(chartDiv);
        gridContainer.appendChild(wrapper);
    }

    container.appendChild(gridContainer);

    // ========== 初始化4个图表 ==========
    const charts = [];

    // ========== 子图1：应收账款减值准备率 ==========
    const chart1 = echarts.init(chartContainers[0]);
    const data1 = processedData.map(d => (parseFloat(d.accounts_receivable_ratio) || 0) * 100);
    const median1 = arRatioMedian.map(val => val * 100);
    const option1 = {
        title: { text: '应收账款减值准备率', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['应收账款减值准备率', '行业中位数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '减值准备率(%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2) + '%';
                }
            }
        },
        series: [
            {
                name: '应收账款减值准备率',
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
            },
            {
                name: '行业中位数',
                type: 'line',
                data: median1,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.gray, type: 'dashed' },
                itemStyle: { color: GLOBAL_COLORS.gray },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.gray,
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
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

    // ========== 子图2：存货减值准备率 ==========
    const chart2 = echarts.init(chartContainers[1]);
    const data2 = processedData.map(d => (parseFloat(d.inventory_ratio) || 0) * 100);
    const median2 = invRatioMedian.map(val => val * 100);
    const option2 = {
        title: { text: '存货减值准备率', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['存货减值准备率', '行业中位数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '减值准备率(%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2) + '%';
                }
            }
        },
        series: [
            {
                name: '存货减值准备率',
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
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
                }
            },
            {
                name: '行业中位数',
                type: 'line',
                data: median2,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.gray, type: 'dashed' },
                itemStyle: { color: GLOBAL_COLORS.gray },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.gray,
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
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

    // ========== 子图3：固定资产减值准备率 ==========
    const chart3 = echarts.init(chartContainers[2]);
    const data3 = processedData.map(d => (parseFloat(d.fixed_assets_ratio) || 0) * 100);
    const median3 = faRatioMedian.map(val => val * 100);
    const option3 = {
        title: { text: '固定资产减值准备率', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['固定资产减值准备率', '行业中位数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '减值准备率(%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2) + '%';
                }
            }
        },
        series: [
            {
                name: '固定资产减值准备率',
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
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
                }
            },
            {
                name: '行业中位数',
                type: 'line',
                data: median3,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.gray, type: 'dashed' },
                itemStyle: { color: GLOBAL_COLORS.gray },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.gray,
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
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

    // ========== 子图4：激进保守综合指数 ==========
    const chart4 = echarts.init(chartContainers[3]);
    const data4 = processedData.map(d => (parseFloat(d.comprehensive_ratio) || 0) * 100);
    const median4 = compRatioMedian.map(val => val * 100);
    const option4 = {
        title: { text: '激进保守综合指数', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['激进保守综合指数', '行业中位数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '综合比率(%)',
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(2) + '%';
                }
            }
        },
        series: [
            {
                name: '激进保守综合指数',
                type: 'line',
                data: data4,
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
                name: '行业中位数',
                type: 'line',
                data: median4,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.gray, type: 'dashed' },
                itemStyle: { color: GLOBAL_COLORS.gray },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.gray,
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