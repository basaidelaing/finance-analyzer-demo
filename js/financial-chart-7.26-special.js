/**
 * 7.26专用双轴组合图渲染函数
 * 专用指标组：7.26 经营现金含量保障
 * 特殊逻辑：
 * - 左轴：三个堆叠柱状图（百分比）
 * - 右轴：经营性净现金流折线（亿元）
 * - 数据标签颜色特殊处理
 */

function build726SpecialDualAxisOption(option, config, data) {
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
    const processedData = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    
    // 提取Y轴配置
    const yAxisConfig = config.yAxis || [];
    
    // 提取显示名称配置（优先用yFieldNames）
    const displayNames = config.yFieldNames || [];

    // 提取数据
    const seriesData = [];
    yAxisConfig.forEach((axis, index) => {
        seriesData.push(processedData.map(d => {
            let val = d[axis.field] || 0;
            let numVal = typeof val === 'number' ? val : parseFloat(val) || 0;
            
            // 单位转换：
            // 优先判断unit是亿元的情况（第4个系列：经营性净现金流）
            if (axis.unit === '亿元') {
                numVal = numVal / 10000; // 万元→亿元
            }
            // 特殊处理：contract_liab_ratio 已经是百分比，不需要×100
            else if (axis.field === 'contract_liab_ratio') {
                // 已经是百分比，保持不变
            }
            // 1. 其他比率字段（%）：小数 → 乘以100
            else if (axis.unit === '%' || axis.field?.includes('ratio') || axis.field?.includes('margin') || axis.field?.includes('receipt') || axis.field?.includes('pressure')) {
                numVal = numVal * 100;
            }
            // 2. 其他金额字段（万元→亿元）：除以10000
            else if (axis.field?.includes('profit') || axis.field?.includes('cash') || axis.field?.includes('cf')) {
                numVal = numVal / 10000;
            }
            
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

    // ========== Y轴 - 7.26专用双Y轴 ==========
    option.yAxis = [];
    
    // Y轴0：左轴 - 收现比/付现压迫度/合同负债占比
    option.yAxis.push({
        type: 'value',
        name: '收现比/付现压迫度/合同负债占比',
        position: 'left',
        alignTicks: true,
        showMinLabel: false,
        showMaxLabel: false,
        axisLabel: { 
            formatter: function(value) {
                return value.toFixed(2) + '%';
            },
            fontSize: 11 
        },
        splitLine: {
            show: true,
            lineStyle: { type: 'dashed', opacity: 0.5 }
        }
    });
    
    // Y轴1：右轴 - 经营性净现金流
    option.yAxis.push({
        type: 'value',
        name: '经营性净现金流',
        position: 'right',
        alignTicks: true,
        showMinLabel: false,
        showMaxLabel: false,
        axisLabel: { 
            formatter: function(value) {
                return value.toFixed(2) + '亿元';
            },
            fontSize: 11 
        },
        splitLine: {
            show: false
        }
    });

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
        const seriesColor = axis.color || (index === 0 ? '#1E88E5' : (index === 1 ? '#FF9800' : '#2E7D32'));
        
        // 确定使用哪个Y轴：前3个用左轴（yAxisIndex=0），第4个用右轴（yAxisIndex=1）
        const yAxisIdx = index < 3 ? 0 : 1;
        
        // 数据标签颜色和位置逻辑：
        let labelColor, labelPosition;
        if (seriesType === 'line') {
            // 折线图：标签颜色 = 线条颜色，位置 = 顶部
            labelColor = seriesColor;
            labelPosition = 'top';
        } else {
            // 柱状图
            // 7.25特殊处理：核心利润额和经营性现金流额这两个右轴柱状图，标签放外面，颜色用柱子颜色
            const is725SpecialBar = axis.field === 'core_profit' || axis.field === 'net_operate_cash_flow';
            if (is725SpecialBar) {
                labelColor = seriesColor;
                labelPosition = 'top';
            } else {
                // 其他柱状图：标签放柱子里面，颜色白色
                labelColor = '#fff';
                labelPosition = 'inside';
            }
        }
        
        const seriesConfig = {
            name: displayNames[index] || axis.fieldName || FIELD_NAME_MAP[axis.field] || axis.field,
            type: seriesType,
            yAxisIndex: yAxisIdx,
            data: seriesData[index].map(val => {
                const numVal = typeof val === 'number' ? val : parseFloat(val) || 0;
                return {
                    value: numVal,
                    label: {
                        color: labelColor
                    }
                };
            }),
            itemStyle: {
                color: seriesColor
            },
            label: {
                show: true,
                position: labelPosition,
                fontSize: 10,
                color: labelColor,
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return params.value.toFixed(2) + (axis.unit || '');
                }
            },
            emphasis: {
                itemStyle: {
                    opacity: 0.8
                }
            }
        };

        // 如果配置了stacked，并且是前3个柱状图，设置stack属性
        if (config.specialConfig?.stacked && seriesType === 'bar' && index < 3) {
            seriesConfig.stack = 'total';
        }

        // 如果是折线图添加平滑效果
        if (seriesType === 'line') {
            seriesConfig.smooth = true;
            seriesConfig.symbol = 'circle';
            seriesConfig.symbolSize = 6;
            seriesConfig.lineStyle = {
                width: 2
            };
        }

        option.series.push(seriesConfig);
    });

    // ========== 标记线 ==========
    if (config.specialConfig && config.specialConfig.markLines) {
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
