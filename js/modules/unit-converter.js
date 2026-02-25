/**
 * 单位转换模块 - 处理图表数据的单位转换
 * 文件大小: <10KB
 * 
 * 功能：
 * 1. 检测指标是否需要单位转换
 * 2. 将原始值转换为万元单位
 * 3. 提供统一的格式化函数
 * 4. 保持与图表配置的一致性
 */

/**
 * 检测指标是否需要万元转换
 * @param {string} indicatorCode 指标代码，如 "7.11"
 * @param {Object} chartConfig 图表配置
 * @returns {boolean} 是否需要万元转换
 */
export function needsYuanToWanConversion(indicatorCode, chartConfig) {
    // 检查yAxisName是否包含"万元"
    if (chartConfig && chartConfig.yAxisName && chartConfig.yAxisName.includes('万元')) {
        return true;
    }
    
    // 检查指标代码是否需要万元转换
    const yuanIndicators = [
        '7.11',  // 核心利润（万元）
        '7.22',  // 金额（万元）
        // 添加其他需要万元转换的指标代码
    ];
    
    return yuanIndicators.includes(indicatorCode);
}

/**
 * 将原始值转换为万元
 * @param {number} value 原始值
 * @returns {number} 转换后的万元值
 */
export function convertYuanToWan(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 0;
    }
    return value / 10000;
}

/**
 * 转换数据数组中的所有值
 * @param {Array} dataArray 原始数据数组
 * @param {boolean} shouldConvert 是否需要进行转换
 * @returns {Array} 转换后的数据数组
 */
export function convertDataValues(dataArray, shouldConvert) {
    if (!shouldConvert || !Array.isArray(dataArray)) {
        return dataArray;
    }
    
    return dataArray.map(item => {
        if (typeof item === 'number') {
            return convertYuanToWan(item);
        } else if (item && typeof item === 'object') {
            // 处理对象类型的数据点
            const converted = { ...item };
            if (converted.value !== undefined) {
                converted.value = convertYuanToWan(converted.value);
            }
            if (converted.y !== undefined) {
                converted.y = convertYuanToWan(converted.y);
            }
            return converted;
        }
        return item;
    });
}

/**
 * 格式化数值，根据需要进行单位转换
 * @param {number} value 原始值
 * @param {boolean} shouldConvert 是否需要进行万元转换
 * @param {number} decimals 小数位数
 * @returns {string} 格式化后的字符串
 */
export function formatValueWithUnit(value, shouldConvert, decimals = 2) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'N/A';
    }
    
    let formattedValue = value;
    let unit = '';
    
    if (shouldConvert) {
        formattedValue = convertYuanToWan(value);
        unit = ' 万元';
    }
    
    return formattedValue.toFixed(decimals) + unit;
}

/**
 * 获取图表配置的单位信息
 * @param {Object} chartConfig 图表配置
 * @returns {Object} 单位信息 { needsConversion: boolean, unit: string }
 */
export function getUnitInfo(chartConfig) {
    if (!chartConfig) {
        return { needsConversion: false, unit: '' };
    }
    
    const yAxisName = chartConfig.yAxisName || '';
    
    if (yAxisName.includes('万元')) {
        return { needsConversion: true, unit: '万元' };
    } else if (yAxisName.includes('%')) {
        return { needsConversion: false, unit: '%' };
    } else if (yAxisName.includes('倍')) {
        return { needsConversion: false, unit: '倍' };
    } else if (yAxisName.includes('次')) {
        return { needsConversion: false, unit: '次' };
    } else {
        return { needsConversion: false, unit: '' };
    }
}

/**
 * 创建tooltip格式化函数
 * @param {Array} periods 期间数组
 * @param {Array} values 值数组（应该是已经转换过的值）
 * @param {Object} chartConfig 图表配置
 * @param {string} indicatorCode 指标代码
 * @returns {Function} tooltip格式化函数
 */
export function createTooltipFormatter(periods, values, chartConfig, indicatorCode) {
    const unitInfo = getUnitInfo(chartConfig);
    
    return function(params) {
        const pointIndex = params[0].dataIndex;
        const period = periods[pointIndex] || `期间${pointIndex + 1}`;
        const value = values[pointIndex];
        
        const seriesName = chartConfig.seriesName || '值';
        const formattedValue = value.toFixed(2);
        
        return `${period}<br/>${seriesName}: ${formattedValue} ${unitInfo.unit}`;
    };
}

/**
 * 创建yAxis格式化函数
 * @param {Object} chartConfig 图表配置
 * @returns {Function} yAxis格式化函数
 */
export function createYAxisFormatter(chartConfig) {
    const unitInfo = getUnitInfo(chartConfig);
    
    if (unitInfo.needsConversion) {
        return function(value) {
            return value.toFixed(0) + ' 万';
        };
    } else if (unitInfo.unit === '%') {
        return function(value) {
            return value.toFixed(0) + '%';
        };
    } else {
        return '{value}';
    }
}

/**
 * 处理图表数据，应用单位转换
 * @param {Array} dataPoints 原始数据点
 * @param {string} indicatorCode 指标代码
 * @param {Object} chartConfig 图表配置
 * @returns {Object} 处理后的数据 { periods: Array, values: Array, convertedValues: Array }
 */
export function processChartData(dataPoints, indicatorCode, chartConfig) {
    const periods = dataPoints.map(point => point.period || '');
    const rawValues = dataPoints.map(point => point.value || point.y || 0);
    
    const unitInfo = getUnitInfo(chartConfig);
    const needsConversion = unitInfo.needsConversion || needsYuanToWanConversion(indicatorCode, chartConfig);
    
    const convertedValues = needsConversion ? 
        rawValues.map(value => convertYuanToWan(value)) : 
        rawValues;
    
    return {
        periods,
        rawValues,
        convertedValues,
        needsConversion,
        unit: unitInfo.unit
    };
}

export default {
    needsYuanToWanConversion,
    convertYuanToWan,
    convertDataValues,
    formatValueWithUnit,
    getUnitInfo,
    createTooltipFormatter,
    createYAxisFormatter,
    processChartData
};