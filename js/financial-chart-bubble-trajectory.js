/**
 * 财务战略矩阵动态轨迹图 - 气泡散点 + 带箭头的轨迹线
 * 符合要求：X=销售增长率-可持续增长率，Y=ROIC-WACC，气泡大小=营业收入，轨迹带箭头，年份渐变
 */

function buildBubbleTrajectoryOption(option, config, data) {
    // 财务战略矩阵: X = sales_growth - sustainable_growth, Y = roic - wacc
    // 或者通用气泡图: X = xField, Y = yField, 气泡大小 = revenueField
    const wacc = config.specialConfig?.wacc || 10;
    const quadrants = config.specialConfig?.quadrants;
    const companyName = data[0]?.name || '';

    // 计算坐标 - 支持两种模式
    let processedData;
    if (config.sgrField && config.waccField) {
        // 财务战略矩阵模式
        processedData = data.map(d => {
            const x = d[config.xField] - d[config.sgrField];
            const y = d[config.yField] - d[config.waccField];
            const year = parseInt(d.year);
            const revenue = parseFloat(d.revenue) / 10000; // 万元转亿元
            return {
                x: x,
                y: y,
                year: year,
                name: d.name,
                revenue: revenue,
                roic: parseFloat(d[config.yField]),
                sgr: parseFloat(d[config.sgrField]),
                salesGrowth: parseFloat(d[config.xField]),
                wacc: parseFloat(d[config.waccField]) || wacc,
                value: [x, y, year, revenue]
            };
        });
    } else {
        // 通用气泡图模式 (7.22-02)
        processedData = data.map(d => {
            let x, y;
            // 如果xField是rd_intensity但数据中没有，就用rd_exp/revenue计算
            if (config.xField === 'rd_intensity' && d.rd_intensity === undefined && d.rd_exp !== undefined && d.revenue !== undefined) {
                x = (parseFloat(d.rd_exp) / parseFloat(d.revenue)) * 100; // 研发费用/营业收入 * 100
            } else {
                x = parseFloat(d[config.xField]) || 0;
            }
            
            // 如果yField是core_profit_margin但数据中没有，尝试用core_profit/revenue计算
            if (config.yField === 'core_profit_margin' && d.core_profit_margin === undefined && d.core_profit !== undefined && d.revenue !== undefined) {
                y = (parseFloat(d.core_profit) / parseFloat(d.revenue)) * 100; // 核心利润/营业收入 * 100
            } else {
                y = parseFloat(d[config.yField]) || 0;
            }
            const year = parseInt(d.year);
            // 直接从d.revenue读取，不通过config.revenueField
            const revenue = d.revenue ? (parseFloat(d.revenue) / 10000) : 1; // 万元转亿元
            return {
                x: x,
                y: y,
                year: year,
                name: d.name,
                revenue: revenue,
                value: [x, y, year, revenue]
            };
        });
    }

    // 按年份排序
    processedData.sort((a, b) => a.year - b.year);
    const minYear = processedData[0].year;
    const maxYear = processedData[processedData.length - 1].year;
    const minRevenue = Math.min(...processedData.map(d => d.revenue));
    const maxRevenue = Math.max(...processedData.map(d => d.revenue));

    // 清空原有系列，防止污染
    option.series = [];
    option.graphic = [];

    // X轴 Y轴配置
    option.xAxis = {
        axisLabel: {
            formatter: '{value}%'
        }
    };
    option.yAxis = [{
        axisLabel: {
            formatter: '{value}%'
        }
    }];

    // 四象限背景着色
    if (quadrants) {
        const minX = getMin(processedData, 'x');
        const maxX = getMax(processedData, 'x');
        const minY = getMin(processedData, 'y');
        const maxY = getMax(processedData, 'y');
        
        quadrants.forEach(q => {
            // 检查象限内是否有数据
            const hasData = processedData.some(d => {
                let xOk = true, yOk = true;
                if (q.x[0] !== null && d.x < q.x[0]) xOk = false;
                if (q.x[1] !== null && d.x > q.x[1]) xOk = false;
                if (q.y[0] !== null && d.y < q.y[0]) yOk = false;
                if (q.y[1] !== null && d.y > q.y[1]) yOk = false;
                return xOk && yOk;
            });
            if (!hasData) return;

            option.graphic.push({
                type: 'rect',
                left: q.x[0] === null ? 'left' : getPercent(q.x[0], minX, maxX) + '%',
                right: q.x[1] === null ? 'right' : (100 - getPercent(q.x[1], minX, maxX)) + '%',
                top: q.y[0] === null ? 'top' : getPercent(q.y[0], minY, maxY) + '%',
                bottom: q.y[1] === null ? 'bottom' : (100 - getPercent(q.y[1], minY, maxY)) + '%',
                style: {
                    fill: q.color,
                    stroke: 'none',
                    opacity: 0.3
                },
                silent: true
            });

            // 添加象限文字标注 - 确保在象限内
            let leftPct = getCenterPercent(q.x[0], q.x[1], minX, maxX);
            let topPct = getCenterPercent(q.y[0], q.y[1], minY, maxY);
            if (q.x[0] === null) leftPct = 25;
            if (q.x[1] === null) leftPct = 75;
            if (q.y[0] === null) topPct = 25;
            if (q.y[1] === null) topPct = 75;

            option.graphic.push({
                type: 'text',
                left: leftPct + '%',
                top: topPct + '%',
                style: {
                    text: q.name,
                    fontSize: 14,
                    fill: 'rgba(0,0,0,0.5)',
                    textAlign: 'center'
                },
                silent: true
            });
        });
    }

    // 基准线 x=0, y=0 - 只有财务战略矩阵模式才显示
    if (quadrants) {
        option.markLine = {
            data: [
                {xAxis: 0, label: {formatter: '现金平衡点', position: 'end'}, lineStyle: {type: 'dashed'}},
                {yAxis: 0, label: {formatter: '价值平衡点', position: 'end'}, lineStyle: {type: 'dashed'}}
            ],
            silent: true
        };
    }

    // 👇👇👇 轨迹线在这里，确保一定执行，没有条件判断
    option.series.push({
        name: '发展趋势',
        type: 'line',
        data: processedData.map(d => [d.x, d.y]),
        zlevel: 1,
        color: '#888888',  // 指定系列整体颜色，影响图例
        lineStyle: {
            width: 2,
            color: '#888888',  // 灰色
            type: 'dashed',    // 虚线
            dashOffset: 5
        },
        smooth: true,
        smoothMonotone: 'x',
        endSymbol: 'arrow',
        endSymbolSize: 12,
        symbol: 'none'
    });

    // 👇👇👇 气泡散点在这里，确保一定执行
    const bubbleData = processedData.map(d => {
        const size = 10 + 30 * (d.revenue - minRevenue) / (maxRevenue - minRevenue || 1);
        const ratio = (d.year - minYear) / (maxYear - minYear || 1);
        const r = Math.round(30 + ratio * (244 - 30));
        const g = Math.round(136 + ratio * (67 - 136));
        const b = Math.round(229 + ratio * (54 - 229));
        const isLatest = d.year === maxYear;
        return {
            value: [d.x, d.y, size],
            name: d.year.toString(),
            // 存储完整数据用于tooltip
            fullData: d,
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
    });

    option.series.push({
        name: '年度数据点',
        type: 'scatter',
        data: bubbleData,
        zlevel: 2,
        color: '#1E88E5',  // 指定图例颜色为蓝色，和气泡起始颜色一致
        symbolSize: function(val) {
            return val[2];
        },
        tooltip: {
            formatter: function(params) {
                const d = params.data.fullData;
                if (config.sgrField && config.waccField) {
                    // 财务战略矩阵模式
                    return `
<div><strong>${d.year}年</strong></div>
<div>销售增长率-可持续增长率: ${d.x.toFixed(2)}%</div>
<div>ROIC-WACC: ${d.y.toFixed(2)}%</div>
<div>营业收入: ${d.revenue.toFixed(2)} 亿元</div>
<div>ROIC: ${d.roic.toFixed(2)}%</div>
<div>WACC: ${d.wacc.toFixed(2)}%</div>
`;
                } else {
                    // 通用气泡图模式 (7.22-02)
                    return `
<div><strong>${d.year}年</strong></div>
<div>研发强度: ${d.x.toFixed(2)}%</div>
<div>核心利润率: ${d.y.toFixed(2)}%</div>
<div>营业收入: ${d.revenue.toFixed(2)} 亿元</div>
`;
                }
            }
        }
    });

    // 图例、工具栏、数据缩放配置
    option.legend = {
        top: 30,
        left: 'center',
        data: quadrants ? ['发展趋势', '年度数据点'] : ['发展趋势', '年度数据点'] // 统一使用"发展趋势"
    };

    option.dataZoom = [
        {type: 'inside', start: 0, end: 100},
        {type: 'slider', bottom: 40, start: 0, end: 100}
    ];

    // 底部说明 - 根据不同模式显示不同说明
    if (quadrants) {
        option.graphic.push({
            type: 'text',
            left: 'center',
            bottom: 10,
            style: {
                text: '注：WACC计算中权益资本成本采用10%经验值，实际值可能有所差异，本图表趋势分析为主，不构成精确估值依据。',
                fontSize: 11,
                fill: '#888',
                textAlign: 'center'
            }
        });
    }

    return option;
}

// 辅助函数
function getMin(data, field) {
    return Math.min(...data.map(d => d[field]));
}
function getMax(data, field) {
    return Math.max(...data.map(d => d[field]));
}
function getPercent(value, min, max) {
    return ((value - min) / (max - min)) * 100;
}
function getCenterPercent(min, max, overallMin, overallMax) {
    if (min === null) min = overallMin;
    if (max === null) max = overallMax;
    const center = (min + max) / 2;
    return ((center - overallMin) / (overallMax - overallMin)) * 100;
}
