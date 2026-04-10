/**
 * 行业超额壁垒与费效转化组合图
 * 对应指标组：7.22
 */

function buildBarrierEfficiencyOption(option, config, data) {
    // 【修复】初始化完整option结构，避免ECharts内部报错
    option = Object.assign({
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: [], top: 10 },
        xAxis: { type: 'category', data: [] },
        yAxis: [],
        series: [],
        grid: { left: '3%', right: '3%', bottom: '80px', top: '60px', containLabel: true }, // 最大化横向宽度
        graphic: [],
        toolbox: { show: true, right: 15, top: 15 },
        dataZoom: []
    }, option || {});
    
    // 数据处理：按年份排序
    const processedData = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    
    // 提取数据字段 - 直接强转，不做任何多余判断，绝对保证数值正确
    const years = processedData.map(d => d.year.toString());
    const excessGrossMargin = processedData.map(d => parseFloat(d.excess_gross_margin || 0));
    const barrierCoefficient = processedData.map(d => parseFloat(d.industry_barrier || 0));
    const rndIntensity = processedData.map(d => parseFloat(d.rd_intensity || 0));
    const rndExpense = processedData.map(d => parseFloat(d.rd_exp || 0) / 10000); // 万元直接转亿元
    const coreProfitMargin = processedData.map(d => parseFloat(d.core_profit_margin || 0));

    // 计算气泡大小范围（归一化到10-40像素，差异更明显）
    const maxRndExpense = Math.max(...rndExpense);
    const minBubbleSize = 10;
    const maxBubbleSize = 40;
    // 避免除以0的情况
    const bubbleSizes = rndExpense.map(val => {
        if (val <= 0) return minBubbleSize;
        if (maxRndExpense <= 0) return minBubbleSize;
        // 线性映射：研发费用越高，气泡越大
        return minBubbleSize + (val / maxRndExpense) * (maxBubbleSize - minBubbleSize);
    });

    // ========== X轴 ==========
    option.xAxis = {
        type: 'category',
        data: years,
        name: '年份',
        axisLabel: { rotate: 0, fontSize: 12 },
        axisLine: { lineStyle: { color: '#333' } }
    };

    // ========== Y轴 - 三Y轴 ==========
    option.yAxis = [
        {
            type: 'value',
            name: '超额毛利率 (%)',
            position: 'left',
            axisLabel: { 
                formatter: '{value}%', 
                fontSize: 11 
            },
            splitLine: {
                show: true,
                lineStyle: { type: 'dashed', opacity: 0.5 }
            },
            axisLine: {
                lineStyle: {
                    color: '#1E88E5'
                }
            }
        },
        {
            type: 'value',
            name: '行业壁垒系数 (倍)',
            position: 'right',
            offset: 0,
            axisLabel: { 
                formatter: '{value}', 
                fontSize: 11 
            },
            axisLine: {
                lineStyle: {
                    color: '#FF9800'
                }
            },
            splitLine: { show: false }
        },
        {
            type: 'value',
            name: '研发投入强度 (%)',
            position: 'right',
            offset: 60,
            axisLabel: { 
                formatter: '{value}%', 
                fontSize: 11 
            },
            axisLine: {
                lineStyle: {
                    color: '#2E7D32'
                }
            },
            splitLine: { show: false }
        }
    ];

    // ========== Tooltip ==========
    option.tooltip = {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function(params) {
            // 处理不同的参数格式，兼容单个系列和多个系列的情况
            let dataPoint = null;
            let idx = 0;
            
            if (Array.isArray(params) && params.length > 0) {
                // axis触发，多个系列
                dataPoint = params[0];
                if (dataPoint.dataIndex !== undefined) {
                    idx = dataPoint.dataIndex;
                }
            } else if (params && !Array.isArray(params)) {
                // item触发，单个系列
                dataPoint = params;
            }
            
            // 尝试从数据点中获取完整信息（散点图的情况）
            if (dataPoint && dataPoint.data) {
                const data = dataPoint.data;
                if (data.year !== undefined) {
                    // 散点图数据包含完整信息
                    return `
<div><strong>${data.year}年</strong></div>
<div style="color:#1E88E5">■ 超额毛利率: ${data.excessGrossMargin.toFixed(1)}%</div>
<div style="color:#FF9800">■ 行业壁垒系数: ${data.barrierCoefficient.toFixed(2)} 倍</div>
<div style="color:#2E7D32">■ 研发强度: ${data.rndIntensity.toFixed(2)}%</div>
<div style="color:#2E7D32">■ 研发费用: ${data.rndExpense.toFixed(2)} 亿元</div>
<div style="color:#757575">■ 核心利润率: ${data.coreProfitMargin.toFixed(2)}%</div>
`;
                }
            }
            
            // 安全检查，避免索引越界
            if (idx < 0 || idx >= years.length) {
                idx = 0;
            }
            
            // 标准情况，从数组中获取数据
            return `
<div><strong>${years[idx]}年</strong></div>
<div style="color:#1E88E5">■ 超额毛利率: ${excessGrossMargin[idx].toFixed(1)}%</div>
<div style="color:#FF9800">■ 行业壁垒系数: ${barrierCoefficient[idx].toFixed(2)} 倍</div>
<div style="color:#2E7D32">■ 研发强度: ${rndIntensity[idx].toFixed(2)}%</div>
<div style="color:#2E7D32">■ 研发费用: ${rndExpense[idx].toFixed(2)} 亿元</div>
<div style="color:#757575">■ 核心利润率: ${coreProfitMargin[idx].toFixed(2)}%</div>
`;
        }
    };

    // ========== 图例 ==========
    option.legend = {
        data: [
            { name: '超额毛利率', itemStyle: { color: '#1E88E5' } },
            { name: '行业壁垒系数', itemStyle: { color: '#FF9800' } },
            { name: '研发投入强度', itemStyle: { color: '#2E7D32' } }
        ],
        top: 10,
        left: 'center'
    };

    // ========== 系列数据 ==========
    option.series = [
        // 超额毛利率柱状图 - 左轴
        {
            name: '超额毛利率',
            type: 'bar',
            yAxisIndex: 0,
            data: excessGrossMargin,
            itemStyle: {
                color: '#1E88E5'
            },
            label: {
                show: true,
                position: 'outside',
                fontSize: 10,
                formatter: function(params) {
                    return params.value.toFixed(2) + '%';
                },
                color: '#1E88E5'
            },
            emphasis: {
                itemStyle: {
                    color: '#1565C0'
                }
            }
        },
        // 行业壁垒系数折线图 - 右轴
        {
            name: '行业壁垒系数',
            type: 'line',
            yAxisIndex: 1,
            data: barrierCoefficient,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: {
                color: '#FF9800',
                width: 2
            },
            itemStyle: {
                color: '#FF9800'
            },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                formatter: function(params) {
                    return params.value.toFixed(2);
                },
                color: '#FF9800'
            }
        },
        // 研发投入强度气泡散点图 - 独立右轴
        {
            name: '研发投入强度',
            type: 'scatter',
            yAxisIndex: 2,
            data: rndIntensity.map((val, idx) => ({
                value: parseFloat(val) || 0,
                symbolSize: bubbleSizes[idx],
                year: years[idx],
                excessGrossMargin: excessGrossMargin[idx],
                barrierCoefficient: barrierCoefficient[idx],
                rndIntensity: rndIntensity[idx],
                rndExpense: rndExpense[idx],
                coreProfitMargin: coreProfitMargin[idx],
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#81C784' },
                        { offset: 1, color: '#2E7D32' }
                    ]),
                    opacity: 0.8
                }
            })),
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: '#2E7D32',
                formatter: function(params) {
                    return params.value.toFixed(2) + '%';
                }
            },
            emphasis: {
                itemStyle: {
                    opacity: 1
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
            bottom: 35 // 上移一点，给底部注释留出空间
        }
    ];

    // ========== 说明标注 ==========
    option.graphic.push({
        type: 'text',
        left: 'center',
        bottom: 5, // 放在底部
        style: {
            text: '注：行业平均基于五家头部白酒公司计算，壁垒系数趋势可靠，绝对数值仅供参考',
            fontSize: 10,
            fill: '#666'
        }
    });

    return option;
}
