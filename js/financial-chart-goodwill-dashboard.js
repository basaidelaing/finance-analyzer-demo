/**
 * 商誉减值摊销压力测试仪表盘
 * 专用渲染函数：多图联动、2x2网格布局、数据卡片
 */

function buildGoodwillDashboard(container, config, data) {
    // 清空容器
    container.innerHTML = '';
    container.style.display = 'block';
    
    // 按年份排序
    const processedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    const latestYear = years[years.length - 1];
    const latestData = processedData[processedData.length - 1];

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

    // ========== 先插入卡片容器（移到最前面） ==========
    const secondCardContainer = document.createElement('div');
    
    // ========== 插入第2个图表：关键指标安全评级卡片 ==========
    // 计算商誉暴雷风险
    const goodwillRatio = parseFloat(latestData?.goodwill_to_equity_ratio) || 0;
    let goodwillRating;
    if (goodwillRatio < 5) {
        goodwillRating = { level: 'green', text: '无风险', desc: '商誉暴雷风险极低' };
    } else if (goodwillRatio < 20) {
        goodwillRating = { level: 'yellow', text: '低风险', desc: '需关注商誉变化' };
    } else if (goodwillRatio < 30) {
        goodwillRating = { level: 'yellow', text: '中风险', desc: '警惕减值风险' };
    } else {
        goodwillRating = { level: 'red', text: '高风险', desc: '暴雷可能性大' };
    }
    
    // 计算摊销政策激进指数
    const amortIndex = parseFloat(latestData?.amortization_radical_index) || 0;
    let amortRating;
    if (amortIndex < 0.8) {
        amortRating = { level: 'green', text: '保守', desc: '摊销负担显著轻于行业' };
    } else if (amortIndex <= 1.2) {
        amortRating = { level: 'yellow', text: '中性', desc: '与行业相当' };
    } else {
        amortRating = { level: 'red', text: '激进', desc: '摊销负担重于行业' };
    }
    
    // 计算核心无形资产真实回报率
    let intangibleReturn = 0;
    const keys3 = Object.keys(latestData || {});
    for (let k of keys3) {
        if (k.includes('intangible') || k.includes('return')) {
            intangibleReturn = (parseFloat(latestData[k]) || 0) / 100; // 原始数据是百分比，除以100
            break;
        }
    }
    let intangibleRating;
    if (intangibleReturn > 50) {
        intangibleRating = { level: 'green', text: '极高效', desc: '无形资产创利能力极强' };
    } else if (intangibleReturn > 10) {
        intangibleRating = { level: 'green', text: '高效', desc: '无形资产创利能力良好' };
    } else if (intangibleReturn > 1) {
        intangibleRating = { level: 'yellow', text: '一般', desc: '无形资产创利能力一般' };
    } else {
        intangibleRating = { level: 'red', text: '低效', desc: '需警惕资产闲置或减值' };
    }
    
    // 计算摊销影响
    let amortBefore = 0, coreProfit = 0;
    const keys4 = Object.keys(latestData || {});
    for (let k of keys4) {
        if (k.includes('amortization') && k.includes('before')) {
            amortBefore = parseFloat(latestData[k]) || 0;
        }
        if (k.includes('core') && k.includes('profit')) {
            coreProfit = parseFloat(latestData[k]) || 0;
        }
    }
    const amortDiff = Math.abs(amortBefore - coreProfit);
    let amortImpactRating;
    if (amortDiff < 0.5) {
        amortImpactRating = { level: 'green', text: '无实质影响', desc: '摊销对利润影响极小' };
    } else if (amortDiff < 2) {
        amortImpactRating = { level: 'green', text: '轻微影响', desc: '摊销对利润影响较小' };
    } else if (amortDiff < 5) {
        amortImpactRating = { level: 'yellow', text: '中等影响', desc: '摊销对利润有一定影响' };
    } else {
        amortImpactRating = { level: 'red', text: '显著影响', desc: '摊销侵蚀利润严重' };
    }
    
    // 颜色映射
    const colorMap = {
        green: { bg: '#ffffff', border: '#2E7D32', text: '#065f46', borderWidth: '4px' },
        yellow: { bg: '#ffffff', border: '#FF9800', text: '#92400e', borderWidth: '4px' },
        red: { bg: '#ffffff', border: '#f44336', text: '#991b1b', borderWidth: '4px' }
    };
    
    const goodwillColors = colorMap[goodwillRating.level];
    const amortColors = colorMap[amortRating.level];
    const intangibleColors = colorMap[intangibleRating.level];
    const amortImpactColors = colorMap[amortImpactRating.level];
    
    const secondCardsHtml = `
        <div style="
            background: transparent;
            padding: 0;
            margin: 0 0 12px 0;
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            ">
                <h3 style="margin: 0; font-size: 14px; color: #374151; font-weight: 600;">
                    📊 ${latestData?.year || latestYear}年 并购无形资产质量 - 安全评级
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${goodwillColors.bg};
                    border: ${goodwillColors.borderWidth} solid ${goodwillColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${goodwillColors.text};">商誉暴雷风险</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${goodwillColors.text}; margin: 6px 0;">
                        ${goodwillRatio.toFixed(2)}%
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${goodwillColors.text}; margin-bottom: 2px;">
                        ${goodwillRating.text}
                    </div>
                    <div style="font-size: 10px; color: ${goodwillColors.text}; opacity: 0.7; line-height: 1.2;">${goodwillRating.desc}</div>
                </div>
                
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${amortColors.bg};
                    border: ${amortColors.borderWidth} solid ${amortColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${amortColors.text};">摊销政策激进指数</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${amortColors.text}; margin: 6px 0;">
                        ${amortIndex.toFixed(2)}
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${amortColors.text}; margin-bottom: 2px;">
                        ${amortRating.text}
                    </div>
                    <div style="font-size: 10px; color: ${amortColors.text}; opacity: 0.7; line-height: 1.2;">${amortRating.desc}</div>
                </div>
                
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${intangibleColors.bg};
                    border: ${intangibleColors.borderWidth} solid ${intangibleColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${intangibleColors.text};">核心无形资产真实回报率</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${intangibleColors.text}; margin: 6px 0;">
                        ${intangibleReturn.toFixed(2)}倍
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${intangibleColors.text}; margin-bottom: 2px;">
                        ${intangibleRating.text}
                    </div>
                    <div style="font-size: 10px; color: ${intangibleColors.text}; opacity: 0.7; line-height: 1.2;">${intangibleRating.desc}</div>
                </div>
                
                <div style="
                    flex: 1;
                    min-width: 180px;
                    max-width: 220px;
                    background: ${amortImpactColors.bg};
                    border: ${amortImpactColors.borderWidth} solid ${amortImpactColors.border};
                    border-radius: 6px;
                    padding: 10px 12px;
                    margin: 0;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
                ">
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 13px; font-weight: 600; color: ${amortImpactColors.text};">摊销影响</span>
                    </div>
                    <div style="font-size: 24px; font-weight: 700; color: ${amortImpactColors.text}; margin: 6px 0;">
                        ${amortDiff.toFixed(2)} pct
                    </div>
                    <div style="font-size: 12px; font-weight: 600; color: ${amortImpactColors.text}; margin-bottom: 2px;">
                        ${amortImpactRating.text}
                    </div>
                    <div style="font-size: 10px; color: ${amortImpactColors.text}; opacity: 0.7; line-height: 1.2;">${amortImpactRating.desc}</div>
                </div>
            </div>
        </div>
    `;
    
    secondCardContainer.innerHTML = secondCardsHtml;
    container.appendChild(secondCardContainer);

    // ========== 创建2x2网格布局（第1个大图表：4个小图表） ==========
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
        chartDiv.id = `goodwill-chart-${i}`;
        wrapper.appendChild(chartDiv);
        chartContainers.push(chartDiv);
        gridContainer.appendChild(wrapper);
    }

    container.appendChild(gridContainer);

    // ========== 初始化4个图表 ==========
    const charts = [];

    // 子图1：商誉暴雷悬崖指数
    const chart1 = echarts.init(chartContainers[0]);
    const data1 = processedData.map(d => parseFloat(d.goodwill_to_equity_ratio) || 0);
    const option1 = {
        title: { text: '商誉暴雷悬崖指数', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['商誉/归母净资产'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            min: 0,
            max: 50
        },
        visualMap: {
            show: false,
            pieces: [
                { lte: 20, color: 'rgba(46, 125, 50, 0.1)' },     // 绿色：<20%
                { gt: 20, lte: 30, color: 'rgba(255, 152, 0, 0.1)' }, // 黄色：20-30%
                { gt: 30, color: 'rgba(244, 67, 54, 0.1)' }            // 红色：>30%
            ]
        },
        series: [{
            name: '商誉/归母净资产',
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
            },
            markLine: {
                data: [
                    { yAxis: 20, name: '20%黄灯', lineStyle: { color: GLOBAL_COLORS.yellow, type: 'dashed', width: 2 } },
                    { yAxis: 30, name: '30%红灯', lineStyle: { color: GLOBAL_COLORS.red, type: 'dashed', width: 2 } }
                ]
            },
            markArea: {
                silent: true,
                data: [
                    [
                        { yAxis: 0, itemStyle: { color: 'rgba(46, 125, 50, 0.1)' } },
                        { yAxis: 20 }
                    ],
                    [
                        { yAxis: 20, itemStyle: { color: 'rgba(255, 152, 0, 0.1)' } },
                        { yAxis: 30 }
                    ],
                    [
                        { yAxis: 30, itemStyle: { color: 'rgba(244, 67, 54, 0.1)' } },
                        { yAxis: 50 }
                    ]
                ]
            }
        }],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
    };
    chart1.setOption(option1);
    charts.push(chart1);

    // 子图2：摊销政策激进指数
    const chart2 = echarts.init(chartContainers[1]);
    const data2 = processedData.map(d => parseFloat(d.amortization_radical_index) || 0);
    const option2 = {
        title: { text: '摊销政策激进指数', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['摊销激进指数'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { type: 'value', name: '倍数' },
        series: [{
            name: '摊销激进指数',
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

    // 子图3：核心无形资产真实回报率
    const chart3 = echarts.init(chartContainers[2]);
    const data3 = processedData.map(d => {
        const keys = Object.keys(d);
        for (let k of keys) {
            if (k.includes('intangible') || k.includes('return')) {
                return (parseFloat(d[k]) || 0) / 100; // 原始数据是百分比，除以100
            }
        }
        return 0;
    });
    const option3 = {
        title: { text: '核心无形资产真实回报率', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
        tooltip: { 
            trigger: 'axis',
            formatter: function(params) {
                let result = `<div><strong>${params[0].name}年</strong></div>`;
                params.forEach(p => {
                    result += `<div style="color:${p.color}">■ ${p.seriesName}: ${p.value.toFixed(2)}倍</div>`;
                });
                return result;
            }
        },
        legend: { top: 35, data: ['真实回报率'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { type: 'value', name: '倍数' },
        series: [{
            name: '真实回报率',
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
            }
        }],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
    };
    chart3.setOption(option3);
    charts.push(chart3);

    // 子图4：摊销对利润的影响
    const chart4 = echarts.init(chartContainers[3]);
    const data4a = processedData.map(d => {
        const keys = Object.keys(d);
        for (let k of keys) {
            if (k.includes('amortization') && k.includes('before')) {
                return parseFloat(d[k]) || 0;
            }
        }
        return 0;
    });
    const data4b = processedData.map(d => {
        const keys = Object.keys(d);
        for (let k of keys) {
            if (k.includes('core') && k.includes('profit')) {
                return parseFloat(d[k]) || 0;
            }
        }
        return 0;
    });
    const option4 = {
        title: { text: '摊销前利润率 vs 核心利润率', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['摊销前利润率', '核心利润率'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { type: 'value', name: '利润率 (%)' },
        series: [
            {
                name: '摊销前利润率',
                type: 'line',
                data: data4a,
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
                name: '核心利润率',
                type: 'line',
                data: data4b,
                smooth: true,
                lineStyle: { width: 2, color: GLOBAL_COLORS.yellow, type: 'dashed' },
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
    chart4.setOption(option4);
    charts.push(chart4);

    // 窗口大小变化响应
    window.addEventListener('resize', () => {
        charts.forEach(chart => chart.resize());
    });

    return { charts };
}