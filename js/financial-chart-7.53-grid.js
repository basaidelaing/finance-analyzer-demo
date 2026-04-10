/**
 * 7.53 经营投资资本支出结构 - 专用渲染函数
 * 第一个图表：气泡图+发展轨迹（参照7.11）
 * 后续图表：按配置渲染
 */

async function build753Dashboard(container, config, data, currentGroup, currentCompany) {
    // 清空容器
    container.innerHTML = '';
    container.style.display = 'block';
    
    // 按年份排序
    const processedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());

    // ========== 加载7.12的CSV数据获取revenue ==========
    let revenueData = {};
    try {
        const response = await fetch('7.12.csv');
        const csvText = await response.text();
        const lines = csvText.split('\n').filter(line => line.trim());
        const header = lines[0].split(',').map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));
        const revenueIndex = header.indexOf('revenue');
        const yearIndex = header.indexOf('year');
        
        if (revenueIndex !== -1 && yearIndex !== -1) {
            lines.slice(1).forEach(line => {
                const cols = line.split(',').map(c => c.trim().replace(/^"/, '').replace(/"$/, ''));
                const year = cols[yearIndex];
                const revenue = parseFloat(cols[revenueIndex]) || 0;
                if (year && !isNaN(revenue)) {
                    revenueData[year] = revenue / 10000; // 万元转亿元
                }
            });
        }
    } catch (e) {
        console.error('加载7.12 CSV失败:', e);
    }

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
    container.style.minHeight = '1500px';
    container.style.height = 'auto';
    if (container.parentElement) {
        container.parentElement.style.height = 'auto';
        container.parentElement.style.minHeight = '1500px';
    }

    // ========== 创建图表容器 ==========
    // 第一个图表：气泡图（较大）
    const chart1Wrapper = document.createElement('div');
    chart1Wrapper.className = 'chart-wrapper';
    chart1Wrapper.style.width = '100%';
    chart1Wrapper.style.minHeight = '600px';
    chart1Wrapper.style.background = 'white';
    chart1Wrapper.style.borderRadius = '8px';
    chart1Wrapper.style.padding = '15px';
    const chart1Div = document.createElement('div');
    chart1Div.className = 'chart';
    chart1Div.style.height = '530px';
    chart1Div.id = '753-chart-0';
    chart1Wrapper.appendChild(chart1Div);
    container.appendChild(chart1Wrapper);

    // 第二个图表：分组柱状图（CAPEX内生强度 + M&A依赖度）
    const chart2Wrapper = document.createElement('div');
    chart2Wrapper.className = 'chart-wrapper';
    chart2Wrapper.style.width = '100%';
    chart2Wrapper.style.minHeight = '450px';
    chart2Wrapper.style.background = 'white';
    chart2Wrapper.style.borderRadius = '8px';
    chart2Wrapper.style.padding = '15px';
    const chart2Div = document.createElement('div');
    chart2Div.className = 'chart';
    chart2Div.style.height = '380px';
    chart2Div.id = '753-chart-1';
    chart2Wrapper.appendChild(chart2Div);
    container.appendChild(chart2Wrapper);

    // ========== 初始化图表 ==========
    const charts = [];

    // ========== 子图1：气泡图+发展轨迹（参照7.11） ==========
    const chart1 = echarts.init(chart1Div);
    
    // 准备气泡图数据
    const bubbleData = processedData.map(d => {
        const year = parseInt(d.year);
        // 从CSV中读取数据 - 处理可能的乱码字段名
        const bloodTransfusion = parseFloat(d['输血占比'] || d[Object.keys(d)[3]]) || 0;
        const bloodProduction = parseFloat(d['造血占比'] || d[Object.keys(d)[4]]) || 0;
        const totalAssets = revenueData[year.toString()] || 100; // 从7.12获取revenue
        
        return {
            x: bloodTransfusion,
            y: bloodProduction,
            year: year,
            name: d.name,
            totalAssets: totalAssets,
            value: [bloodTransfusion, bloodProduction, year, totalAssets]
        };
    }).filter(d => !isNaN(d.x) && !isNaN(d.y));

    // 按年份排序
    bubbleData.sort((a, b) => a.year - b.year);
    const minYear = bubbleData[0]?.year || 2015;
    const maxYear = bubbleData[bubbleData.length - 1]?.year || 2024;
    const minAssets = Math.min(...bubbleData.map(d => d.totalAssets));
    const maxAssets = Math.max(...bubbleData.map(d => d.totalAssets));

    const option1 = {
        title: { text: '造血输血 vs 总资产 - 发展轨迹', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
        tooltip: { 
            trigger: 'item',
            formatter: function(params) {
                if (params.seriesType === 'line') {
                    return `<div><strong>发展趋势</strong></div>`;
                }
                const d = params.data;
                return `
<div><strong>${d.year}年</strong></div>
<div>输血占比: ${d.x.toFixed(2)}%</div>
<div>造血占比: ${d.y.toFixed(2)}%</div>
<div>总资产: ${d.totalAssets.toFixed(2)} 亿元</div>
`;
            }
        },
        legend: { top: 35, data: ['发展趋势', '年度数据点'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 80, top: 80 },
        xAxis: { 
            type: 'value', 
            name: '输血占比 (%)',
            min: 0,
            max: 50,
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(0) + '%';
                }
            }
        },
        yAxis: { 
            type: 'value', 
            name: '造血占比 (%)',
            min: 0,
            max: 50,
            axisLabel: {
                formatter: function(value) {
                    return value.toFixed(0) + '%';
                }
            }
        },
        series: [
            // 发展趋势线
            {
                name: '发展趋势',
                type: 'line',
                data: bubbleData.map(d => [d.x, d.y]),
                zlevel: 1,
                lineStyle: {
                    width: 2,
                    color: '#888888',
                    type: 'dashed',
                    dashOffset: 5
                },
                smooth: true,
                smoothMonotone: 'x',
                endSymbol: 'arrow',
                endSymbolSize: 12,
                symbol: 'none'
            },
            // 气泡散点
            {
                name: '年度数据点',
                type: 'scatter',
                data: bubbleData.map(d => {
                    const size = 15 + 25 * (d.totalAssets - minAssets) / (maxAssets - minAssets || 1);
                    const ratio = (d.year - minYear) / (maxYear - minYear || 1);
                    // 从蓝到红渐变
                    const r = Math.round(30 + ratio * (244 - 30));
                    const g = Math.round(136 + ratio * (67 - 136));
                    const b = Math.round(229 + ratio * (54 - 229));
                    const isLatest = d.year === maxYear;
                    return {
                        value: [d.x, d.y, size],
                        name: d.year.toString(),
                        year: d.year,
                        x: d.x,
                        y: d.y,
                        totalAssets: d.totalAssets,
                        itemStyle: {
                            color: `rgb(${r},${g},${b})`,
                            borderWidth: isLatest ? 4 : 2,
                            borderColor: isLatest ? '#000' : '#fff'
                        },
                        label: {
                            show: true,
                            formatter: '{b}',
                            position: 'top',
                            fontSize: isLatest ? 13 : 11,
                            fontWeight: isLatest ? 'bold' : 'normal'
                        }
                    };
                }),
                zlevel: 2,
                symbolSize: function(val) {
                    return val[2];
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

    // ========== 子图2：分组柱状图 - CAPEX内生强度 + M&A依赖度 ==========
    const chart2 = echarts.init(chart2Div);
    const capexData = processedData.map(d => {
        const val = parseFloat(d[Object.keys(d)[5]]);
        return isNaN(val) ? 0 : val;
    });
    const maData = processedData.map(d => {
        const val = parseFloat(d[Object.keys(d)[6]]);
        return isNaN(val) ? 0 : val;
    });
    
    const option2 = {
        title: { text: 'CAPEX内生强度 vs M&A依赖度', left: 'center', textStyle: { fontSize: 14 }, top: 5 },
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
        legend: { top: 35, data: ['CAPEX内生强度', 'M&A依赖度'] },
        toolbox: { show: true, right: 15, top: 15 },
        grid: { left: '10%', right: '10%', bottom: 60, top: 80 },
        xAxis: { type: 'category', data: years },
        yAxis: [
            {
                type: 'value',
                name: 'CAPEX内生强度 (%)',
                position: 'left',
                axisLabel: {
                    formatter: function(value) {
                        return value.toFixed(2) + '%';
                    }
                }
            },
            {
                type: 'value',
                name: 'M&A依赖度 (%)',
                position: 'right',
                axisLabel: {
                    formatter: function(value) {
                        return value.toFixed(2) + '%';
                    }
                }
            }
        ],
        series: [
            {
                name: 'CAPEX内生强度',
                type: 'bar',
                data: maData,
                itemStyle: { color: GLOBAL_COLORS.blue },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.blue,
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
                },
                yAxisIndex: 0
            },
            {
                name: 'M&A依赖度',
                type: 'bar',
                data: capexData,
                itemStyle: { color: GLOBAL_COLORS.yellow },
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 10,
                    color: GLOBAL_COLORS.yellow,
                    formatter: function(params) { return params.value.toFixed(2) + '%'; }
                },
                yAxisIndex: 1
            }
        ],
        dataZoom: [
            { type: 'inside', start: 0, end: 100 },
            { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
        ]
    };
    chart2.setOption(option2);
    charts.push(chart2);

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