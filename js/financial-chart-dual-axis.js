/**
 * 双轴组合图通用渲染函数
 * 适用指标组：7.21、7.24、7.32
 * 统一颜色规范：
 * 蓝色 #1E88E5 - 核心指标（左轴）
 * 黄色 #FF9800 - 辅助指标（右轴）
 */

function buildDualAxisOption(option, config, data) {
    // 初始化完整option结构
    option = Object.assign({
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: [], top: 10 },
        xAxis: { type: 'category', data: [] },
        yAxis: [],
        series: [],
        grid: { left: '3%', right: '3%', bottom: '80px', top: '60px', containLabel: true },
        graphic: [],
        toolbox: { show: true, right: 15, top: 15 },
        dataZoom: []
    }, option || {});
    
    // 数据处理：按年份排序
    const processedData = data.sort((a, b) => parseInt(a.year) - parseInt(a.year));
    const years = processedData.map(d => d.year.toString());
    
    // 提取Y轴配置
    const yAxisConfig = config.yAxis || [];
    if (yAxisConfig.length < 2) {
        // 兼容旧格式，没有yAxis数组的用yFields
        const yFields = config.yFields || [];
        const units = config.unit?.y || ['%', '%'];
        yAxisConfig.push({
            field: yFields[0],
            type: config.chartType === 'dualAxisLine' ? 'line' : 'bar',
            unit: units[0],
            color: '#1E88E5',
            min: 0
        });
        if (yFields.length >= 2) {
            yAxisConfig.push({
                field: yFields[1],
                type: 'line',
                unit: units[1],
                color: '#FF9800',
                min: 0
            });
        }
    }
    
    // 提取显示名称配置（优先用yFieldNames）
    const displayNames = config.yFieldNames || [];

    // 提取数据
    const seriesData = [];
    yAxisConfig.forEach((axis, index) => {
        seriesData.push(processedData.map(d => {
            let val = d[axis.field] || 0;
            let numVal = typeof val === 'number' ? val : parseFloat(val) || 0;
            
            // 单位转换：万元→亿元
            if (axis.unit === '万元' || axis.unit === '亿元') {
                numVal = numVal / 10000;
            }
            // 百分比单位：小数×100（但跳过已经是百分比格式的数据）
            else if (axis.unit === '%') {
                // 特殊处理：如果数值已经很大（>10），说明已经是百分比格式，不需要乘100
                if (numVal < 10) {
                    numVal = numVal * 100;
                }
            }
            // 天数单位：保持不变
            
            return numVal;
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

    // ========== Y轴 - 通用双Y轴 ==========
    option.yAxis = [];
    
    // Y轴0：左轴
    option.yAxis.push({
        type: 'value',
        name: yAxisConfig[0]?.unit || '',
        position: 'left',
        axisLabel: { 
            formatter: function(value) {
                return value.toFixed(2);
            },
            fontSize: 11 
        }
    });
    
    // Y轴1：右轴（如果有）
    if (yAxisConfig.length >= 2) {
        option.yAxis.push({
            type: 'value',
            name: yAxisConfig[1]?.unit || '',
            position: 'right',
            axisLabel: { 
                formatter: function(value) {
                    return value.toFixed(2);
                },
                fontSize: 11 
            }
        });
    }

    // ========== Tooltip ==========
    option.tooltip = {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function(params) {
            const idx = params[0].dataIndex;
            let result = `<div><strong>${years[idx]}年</strong></div>`;
            params.forEach((p, i) => {
                const axisConfig = yAxisConfig[p.seriesIndex];
                const fieldName = displayNames[i] || axisConfig.fieldName || FIELD_NAME_MAP[axisConfig.field] || axisConfig.field;
                result += `<div style="color:${p.color}">■ ${fieldName}: ${p.value.toFixed(2)}${axisConfig.unit || ''}</div>`;
            });
            return result;
        }
    };

    // ========== 图例 ==========
    const legendData = yAxisConfig.map((axis, index) => displayNames[index] || axis.fieldName || FIELD_NAME_MAP[axis.field] || axis.field);
    option.legend = {
        data: legendData,
        top: 10,
        left: 'center'
    };

    // ========== 系列数据 ==========
    yAxisConfig.forEach((axis, index) => {
        const seriesType = axis.type === 'bar' ? 'bar' : 'line';
        const seriesColor = axis.color || (index === 0 ? '#1E88E5' : '#FF9800');
        const yAxisIdx = Math.min(index, option.yAxis.length - 1);
        
        const seriesConfig = {
            name: displayNames[index] || axis.fieldName || FIELD_NAME_MAP[axis.field] || axis.field,
            type: seriesType,
            yAxisIndex: yAxisIdx,
            data: seriesData[index],
            itemStyle: {
                color: seriesColor
            },
            label: {
                show: true,
                position: seriesType === 'bar' ? 'top' : 'top',
                fontSize: 10,
                color: seriesColor,
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return params.value.toFixed(2);
                }
            }
        };

        // 堆叠配置
        if (config.specialConfig?.stacked && seriesType === 'bar') {
            seriesConfig.stack = 'total';
        }

        // 折线图平滑效果
        if (seriesType === 'line') {
            seriesConfig.smooth = true;
        }

        option.series.push(seriesConfig);
    });

    // ========== 数据缩放 ==========
    option.dataZoom = [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
    ];

    return option;
}
