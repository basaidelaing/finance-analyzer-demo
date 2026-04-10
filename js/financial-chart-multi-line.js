/**
 * 多折线图专用构建函数
 * 专门处理7.12、7.31等多折线图
 */

function buildMultiLineOption(option, config, data) {
    // 初始化完整option结构，保留传入的option基础
    option = Object.assign({
        tooltip: { trigger: 'axis' },
        legend: { data: [], top: 10 },
        xAxis: { type: 'category', data: [] },
        yAxis: [],
        series: [],
        grid: { left: '3%', right: '4%', bottom: '80px', top: '60px', containLabel: true },
        toolbox: { show: true, right: 15, top: 15 },
        dataZoom: []
    }, option || {});
    
    // 按年份排序
    const processedData = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    
    // X轴配置
    option.xAxis = {
        type: 'category',
        data: years,
        name: config.unit?.x || '年份',
        axisLabel: { fontSize: 12 }
    };
    
    // Y轴配置 - 智能处理：如果有yAxisCount用复杂布局，否则用简单单Y轴
    const yAxisCount = config.yAxisCount || 1;
    option.yAxis = [];
    
    if (yAxisCount > 1) {
        // 复杂多Y轴布局（7.12等）
        for (let i = 0; i < yAxisCount; i++) {
            let unit = '';
            if (config.unit?.y) {
                unit = Array.isArray(config.unit.y) ? config.unit.y[i] : config.unit.y;
            }
            
            // 纵轴分布：两个在左侧，一个在右侧
            let position, offset;
            if (i === 0) {
                position = 'left';
                offset = 0;
            } else if (i === 1) {
                position = 'left';
                offset = 50;
            } else {
                position = 'right';
                offset = 0;
            }
            
            option.yAxis.push({
                type: 'value',
                name: unit,
                nameGap: 25,
                min: 0,
                axisLabel: {
                    fontSize: 10,
                    formatter: function(value) {
                        return value.toFixed(2);
                    }
                },
                position: position,
                offset: offset,
                splitLine: { show: false }
            });
        }
    } else {
        // 简单单Y轴布局（7.31等）
        let unit = '';
        if (config.unit?.y) {
            unit = Array.isArray(config.unit.y) ? config.unit.y[0] : config.unit.y;
        }
        option.yAxis.push({
            type: 'value',
            name: unit,
            axisLabel: {
                fontSize: 12,
                formatter: function(value) {
                    return value.toFixed(2);
                }
            }
        });
    }
    
    // 统一颜色
    const colors = config.colors || ['#1E88E5', '#2E7D32', '#FF9800', '#f44336'];
    
    // 处理每个系列
    config.yFields.forEach((yField, i) => {
        // 字段名映射 - 支持配置中的yFieldNames
        const fieldNameMap = {
            'net_margin': '销售净利率',
            'asset_turnover': '资产周转率',
            'equity_multiplier': '权益乘数',
            'heavy_ratio': '重化比率',
            'virtual_ratio': '虚化比率'
        };
        const displayNames = config.yFieldNames || [];
        const displayName = displayNames[i] || fieldNameMap[yField] || yField;
        
        // 处理数据
        const seriesData = processedData.map(d => {
            let val = parseFloat(d[yField] || 0);
            // 特殊处理：资产周转率要除以100，原始数据是百分比形式
            if (yField === 'asset_turnover') {
                val = val / 100;
            }
            return isNaN(val) ? 0 : val;
        });
        
        // 添加到图例
        option.legend.data.push(displayName);
        
        // 添加系列
        option.series.push({
            name: displayName,
            type: 'line',
            data: seriesData,
            color: colors[i % colors.length],
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            yAxisIndex: yAxisCount > 1 ? i : 0, // 多Y轴时用对应索引，单Y轴都用0
            label: {
                show: true,
                position: 'top',
                fontSize: yAxisCount > 1 ? 10 : 11,
                formatter: function(params) {
                    let unit = '';
                    if (config.unit?.y) {
                        unit = Array.isArray(config.unit.y) ? config.unit.y[0] : config.unit.y;
                    }
                    return params.value.toFixed(2) + (unit || '');
                },
                color: colors[i % colors.length]
            }
        });
    });
    
    // Tooltip
    option.tooltip = {
        trigger: 'axis',
        formatter: function(params) {
            const idx = params[0].dataIndex;
            const year = years[idx];
            let result = `<div><strong>${year}年</strong></div>`;
            params.forEach(p => {
                let unit = '';
                if (config.unit?.y) {
                    unit = Array.isArray(config.unit.y) ? config.unit.y[p.seriesIndex] : config.unit.y;
                }
                result += `<div style="color:${p.color}">■ ${p.seriesName}: ${p.value.toFixed(2)} ${unit}</div>`;
            });
            return result;
        }
    };
    
    // Grid配置 - 智能调整
    if (yAxisCount > 1) {
        // 复杂多Y轴布局（7.12等）
        option.grid = {
            left: '120px',
            right: '80px',
            top: '80px',
            bottom: '80px',
            containLabel: false
        };
    } else {
        // 简单布局（7.31等）
        option.grid = {
            left: '3%',
            right: '4%',
            bottom: '80px',
            top: '60px',
            containLabel: true
        };
    }

    // 数据缩放
    option.dataZoom = [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
    ];
    
    return option;
}
