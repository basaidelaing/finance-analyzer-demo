/**
 * 7.42 减值损失变动收益平滑 - 专用渲染函数
 * 多图联动、2x2网格布局、背景颜色分区、警戒线、标准差区间
 */

async function build742Dashboard(container, config, data, currentGroup, currentCompany) {
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
        chartDiv.id = `742-chart-${i}`;
        wrapper.appendChild(chartDiv);
        chartContainers.push(chartDiv);
        gridContainer.appendChild(wrapper);
    }

    container.appendChild(gridContainer);

    // ========== 初始化4个图表 ==========
    const charts = [];

    // ========== 子图1：减值侵蚀率趋势 ==========
    const chart1 = echarts.init(chartContainers[0]);
    const data1 = processedData.map(d => parseFloat(d.impairment_erosion_ratio) || 0);
    const option1 = {
        title: { text: '减值侵蚀率趋势', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['减值侵蚀率'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)',
            min: 0,
            max: 25
        },
        series: [{
            name: '减值侵蚀率',
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
                    { yAxis: 5, name: '5%黄线', lineStyle: { color: GLOBAL_COLORS.yellow, type: 'dashed', width: 2 } },
                    { yAxis: 15, name: '15%红线', lineStyle: { color: GLOBAL_COLORS.red, type: 'dashed', width: 2 } }
                ]
            },
            markArea: {
                silent: true,
                data: [
                    [
                        { yAxis: 0, itemStyle: { color: 'rgba(46, 125, 50, 0.1)' } },
                        { yAxis: 5 }
                    ],
                    [
                        { yAxis: 5, itemStyle: { color: 'rgba(255, 152, 0, 0.1)' } },
                        { yAxis: 15 }
                    ],
                    [
                        { yAxis: 15, itemStyle: { color: 'rgba(244, 67, 54, 0.1)' } },
                        { yAxis: 25 }
                    ]
                ]
            }
        }],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
    };
    chart1.setOption(option1);
    charts.push(chart1);

    // ========== 子图2：公允价值变动和资产处置收益趋势 ==========
    const chart2 = echarts.init(chartContainers[1]);
    const data2_fv = processedData.map(d => parseFloat(d.fv_change_ratio) || 0);
    const data2_dispose = processedData.map(d => parseFloat(d.dispose_ratio) || 0);
    const option2 = {
        title: { text: '公允价值变动和资产处置收益趋势', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['公允价值变动损益占比', '资产处置收益占比'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)'
        },
        series: [
            {
                name: '公允价值变动损益占比',
                type: 'line',
                data: data2_fv,
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
                name: '资产处置收益占比',
                type: 'line',
                data: data2_dispose,
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
    chart2.setOption(option2);
    charts.push(chart2);

    // ========== 子图3：损失结构占比 ==========
    const chart3 = echarts.init(chartContainers[2]);
    // 注意：CSV中没有total_impairment_loss字段，我们使用减值侵蚀率作为替代
    const data3 = processedData.map(d => Math.abs(parseFloat(d.impairment_erosion_ratio) || 0));
    const option3 = {
        title: { text: '损失结构占比', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['减值损失'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)'
        },
        series: [{
            name: '减值损失',
            type: 'bar',
            data: data3,
            itemStyle: { color: '#4CAF50' },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: '#4CAF50',
                formatter: function(params) { return params.value.toFixed(2); }
            }
        }],
        dataZoom: [{ type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }]
    };
    chart3.setOption(option3);
    charts.push(chart3);

    // ========== 子图4：非核心收益波动线 ==========
    const chart4 = echarts.init(chartContainers[3]);
    
    // 过滤2013年之后的数据（从2014年开始）
    const filteredData = processedData.filter(d => parseInt(d.year) >= 2014);
    const filteredYears = filteredData.map(d => d.year.toString());
    
    const data4_main = filteredData.map(d => parseFloat(d.non_core_total_ratio) || 0);
    const data4_std = filteredData.map(d => parseFloat(d.non_core_threeyear_std) || 0);
    
    // 计算上下边界 - 正确的标准差计算：均值±标准差
    const data4_upper = data4_main.map((val, idx) => val + data4_std[idx]);
    const data4_lower = data4_main.map((val, idx) => val - data4_std[idx]);
    
    // 构建正确的区间数据格式：[lower, upper]
    const rangeData = data4_main.map((_, idx) => [data4_lower[idx], data4_upper[idx]]);
    
    // 调试输出，确认数据正确
    console.log('=== 7.42 第4个图调试信息 ===');
    console.log('过滤后的年份:', filteredYears);
    console.log('主数据:', data4_main);
    console.log('标准差:', data4_std);
    console.log('上边界:', data4_upper);
    console.log('下边界:', data4_lower);
    console.log('区间数据:', rangeData);
    
    // 使用ECharts正确的标准差区间画法
    const option4 = {
        title: { text: '非核心收益波动线', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
        tooltip: { 
            trigger: 'axis',
            formatter: function(params) {
                let result = `<div><strong>${params[0].name}年</strong></div>`;
                const dataIndex = params[0].dataIndex;
                result += `<div style="color:#1E88E5">■ 非核心收益占比: ${data4_main[dataIndex].toFixed(2)}%</div>`;
                result += `<div style="color:#9E9E9E">■ ±3年标准差区间: [${data4_lower[dataIndex].toFixed(2)}%, ${data4_upper[dataIndex].toFixed(2)}%]</div>`;
                return result;
            }
        },
        legend: { top: 35, data: ['非核心收益占比', '非核心收益占比波动区间'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: filteredYears },
        yAxis: { 
            type: 'value', 
            name: '占比 (%)'
        },
        series: [
            {
                name: '非核心收益占比波动区间',
                type: 'line',
                data: rangeData,
                smooth: true,
                lineStyle: { width: 0 },
                itemStyle: { color: 'transparent' },
                areaStyle: {
                    color: 'rgba(158, 158, 158, 0.2)'
                },
                z: 1
            },
            {
                name: '非核心收益占比波动区间',
                type: 'line',
                data: data4_upper,
                smooth: true,
                lineStyle: { width: 1, color: '#9E9E9E', type: 'dashed' },
                itemStyle: { color: '#9E9E9E' },
                z: 2,
                silent: true
            },
            {
                name: '非核心收益占比波动区间',
                type: 'line',
                data: data4_lower,
                smooth: true,
                lineStyle: { width: 1, color: '#9E9E9E', type: 'dashed' },
                itemStyle: { color: '#9E9E9E' },
                z: 2,
                silent: true
            },
            {
                name: '非核心收益占比',
                type: 'line',
                data: data4_main,
                smooth: true,
                lineStyle: { width: 3, color: GLOBAL_COLORS.blue },
                itemStyle: { color: GLOBAL_COLORS.blue },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.blue,
                    formatter: function(params) { return params.value.toFixed(2); }
                },
                z: 3
            }
        ],
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
