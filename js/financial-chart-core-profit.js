/**
 * 核心利润与核心利润率双轴组合图
 * 对应指标组：7.21
 */

function buildCoreProfitOption(option, config, data) {
    // 【修复】初始化完整option结构，避免ECharts内部报错
    option = Object.assign({
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: [], top: 10 },
        xAxis: { type: 'category', data: [] },
        yAxis: [],
        series: [],
        grid: { left: '10%', right: '10%', bottom: '80px', top: '20%', containLabel: true }, // 底部留足够空间，支持负值标签显示 // 底部留80px空间放时间滑块和标注
        graphic: [],
        toolbox: { show: true, right: 15, top: 15 },
        dataZoom: []
    }, option || {});
    
    // 数据处理：按年份排序
    const processedData = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    
    // 提取数据字段
    const years = processedData.map(d => d.year.toString());
    const coreProfit = processedData.map(d => {
        const val = d.core_profit || d.core_profit_amt || 0;
        // 原始数据是万元，转换为亿元
        return (typeof val === 'number' ? val : parseFloat(val) || 0) / 10000;
    });
    const coreProfitMargin = processedData.map(d => {
        const val = d.core_profit_margin || d.core_margin || 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    // 使用最新的行业平均利润率数据（申万白酒行业，2013年起）
    const industryAvgMarginData = {
        "2013": 22.87,
        "2014": 14.52,
        "2015": 28.12,
        "2016": 31.01,
        "2017": 33.34,
        "2018": 35.33,
        "2019": 36.53,
        "2020": 37.82,
        "2021": 40.45,
        "2022": 42.18,
        "2023": 41.73,
        "2024": 37.05
    };
    const industryAvgMargin = processedData.map(d => industryAvgMarginData[d.year] || 0);

    // ========== X轴 ==========
    option.xAxis = {
        type: 'category',
        data: years,
        name: '报告期',
        axisLabel: { rotate: 0, fontSize: 12 },
        axisLine: { lineStyle: { color: '#333' } }
    };

    // ========== Y轴 - 双Y轴 ==========
    option.yAxis = [
        {
            type: 'value',
            name: '核心利润 (亿元)',
            // 去掉min:0限制，支持负值显示
            position: 'left',
            axisLabel: { 
                formatter: '{value}', 
                fontSize: 11 
            },
            splitLine: {
                show: true,
                lineStyle: { type: 'dashed', opacity: 0.5 }
            }
        },
        {
            type: 'value',
            name: '核心利润率 (%)',
            // 去掉min:0限制，支持负值显示
            position: 'right',
            axisLabel: { 
                formatter: '{value}%', 
                fontSize: 11 
            },
            splitLine: { show: false }
        }
    ];

    // ========== Tooltip ==========
    option.tooltip = {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function(params) {
            const idx = params[0].dataIndex;
            return `
<div><strong>${years[idx]}年</strong></div>
<div style="color:#1E88E5">■ 核心利润: ${coreProfit[idx].toFixed(1)} 亿元</div>
<div style="color:#2E7D32">■ 核心利润率: ${coreProfitMargin[idx].toFixed(2)}%</div>
<div style="color:#888888">■ 行业平均核心利润率: ${industryAvgMargin[idx].toFixed(2)}%</div>
`;
        }
    };

    // ========== 图例 ==========
    option.legend = {
        data: ['核心利润', '核心利润率', '行业平均核心利润率'],
        top: 10,
        left: 'center'
    };

    // ========== 系列数据 ==========
    option.series = [
        // 核心利润柱状图 - 左轴
        {
            name: '核心利润',
            type: 'bar',
            yAxisIndex: 0,
            data: coreProfit,
            itemStyle: {
                color: '#1E88E5'
            },
            label: {
                show: true,
                position: 'outside', // 强制在柱子外侧，自动适配正负值
                fontSize: 10,
                formatter: function(params) {
                    return params.value.toFixed(2) + '亿';
                },
                color: '#1E88E5' // 和柱子颜色统一为标准蓝色
            },
            emphasis: {
                itemStyle: {
                    color: '#1565C0'
                }
            }
        },
        // 核心利润率折线图 - 右轴
        {
            name: '核心利润率',
            type: 'line',
            yAxisIndex: 1,
            data: coreProfitMargin,
            symbol: 'circle',
            symbolSize: 6,
            smooth: true,
            lineStyle: {
                color: '#2E7D32',
                width: 2
            },
            itemStyle: {
                color: '#2E7D32'
            },
            label: {
                show: true,
                position: 'top',
                distance: 5, // 距离折线5px，避免重叠
                fontSize: 10,
                formatter: function(params) {
                    return params.value.toFixed(2) + '%';
                },
                color: '#2E7D32' // 和折线颜色统一为标准绿色
            }
        },
        // 行业平均参考线
        {
            name: '行业平均核心利润率',
            type: 'line',
            yAxisIndex: 1,
            data: industryAvgMargin,
            symbol: 'diamond',
            symbolSize: 4,
            lineStyle: {
                type: 'dashed',
                color: '#888888', // 标准灰色
                width: 1.5
            },
            itemStyle: {
                color: '#888888' // 标准灰色
            },
            label: {
                show: true,
                position: 'top',
                fontSize: 10, // 和其他系列统一字体大小
                color: '#888888', // 和折线颜色统一为标准灰色
                formatter: function(params) {
                    return params.value.toFixed(2) + '%';
                }
            }
        }
    ];

    // ========== 数据缩放 ==========
    option.dataZoom = [
        {
            type: 'inside',
            start: 0,
            end: 100
        },
        {
            type: 'slider',
            start: 0,
            end: 100,
            height: 20,
            bottom: 40 // 时间滑块在底部标注上方
        }
    ];

    // ========== 底部标注（参照7.11格式） ==========
    option.graphic.push({
        type: 'text',
        left: 'center',
        bottom: 10, // 放在时间条下方
        style: {
            text: '注：行业平均核心利润率基于申万白酒行业已披露年报公司计算，本图表趋势分析为主，不构成精确估值依据。',
            fontSize: 11,
            fill: '#888',
            textAlign: 'center'
        },
        silent: true
    });

    console.log('函数内部return前的option：', option);
    return option;
}
