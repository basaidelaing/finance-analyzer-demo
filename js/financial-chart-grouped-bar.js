/**
 * 通用分组柱状图渲染函数
 * 适用指标组：7.13、7.33 及其他需要分组柱状图的场景
 * 统一颜色规范：
 * 蓝色 #1E88E5 - 核心指标
 * 红色 #f44336 - 负向/警示指标
 * 黄色 #FF9800 - 辅助指标
 * 绿色 #2E7D32 - 正向/增长指标
 */

function buildGroupedBarOption(option, config, data) {
    // 初始化必需属性
    option = Object.assign({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: [], top: 10 },
        xAxis: { type: 'category', data: [] },
        yAxis: [],
        series: [],
        grid: { left: '10%', right: '10%', bottom: '15%', top: '20%', containLabel: true },
        toolbox: { show: true, right: 15, top: 15 },
        dataZoom: []
    }, option || {});
    
    // 数据处理：按年份排序
    const processedData = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    
    // 提取Y轴字段配置
    const yFields = config.yFields || [];
    const displayNames = config.yFieldNames || [];
    const colors = config.colors || ['#1E88E5', '#FF9800', '#2E7D32', '#f44336']; // 默认颜色顺序
    const units = config.unit?.y || ['%', '%', '%', '%'];
    
    // 提取各系列数据
    const seriesData = [];
    yFields.forEach((field, index) => {
        if (!field) return; // 跳过空字段
        seriesData.push(processedData.map(d => {
            const val = d[field] || 0;
            return typeof val === 'number' ? val : parseFloat(val) || 0;
        }));
    });

    // ========== X轴 ==========
    option.xAxis = {
        type: 'category',
        data: years,
        name: config.unit?.x || '年份',
        axisLabel: { rotate: 0, fontSize: 12 },
        axisLine: { lineStyle: { color: '#333' } }
    };

    // ========== Y轴 ==========
    option.yAxis = [{
        type: 'value',
        name: config.unit?.y || '%',
        min: null, // 支持显示负值，不强制从0开始
        max: config.specialConfig?.yMax !== undefined ? config.specialConfig.yMax : null,
        axisLabel: { 
            formatter: `{value}${config.unit?.y || ''}`, 
            fontSize: 11 
        },
        splitLine: {
            show: true,
            lineStyle: { type: 'dashed', opacity: 0.5 }
        }
    }];

    // ========== Tooltip ==========
    option.tooltip = {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
            const idx = params[0].dataIndex;
            let result = `<div><strong>${years[idx]}年</strong></div>`;
            params.forEach((p, i) => {
                const field = yFields[p.seriesIndex];
                const fieldName = displayNames[i] || FIELD_NAME_MAP[field] || field;
                const unit = units[p.seriesIndex] || units[0] || '';
                result += `<div style="color:${p.color}">■ ${fieldName}: ${p.value.toFixed(2)}${unit}</div>`;
            });
            return result;
        }
    };

    // ========== 图例 ==========
    const legendData = yFields.filter(f => f).map((field, index) => displayNames[index] || FIELD_NAME_MAP[field] || field);
    option.legend = {
        data: legendData,
        top: 10,
        left: 'center'
    };

    // ========== 系列数据：分组柱状图 ==========
    console.log('>>> buildGroupedBarOption 被调用了！');
    const barWidth = `${70 / seriesData.length}%`; // 根据系列数量自动计算宽度
    yFields.forEach((field, index) => {
        if (!field) return;
        
        const seriesColor = colors[index]; // 严格按配置颜色顺序，不取模
        console.log('>>> 系列', index, '颜色=', seriesColor, 'position=outside');
        const seriesConfig = {
            name: displayNames[index] || FIELD_NAME_MAP[field] || field,
            type: 'bar',
            data: seriesData[index],
            barWidth: barWidth,
            itemStyle: {
                color: seriesColor
            },
            label: {
                show: true,
                position: 'outside', // 强制outside，与7.21完全一致
                fontSize: 10,
                color: seriesColor, // 数据标签颜色与柱子颜色一致
                formatter: function(params) {
                    return params.value.toFixed(2) + (units[index] || units[0] || '');
                }
            },
            emphasis: {
                focus: 'series'
            }
        };

        // 不要这个allowNegative里的position覆盖！
        // if (config.specialConfig?.allowNegative) {
        //     seriesConfig.label.position = function(params) {
        //         return params.value >= 0 ? 'top' : 'bottom';
        //     };
        // }

        option.series.push(seriesConfig);
    });

    // ========== 基准线 ==========
    if (config.specialConfig?.markLines) {
        option.markLine = {
            data: [],
            silent: false,
            lineStyle: { width: 1.5, type: 'dashed', color: '#424242' },
            label: { fontSize: 11, color: '#424242' }
        };
        config.specialConfig.markLines.forEach(line => {
            if (line.y !== undefined) {
                option.markLine.data.push({yAxis: line.y, name: line.label});
            }
            if (line.x !== undefined) {
                option.markLine.data.push({xAxis: line.x, name: line.label});
            }
        });
    }

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
            bottom: 10
        }
    ];

    return option;
}

// 辅助函数：调整颜色透明度
function adjustColorOpacity(color, opacity) {
    // 处理hex颜色
    if (color.startsWith('#')) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    // 已经是rgba的话修改透明度
    if (color.startsWith('rgba')) {
        return color.replace(/[\d\.]+\)$/, `${opacity})`);
    }
    return color;
}
