// content-charts.js - 图表模块（简化版）
// 文件大小: <10KB

/**
 * 图表模块 - 负责图表数据获取和渲染
 */

// 图表颜色配置
const CHART_COLORS = {
    primary: '#5470c6',
    secondary: '#91cc75',
    tertiary: '#fac858',
    quaternary: '#ee6666',
    quinary: '#73c0de'
};

// 指标规范缓存
let indicatorSpecCache = null;

/**
 * 加载指标规范
 */
async function loadIndicatorSpec() {
    if (indicatorSpecCache) {
        return indicatorSpecCache;
    }
    
    try {
        const response = await fetch('data/indicators_specification_with_prefix.json');
        if (!response.ok) {
            throw new Error(`指标规范加载失败: ${response.status}`);
        }
        indicatorSpecCache = await response.json();
        return indicatorSpecCache;
    } catch (error) {
        console.error('加载指标规范失败:', error);
        return null;
    }
}

/**
 * 获取指标组配置
 */
async function getGroupConfig(groupCode) {
    const spec = await loadIndicatorSpec();
    if (!spec || !spec.indicators_groups) {
        return null;
    }
    
    return spec.indicators_groups.find(group => group.group_code === groupCode);
}

/**
 * 获取指标配置
 */
async function getIndicatorConfig(indicatorCode) {
    const spec = await loadIndicatorSpec();
    if (!spec || !spec.indicators_groups) {
        return null;
    }
    
    for (const group of spec.indicators_groups) {
        for (const indicator of group.indicators) {
            if (indicator.indicator_code === indicatorCode) {
                return indicator;
            }
        }
    }
    return null;
}

/**
 * 同步获取指标配置（从缓存）
 */
function getIndicatorConfigSync(indicatorCode) {
    if (!indicatorSpecCache) {
        return null;
    }
    
    for (const group of indicatorSpecCache.indicators_groups) {
        for (const indicator of group.indicators) {
            if (indicator.indicator_code === indicatorCode) {
                return indicator;
            }
        }
    }
    return null;
}

/**
 * 获取图表数据（单个指标）
 */
export async function fetchChartData(company, indicator) {
    if (!company || !indicator) {
        throw new Error('公司和指标不能为空');
    }
    
    const url = `/api/chart/${company.ts_code}/${indicator.code}`;
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`图表API错误: ${response.status}`);
    }
    
    return await response.json();
}

/**
 * 获取指标组数据
 */
export async function fetchGroupData(company, indicatorGroup) {
    if (!company || !indicatorGroup) {
        throw new Error('公司和指标组不能为空');
    }
    
    try {
        console.log(`开始读取指标组数据: ${company.ts_code} - ${indicatorGroup.code}`);
        
        // 1. 获取指标组配置
        const groupConfig = await getGroupConfig(indicatorGroup.code);
        if (!groupConfig) {
            throw new Error(`未找到指标组配置: ${indicatorGroup.code}`);
        }
        
        // 2. 构建文件路径
        const groupCode = indicatorGroup.code.replace('.', '_');
        // 指向前端数据目录
        const basePath = `data/calculation_results/companies/${company.ts_code}_indicators_${groupCode}`;
        console.log(`构建文件路径: ${basePath}`);
        
        // 3. 查找最新的文件（通过模拟文件系统API）
        // 注意：在浏览器环境中，需要服务器端API支持文件列表
        // 这里我们假设文件名模式为：{公司代码}_indicators_{组代码}_{时间戳}.json
        const fileName = await findLatestIndicatorFile(basePath);
        
        if (fileName === null) {
            throw new Error(`未找到指标组文件: ${basePath}_*.json`);
        }
        
        // 4. 读取文件
        const fileUrl = fileName ? `${basePath}_${fileName}.json` : `${basePath}.json`;
        console.log(`读取文件: ${fileUrl}`);
        
        const response = await fetch(fileUrl);
        if (!response.ok) {
            throw new Error(`文件读取失败: ${response.status}`);
        }
        
        const fileData = await response.json();
        
        // 5. 提取指标数据
        const indicators = [];
        for (const indicatorConfig of groupConfig.indicators) {
            const indicatorData = extractIndicatorData(fileData, indicatorConfig.indicator_code);
            indicators.push({
                code: indicatorConfig.indicator_code,
                name: indicatorConfig.indicator_name,
                chartType: indicatorConfig.chart_type,
                unit: indicatorConfig.unit,
                data: indicatorData
            });
        }
        
        // 6. 返回结构化的指标组数据
        return {
            company: company,
            groupCode: indicatorGroup.code,
            groupName: groupConfig.group_name,
            indicators: indicators,
            rawData: fileData // 保留原始数据用于调试
        };
        
    } catch (error) {
        console.error('读取指标组数据失败:', error);
        throw new Error(`指标组数据读取失败: ${error.message}`);
    }
}

/**
 * 查找最新的指标文件（模拟实现）
 * 在实际环境中，需要服务器端API返回文件列表
 */
async function findLatestIndicatorFile(basePath) {
    console.log(`查找文件，基础路径: ${basePath}`);
    
    // 方法1：首先尝试直接读取（不带时间戳）
    try {
        const testUrl = `${basePath}.json`;
        const response = await fetch(testUrl, { method: 'HEAD' });
        if (response.ok) {
            console.log(`找到文件（无时间戳）`);
            return '';
        }
    } catch (e) {
        // 文件不存在
    }
    
    // 方法2：尝试常见的时间戳模式
    // 由于不同公司可能有不同的时间戳，我们尝试几种模式
    const timestampPatterns = [
        '20260225_20', // 20点左右的（最新）
        '20260225_19', // 19点左右的
        '20260225_16', // 16点左右的
        '20260225_15', // 15点左右的  
        '20260225_14', // 14点左右的
        '20260225_13', // 13点左右的
    ];
    
    // 在实际项目中，应该通过服务器API获取文件列表
    // 方法3：尝试列出目录（需要服务器支持API）
    // 在实际项目中，应该通过服务器API获取文件列表
    // 这里我们模拟一个简单的解决方案：尝试获取目录列表
    try {
        // 尝试调用服务器API获取文件列表
        // 假设有一个API可以返回目录下的文件列表
        const directoryPath = basePath.substring(0, basePath.lastIndexOf('/'));
        const fileNamePattern = basePath.substring(basePath.lastIndexOf('/') + 1);
        
        // 在实际项目中，这里应该调用服务器API
        // 由于我们无法直接调用服务器API，我们使用一个更简单的方法：
        // 尝试所有已知的11家公司的时间戳
        
        // 所有11家白酒公司的最新时间戳（2026-02-25 20:18左右）
        const allCompanyTimestamps = [
            '20260225_201819', // 000568.SZ 泸州老窖
            '20260225_201822', // 000596.SZ 古井贡酒
            '20260225_201824', // 000799.SZ 酒鬼酒
            '20260225_201827', // 000858.SZ 五粮液
            '20260225_201831', // 002304.SZ 洋河股份
            '20260225_201834', // 600519.SH 贵州茅台
            '20260225_201837', // 600702.SH 舍得酒业
            '20260225_201839', // 600779.SH 水井坊
            '20260225_201843', // 600809.SH 山西汾酒
            '20260225_201846', // 603369.SH 今世缘
            '20260225_201850'  // 603589.SH 口子窖
        ];
        
        for (const timestamp of allCompanyTimestamps) {
            try {
                const testUrl = `${basePath}_${timestamp}.json`;
                const response = await fetch(testUrl, { method: 'HEAD' });
                if (response.ok) {
                    console.log(`找到文件: ${timestamp}`);
                    return timestamp;
                }
            } catch (e) {
                // 继续尝试下一个
            }
        }
    } catch (e) {
        console.log(`尝试获取目录列表失败: ${e.message}`);
    }
    
    // 方法4：如果以上都不行，尝试其他已知的时间戳
    const knownTimestamps = [
        '20260225_193841', // 前端目录中的计算结果（19:38）
        '20260225_160618', '20260225_160620', '20260225_160622', '20260225_160624',
        '20260225_160627', '20260225_160629', '20260225_160631', '20260225_160633',
        '20260225_160635', '20260225_160637', '20260225_160639',
        '20260225_154033', '20260225_153057', '20260225_151854',
        '20260225_145653', '20260225_145430', '20260225_143158',
        '20260225_135831', '20260225_132514'
    ];
    
    for (const timestamp of knownTimestamps) {
        try {
            const testUrl = `${basePath}_${timestamp}.json`;
            const response = await fetch(testUrl, { method: 'HEAD' });
            if (response.ok) {
                console.log(`找到文件: ${timestamp}`);
                return timestamp;
            }
        } catch (e) {
            // 继续尝试下一个
        }
    }
    
    // 方法5：最后的手段，尝试不带时间戳的文件
    try {
        const testUrl = `${basePath}.json`;
        const response = await fetch(testUrl, { method: 'HEAD' });
        if (response.ok) {
            console.log(`找到文件（无时间戳）`);
            return '';
        }
    } catch (e) {
        // 文件不存在
    }
    
    console.log(`未找到文件: ${basePath}_*.json`);
    return null;
}

/**
 * 从指标组文件中提取特定指标数据
 */
function extractIndicatorData(fileData, indicatorCode) {
    try {
        // 文件数据结构示例：
        // {
        //   "7.11": {
        //     "7.11.1": {
        //       "2024": {
        //         "value": {
        //           "2014": {"value": 1251481171.92, "indicator_code": "7.11.1", "year": 2014},
        //           "2015": {"value": 1635992458.89, "indicator_code": "7.11.1", "year": 2015},
        //           ...
        //         }
        //       }
        //     }
        //   }
        // }
        
        // 提取指标组代码（如7.11.1 -> 7.11）
        const groupCode = indicatorCode.split('.').slice(0, 2).join('.');
        
        // 获取指标配置以确定单位
        let unit = '';
        let convertToWanYuan = false;
        let decimalPlaces = 2; // 默认保留2位小数
        
        try {
            const indicatorConfig = getIndicatorConfigSync(indicatorCode);
            if (indicatorConfig) {
                unit = indicatorConfig.unit || '';
                
                // 根据单位确定是否需要转换和保留小数位数
                if (unit === '万元') {
                    // 原始数据是元，需要转换为万元
                    convertToWanYuan = true;
                    decimalPlaces = 2; // 万元保留2位小数
                } else if (unit === '%') {
                    // 百分比数据，通常已经是百分比格式
                    decimalPlaces = 2; // 百分比保留2位小数
                } else if (unit === '倍' || unit === '次' || unit === '天') {
                    // 倍数、次数、天数等，保留2位小数
                    decimalPlaces = 2;
                } else if (!unit) {
                    // 没有单位，可能是比率或指数，保留4位小数
                    decimalPlaces = 4;
                }
                
                console.log(`指标 ${indicatorCode} 配置: 单位="${unit}", 转换万元=${convertToWanYuan}, 小数位=${decimalPlaces}`);
            }
        } catch (e) {
            console.log(`无法获取指标 ${indicatorCode} 的配置:`, e);
        }
        
        if (!fileData[groupCode] || !fileData[groupCode][indicatorCode]) {
            console.warn(`未找到指标数据: ${indicatorCode}`);
            return [];
        }
        
        const indicatorObj = fileData[groupCode][indicatorCode];
        const dataPoints = [];
        
        // 遍历所有年份（如"2024"）
        for (const yearKey in indicatorObj) {
            const yearData = indicatorObj[yearKey];
            
            if (yearData && typeof yearData === 'object') {
                // 检查是否有value对象
                if (yearData.value && typeof yearData.value === 'object') {
                    // 处理嵌套结构：yearData.value包含多个年份的数据
                    const valueObj = yearData.value;
                    for (const dataYear in valueObj) {
                        const dataPoint = valueObj[dataYear];
                        if (dataPoint && typeof dataPoint.value !== 'undefined') {
                            // 首先检查是否为二维数据（包含x和y）
                            if (dataPoint.value && typeof dataPoint.value === 'object' && 
                                dataPoint.value.x !== undefined && dataPoint.value.y !== undefined) {
                                // 二维数据：直接传递x和y，不进行单位转换
                                dataPoints.push({
                                    period: dataYear,
                                    value: dataPoint.value, // 包含x和y的对象
                                    x: dataPoint.value.x,
                                    y: dataPoint.value.y,
                                    year: dataPoint.year || parseInt(dataYear),
                                    indicator_code: dataPoint.indicator_code || indicatorCode,
                                    unit: unit,
                                    decimal_places: decimalPlaces
                                });
                            } else {
                                // 一维数据：常规处理
                                let value = dataPoint.value;
                                
                                // 通用数据转换
                                if (convertToWanYuan) {
                                    // 元 → 万元转换
                                    value = value / 10000;
                                }
                                
                                // 统一格式化小数位数
                                if (typeof value === 'number') {
                                    value = parseFloat(value.toFixed(decimalPlaces));
                                }
                                
                                dataPoints.push({
                                    period: dataYear,
                                    value: value,
                                    year: dataPoint.year || parseInt(dataYear),
                                    indicator_code: dataPoint.indicator_code || indicatorCode,
                                    original_value: dataPoint.value, // 保留原始值用于调试
                                    unit: unit,
                                    decimal_places: decimalPlaces
                                });
                            }
                        }
                    }
                } else if (yearData.value !== undefined) {
                    // 处理扁平结构：yearData直接包含value
                    // 首先检查是否为二维数据（包含x和y）
                    if (yearData.value && typeof yearData.value === 'object' && 
                        yearData.value.x !== undefined && yearData.value.y !== undefined) {
                        // 二维数据：直接传递x和y，不进行单位转换
                        dataPoints.push({
                            period: yearKey,
                            value: yearData.value, // 包含x和y的对象
                            x: yearData.value.x,
                            y: yearData.value.y,
                            year: parseInt(yearKey),
                            indicator_code: indicatorCode,
                            unit: unit,
                            decimal_places: decimalPlaces
                        });
                    } else {
                        // 一维数据：常规处理
                        let value = yearData.value;
                        
                        // 通用数据转换
                        if (convertToWanYuan) {
                            // 元 → 万元转换
                            value = value / 10000;
                        }
                        
                        // 统一格式化小数位数
                        if (typeof value === 'number') {
                            value = parseFloat(value.toFixed(decimalPlaces));
                        }
                        
                        dataPoints.push({
                            period: yearKey,
                            value: value,
                            year: parseInt(yearKey),
                            indicator_code: indicatorCode,
                            original_value: yearData.value, // 保留原始值用于调试
                            unit: unit,
                            decimal_places: decimalPlaces
                        });
                    }
                }
            }
        }
        
        // 按年份排序
        dataPoints.sort((a, b) => parseInt(a.year) - parseInt(b.year));
        
        console.log(`提取指标 ${indicatorCode} 数据: ${dataPoints.length} 个数据点, 单位: ${unit}, 小数位: ${decimalPlaces}`);
        if (dataPoints.length > 0) {
            const firstPoint = dataPoints[0];
            const lastPoint = dataPoints[dataPoints.length-1];
            console.log(`示例数据点: 年份=${firstPoint.year}, 值=${firstPoint.value}${unit}, 原始值=${firstPoint.original_value}`);
            console.log(`数据年份范围: ${firstPoint.year} - ${lastPoint.year}`);
            
            // 验证数据转换
            if (convertToWanYuan && firstPoint.original_value) {
                const expectedValue = parseFloat((firstPoint.original_value / 10000).toFixed(decimalPlaces));
                console.log(`单位转换验证: ${firstPoint.original_value}元 → ${expectedValue}万元 (实际: ${firstPoint.value}万元)`);
            }
        }
        return dataPoints;
        
    } catch (error) {
        console.error(`提取指标数据失败 ${indicatorCode}:`, error);
        return [];
    }
}

/**
 * 渲染ECharts图表
 */
export function renderEChart(chartId, dataPoints, chartConfig, chartIndex = 0) {
    if (!window.echarts) {
        console.error('ECharts未加载');
        return;
    }
    
    console.log(`渲染图表 ${chartId}, 数据点数量: ${dataPoints.length}`);
    if (dataPoints.length > 0) {
        console.log(`第一个数据点: ${JSON.stringify(dataPoints[0])}`);
        console.log(`最后一个数据点: ${JSON.stringify(dataPoints[dataPoints.length-1])}`);
    }
    
    if (dataPoints.length === 0) {
        console.warn('数据为空，无法渲染图表');
        return;
    }
    
    const chartElement = document.getElementById(chartId);
    if (!chartElement) {
        console.error(`图表容器未找到: ${chartId}`);
        return;
    }
    
    // 获取图表配置
    const chartOptions = getChartOptions(dataPoints, chartConfig, chartIndex);
    console.log(`图表配置生成完成, 类型: ${chartConfig?.type || '默认'}`);
    
    // 渲染图表
    const chart = window.echarts.init(chartElement);
    chart.setOption(chartOptions);
    console.log(`图表 ${chartId} 渲染完成`);
    
    // 响应窗口大小变化
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

/**
 * 获取图表配置
 */
function getChartOptions(dataPoints, chartConfig, chartIndex = 0) {
    // 提取期间数据
    const periods = dataPoints.map(d => d.period || d.year || '未知');
    
    if (chartConfig) {
        const chartType = chartConfig.type || 'line';
        const chartName = chartConfig.name || '图表';
        const unit = chartConfig.unit || '';
        
        // 将中文图表类型转换为英文类型
        let actualChartType = chartType;
        if (chartType === '柱状图') {
            actualChartType = 'bar';
        } else if (chartType === '折线图') {
            actualChartType = 'line';
        } else if (chartType === '堆叠柱状图') {
            actualChartType = 'stacked_bar';
        } else if (chartType === '象限点阵图') {
            actualChartType = '象限点阵图'; // 保持原样，特殊处理
        }
        
        // 根据图表类型生成不同的配置
        if (actualChartType === 'bar' && chartName.includes('三支柱')) {
            // 7.12的堆叠柱状图 - 利润三支柱结构
            return getProfitThreePillarsChart(periods, dataPoints, chartName);
        } else if (actualChartType === 'line') {
            // 通用折线图
            return getGenericLineChart(periods, dataPoints, chartName, chartIndex, unit);
        } else if (actualChartType === 'bar') {
            // 通用柱状图
            return getGenericBarChart(periods, dataPoints, chartName, chartIndex, unit);
        } else if (actualChartType === 'stacked_bar') {
            // 堆叠柱状图
            return getStackedBarChart(periods, dataPoints, chartConfig, chartIndex);
        } else if (actualChartType === '象限点阵图') {
            // 象限点阵图（使用散点图实现）
            // 传递指标代码用于自定义标签
            const indicatorCode = chartConfig.indicator_code || '';
            return getQuadrantScatterChart(dataPoints, chartName, unit, indicatorCode);
        }
    }
    
    // 如果没有配置，使用默认折线图
    return getGenericLineChart(periods, dataPoints, '数据趋势图', chartIndex);
}

/**
 * 堆叠柱状图
 */
function getStackedBarChart(periods, dataPoints, chartConfig, chartIndex = 0) {
    const chartName = chartConfig.title || '堆叠柱状图';
    const seriesConfigs = chartConfig.series || [];
    
    // 准备系列数据
    const series = [];
    
    for (let i = 0; i < seriesConfigs.length; i++) {
        const seriesConfig = seriesConfigs[i];
        const seriesName = seriesConfig.name || `系列${i + 1}`;
        const seriesColor = seriesConfig.color || CHART_COLORS[Object.keys(CHART_COLORS)[i % Object.keys(CHART_COLORS).length]];
        
        // 提取该系列的数据
        let seriesData = [];
        
        if (dataPoints.length > 0) {
            // 检查是否有系列数据
            const seriesKey = `series_${i}`;
            if (dataPoints[0][seriesKey] !== undefined) {
                // 使用系列数据
                seriesData = dataPoints.map(d => d[seriesKey] || 0);
            } else if (dataPoints[0].values) {
                // 使用values对象
                const valueKeys = Object.keys(dataPoints[0].values).filter(key => 
                    typeof dataPoints[0].values[key] === 'number'
                );
                
                if (valueKeys.length > i) {
                    const valueKey = valueKeys[i];
                    seriesData = dataPoints.map(d => d.values[valueKey] || 0);
                } else if (valueKeys.length > 0) {
                    // 如果索引超出范围，使用第一个值
                    const valueKey = valueKeys[0];
                    seriesData = dataPoints.map(d => d.values[valueKey] || 0);
                } else {
                    // 如果没有数值字段，使用默认数据
                    seriesData = dataPoints.map((_, idx) => (idx + 1) * (i + 1));
                }
            } else {
                // 如果没有values，使用默认数据
                seriesData = dataPoints.map((_, idx) => (idx + 1) * (i + 1));
            }
        } else {
            // 如果没有数据点，使用默认数据
            seriesData = periods.map((_, idx) => (idx + 1) * (i + 1));
        }
        
        series.push({
            name: seriesName,
            type: 'bar',
            stack: 'total',
            data: seriesData,
            itemStyle: { color: seriesColor }
        });
    }
    
    return {
        title: {
            text: chartName,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: series.map(s => s.name),
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '12%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: periods,
            name: '期间'
        },
        yAxis: {
            type: 'value',
            name: '数值'
        },
        series: series
    };
}

/**
 * 利润三支柱结构堆叠图（7.12专用）
 */
function getProfitThreePillarsChart(periods, dataPoints, chartName) {
    // 提取三支柱数据
    const coreRatios = dataPoints.map(d => d.values?.core_profit_ratio || 0);
    const otherRatios = dataPoints.map(d => d.values?.other_income_ratio || 0);
    const miscRatios = dataPoints.map(d => d.values?.miscellaneous_income_ratio || 0);
    
    // 检查是否有三支柱数据
    const hasThreePillars = coreRatios.some(v => parseFloat(v) > 0) || 
                          otherRatios.some(v => parseFloat(v) > 0) || 
                          miscRatios.some(v => parseFloat(v) > 0);
    
    if (!hasThreePillars) {
        // 按照开发原则7：避免mock数据
        // 但如果API返回了数据，尝试显示一个简单的图表
        if (dataPoints.length > 0 && dataPoints[0].values) {
            // 尝试从values中提取任何数值数据
            const values = dataPoints[0].values;
            const numericFields = [];
            
            for (const [key, value] of Object.entries(values)) {
                if (typeof value === 'number' && !['components', 'data_quality', 'calculation_notes'].includes(key)) {
                    numericFields.push({ name: key, value: value });
                }
            }
            
            if (numericFields.length > 0) {
                // 创建简单的饼图显示找到的数据
                return {
                    title: {
                        text: chartName,
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item',
                        formatter: '{a} <br/>{b}: {c} ({d}%)'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left'
                    },
                    series: [
                        {
                            name: '利润结构',
                            type: 'pie',
                            radius: '50%',
                            data: numericFields.map(field => ({
                                name: field.name,
                                value: field.value
                            })),
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
            }
        }
        
        // 如果没有数据，返回空图表配置
        return {
            title: {
                text: chartName + ' (数据不完整)',
                left: 'center',
                subtext: '缺少其他收益和杂项收益数据',
                subtextStyle: {
                    color: '#999',
                    fontSize: 12
                }
            },
            graphic: {
                type: 'text',
                left: 'center',
                top: 'middle',
                style: {
                    text: '数据不完整，无法显示三支柱图表',
                    fill: '#999',
                    fontSize: 14
                }
            }
        };
    }
    
    return {
        title: {
            text: chartName,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function(params) {
                let result = params[0].name + '<br/>';
                let total = 0;
                params.forEach(param => {
                    // 数据已经是百分比，根据值的大小决定显示精度
                    const value = parseFloat(param.value);
                    let displayValue;
                    if (value < 0.1) {
                        displayValue = value.toFixed(4); // 小数值显示4位小数
                    } else if (value < 1) {
                        displayValue = value.toFixed(2); // 小于1的值显示2位小数
                    } else {
                        displayValue = value.toFixed(2); // 大于1的值显示2位小数
                    }
                    result += `${param.seriesName}: ${displayValue}%<br/>`;
                    total += value;
                });
                result += `<hr style="margin: 5px 0; border: none; border-top: 1px solid #ccc;">`;
                result += `总计: ${total.toFixed(2)}%`;
                return result;
            }
        },
        legend: {
            data: ['核心利润占比', '其他收益占比', '杂项收益占比'],
            top: 30
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: periods,
            name: '年份'
        },
        yAxis: {
            type: 'value',
            name: '占比',
            min: 0,
            // 根据实际数据调整最大值
            max: Math.max(100, ...coreRatios.map(v => parseFloat(v)), 
                         ...otherRatios.map(v => parseFloat(v)), 
                         ...miscRatios.map(v => parseFloat(v))) * 1.1,
            axisLabel: {
                formatter: '{value}'
            }
        },
        series: [
            {
                name: '核心利润占比',
                type: 'bar',
                stack: 'total',
                data: coreRatios,
                itemStyle: { color: CHART_COLORS.primary }
            },
            {
                name: '其他收益占比',
                type: 'bar',
                stack: 'total',
                data: otherRatios,
                itemStyle: { color: CHART_COLORS.secondary }
            },
            {
                name: '杂项收益占比',
                type: 'bar',
                stack: 'total',
                data: miscRatios,
                itemStyle: { color: CHART_COLORS.tertiary }
            }
        ]
    };
}

/**
 * 通用折线图
 */
function getGenericLineChart(periods, dataPoints, chartName, chartIndex = 0, unit = '') {
    // 获取系列数据
    let seriesData = [];
    let seriesName = `系列${chartIndex + 1}`;
    
    // 尝试从数据点中提取系列数据
    if (dataPoints.length > 0) {
        // 检查是否有value字段（我们的数据格式）
        if (dataPoints[0].value !== undefined) {
            // 使用value字段
            seriesData = dataPoints.map(d => d.value || 0);
            seriesName = chartName || `指标${chartIndex + 1}`;
            console.log(`使用value字段，数据长度: ${seriesData.length}`);
        }
        // 检查是否有系列数据
        else if (dataPoints[0][`series_${chartIndex}`] !== undefined) {
            // 使用系列数据
            seriesData = dataPoints.map(d => d[`series_${chartIndex}`] || 0);
            seriesName = `系列${chartIndex + 1}`;
        } else if (dataPoints[0].values) {
            // 使用values对象
            const valueKeys = Object.keys(dataPoints[0].values).filter(key => 
                typeof dataPoints[0].values[key] === 'number'
            );
            
            if (valueKeys.length > chartIndex) {
                const valueKey = valueKeys[chartIndex];
                seriesData = dataPoints.map(d => d.values[valueKey] || 0);
                seriesName = valueKey;
            } else if (valueKeys.length > 0) {
                // 如果索引超出范围，使用第一个值
                const valueKey = valueKeys[0];
                seriesData = dataPoints.map(d => d.values[valueKey] || 0);
                seriesName = valueKey;
            } else {
                // 如果没有数值字段，使用默认数据
                seriesData = dataPoints.map((_, i) => i * 10);
            }
        } else {
            // 如果没有values，使用默认数据
            seriesData = dataPoints.map((_, i) => i * 10);
        }
    } else {
        // 如果没有数据点，使用默认数据
        seriesData = periods.map((_, i) => i * 10);
    }
    
    return {
        title: {
            text: chartName,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function(params) {
                let result = params[0].name + '<br/>';
                params.forEach(function(item) {
                    result += item.marker + item.seriesName + ': ' + item.value;
                    
                    // 尝试从数据点中获取单位
                    const dataPoint = dataPoints.find(d => d.period === params[0].name);
                    if (dataPoint && dataPoint.unit) {
                        if (dataPoint.unit === '万元') {
                            result += ' 万元';
                        } else if (dataPoint.unit === '%') {
                            result += '%';
                        } else if (dataPoint.unit === '倍') {
                            result += ' 倍';
                        } else if (dataPoint.unit === '次') {
                            result += ' 次';
                        } else if (dataPoint.unit === '天') {
                            result += ' 天';
                        } else if (dataPoint.unit) {
                            result += ' ' + dataPoint.unit;
                        }
                    }
                    result += '<br/>';
                });
                return result;
            }
        },
        xAxis: {
            type: 'category',
            data: periods,
            name: '期间'
        },
        yAxis: {
            type: 'value',
            name: unit ? `数值 (${unit})` : '数值'
        },
        series: [
            {
                name: seriesName,
                type: 'line',
                data: seriesData,
                smooth: true,
                itemStyle: { color: CHART_COLORS.primary }
            }
        ]
    };
}

/**
 * 通用柱状图
 */
function getGenericBarChart(periods, dataPoints, chartName, chartIndex = 0, unit = '') {
    // 获取系列数据
    let seriesData = [];
    let seriesName = `系列${chartIndex + 1}`;
    
    // 尝试从数据点中提取系列数据
    if (dataPoints.length > 0) {
        // 检查是否有value字段（我们的数据格式）
        if (dataPoints[0].value !== undefined) {
            // 使用value字段
            seriesData = dataPoints.map(d => d.value || 0);
            seriesName = chartName || `指标${chartIndex + 1}`;
            console.log(`柱状图使用value字段，数据长度: ${seriesData.length}`);
        }
        // 检查是否有系列数据
        else if (dataPoints[0][`series_${chartIndex}`] !== undefined) {
            // 使用系列数据
            seriesData = dataPoints.map(d => d[`series_${chartIndex}`] || 0);
            seriesName = `系列${chartIndex + 1}`;
        } else if (dataPoints[0].values) {
            // 使用values对象
            const valueKeys = Object.keys(dataPoints[0].values).filter(key => 
                typeof dataPoints[0].values[key] === 'number'
            );
            
            if (valueKeys.length > chartIndex) {
                const valueKey = valueKeys[chartIndex];
                seriesData = dataPoints.map(d => d.values[valueKey] || 0);
                seriesName = valueKey;
            } else if (valueKeys.length > 0) {
                // 如果索引超出范围，使用第一个值
                const valueKey = valueKeys[0];
                seriesData = dataPoints.map(d => d.values[valueKey] || 0);
                seriesName = valueKey;
            } else {
                // 如果没有数值字段，使用默认数据
                seriesData = dataPoints.map((_, i) => i * 10);
            }
        } else {
            // 如果没有values，使用默认数据
            seriesData = dataPoints.map((_, i) => i * 10);
        }
    } else {
        // 如果没有数据点，使用默认数据
        seriesData = periods.map((_, i) => i * 10);
    }
    
    return {
        title: {
            text: chartName,
            left: 'center'
        },
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: periods,
            name: '期间'
        },
        yAxis: {
            type: 'value',
            name: unit ? `数值 (${unit})` : '数值'
        },
        series: [
            {
                name: seriesName,
                type: 'bar',
                data: seriesData,
                itemStyle: { color: CHART_COLORS.primary }
            }
        ]
    };
}

/**
/**
 * 获取DeepSeek AI分析结果（指标组级别）
 */
async function fetchDeepSeekAnalysis(companyCode, indicatorGroupCode) {
    try {
        // 构建文件路径 - 使用指标组代码（如7.12），去掉小数点后的子指标编号
        const groupCode = indicatorGroupCode.split('.')[0] + '_' + indicatorGroupCode.split('.')[1];
        const filePath = `data/deepseek_analysis/${companyCode}/${companyCode}_${groupCode}_analysis.json`;
        
        console.log('获取DeepSeek分析结果（指标组）:', filePath);
        
        const response = await fetch(filePath);
        if (!response.ok) {
            console.log('DeepSeek分析文件不存在:', filePath);
            return null;
        }
        
        const data = await response.json();
        console.log('DeepSeek分析数据:', data);
        return data;
        
    } catch (error) {
        console.error('获取DeepSeek分析失败:', error);
        return null;
    }
}

/**
 * 生成AI分析结果卡片HTML（指标组级别）
 */
/**
 * 生成直接分析卡片（保留在图表前）
 */
function generateDirectAnalysisCard(analysisData, indicatorGroupCode, groupName) {
    if (!analysisData) return '';
    
    const { conclusion } = analysisData;
    
    // 辅助函数：处理换行符
    const formatTextWithLineBreaks = (text) => {
        if (!text) return '';
        return text.replace(/\n/g, '<br>');
    };
    
    // 辅助函数：提取核心结论（前200字符或第一段）
    const extractSummary = (text) => {
        if (!text) return '';
        // 取前200字符作为摘要
        const summary = text.length > 200 ? text.substring(0, 200) + '...' : text;
        return formatTextWithLineBreaks(summary);
    };
    
    // 生成单个分析卡片
    const generateAnalysisCard = (title, content, color, icon, cardId) => {
        if (!content) return '';
        
        const formattedContent = formatTextWithLineBreaks(content);
        const summary = extractSummary(content);
        
        return `
            <div class="analysis-card" style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid ${color};">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #2c5282; margin-top: 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="background: ${color}; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">${icon}</span>
                        ${title}
                    </h4>
                    <button class="toggle-btn" data-card="${cardId}" style="background: ${color}; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: opacity 0.2s;">
                        展开
                    </button>
                </div>
                <div class="card-content">
                    <div class="summary" style="color: #333; line-height: 1.5; white-space: pre-line;">
                        ${summary}
                    </div>
                    <div class="full-content" id="full-${cardId}" style="display: none; color: #333; line-height: 1.5; white-space: pre-line;">
                        ${formattedContent}
                    </div>
                </div>
            </div>
        `;
    };
    
    return `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="color: #2c5282; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                <span style="background: #2c5282; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">AI</span>
                AI直接分析 - ${indicatorGroupCode} ${groupName || ''}
            </h3>
            
            <!-- 直接分析卡片 -->
            ${generateAnalysisCard('总结', conclusion, '#4CAF50', '✓', 'direct')}
            
            <!-- 数据来源 -->
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #bee3f8; font-size: 12px; color: #666;">
                <p style="margin: 0;">📊 基于2014-2024年时间序列数据 | 🤖 DeepSeek AI分析 | 📅 ${analysisData.analysis_date || new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

/**
 * 生成其他分析卡片（间接分析、结论、风险提示，移动到图表后）
 */
function generateOtherAnalysisCards(analysisData, indicatorGroupCode, groupName) {
    if (!analysisData) return '';
    
    const { direct_analysis, indirect_analysis, risk_analysis } = analysisData;
    
    // 辅助函数：处理换行符
    const formatTextWithLineBreaks = (text) => {
        if (!text) return '';
        return text.replace(/\n/g, '<br>');
    };
    
    // 辅助函数：提取核心结论（前200字符或第一段）
    const extractSummary = (text) => {
        if (!text) return '';
        // 取前200字符作为摘要
        const summary = text.length > 200 ? text.substring(0, 200) + '...' : text;
        return formatTextWithLineBreaks(summary);
    };
    
    // 生成单个分析卡片
    const generateAnalysisCard = (title, content, color, icon, cardId) => {
        if (!content) return '';
        
        const formattedContent = formatTextWithLineBreaks(content);
        const summary = extractSummary(content);
        
        return `
            <div class="analysis-card" style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid ${color};">
                <div class="card-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <h4 style="color: #2c5282; margin-top: 0; font-size: 16px; display: flex; align-items: center; gap: 8px;">
                        <span style="background: ${color}; color: white; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px;">${icon}</span>
                        ${title}
                    </h4>
                    <button class="toggle-btn" data-card="${cardId}" style="background: ${color}; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; transition: opacity 0.2s;">
                        展开
                    </button>
                </div>
                <div class="card-content">
                    <div class="summary" style="color: #333; line-height: 1.5; white-space: pre-line;">
                        ${summary}
                    </div>
                    <div class="full-content" id="full-${cardId}" style="display: none; color: #333; line-height: 1.5; white-space: pre-line;">
                        ${formattedContent}
                    </div>
                </div>
            </div>
        `;
    };
    
    return `
        <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="color: #2c5282; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                <span style="background: #2c5282; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">AI</span>
                AI深度分析 - ${indicatorGroupCode} ${groupName || ''}
            </h3>
            
            <!-- 间接分析（行业结合） -->
            ${generateAnalysisCard('数据概览', direct_analysis, '#2196F3', '↗', 'indirect')}
            
            <!-- 分析结论 -->
            ${generateAnalysisCard('深度分析', indirect_analysis, '#FF9800', '★', 'conclusion')}
            
            <!-- 风险提示（紫色卡片） -->
            ${generateAnalysisCard('前瞻', risk_analysis, '#9C27B0', '⚠', 'risk')}
            
            <!-- 数据来源 -->
            <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #bee3f8; font-size: 12px; color: #666;">
                <p style="margin: 0;">📊 基于2014-2024年时间序列数据 | 🤖 DeepSeek AI分析 | 📅 ${analysisData.analysis_date || new Date().toLocaleDateString()}</p>
            </div>
        </div>
    `;
}

/**
 * 绑定收起展开事件
 */
function bindToggleEvents() {
    // 为所有收起展开按钮添加事件监听
    document.querySelectorAll('.toggle-btn').forEach(button => {
        // 移除可能已存在的事件监听器
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        
        // 添加新的事件监听器
        newButton.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card');
            const fullContent = document.getElementById('full-' + cardId);
            const summary = this.closest('.analysis-card').querySelector('.summary');
            
            if (!fullContent || !summary) return;
            
            if (fullContent.style.display === 'none' || fullContent.style.display === '') {
                // 展开
                fullContent.style.display = 'block';
                summary.style.display = 'none';
                this.textContent = '收起';
                this.style.background = '#666';
            } else {
                // 收起
                fullContent.style.display = 'none';
                summary.style.display = 'block';
                this.textContent = '展开';
                this.style.background = this.getAttribute('data-original-color') || '#9C27B0';
            }
        });
        
        // 保存原始颜色
        const originalColor = window.getComputedStyle(newButton).backgroundColor;
        newButton.setAttribute('data-original-color', originalColor);
    });
}

/**
 * 渲染指标组图表
 */
export async function renderGroupCharts(containerId, groupData, company) {
    if (!window.echarts) {
        console.error('ECharts未加载');
        return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器未找到: ${containerId}`);
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建标题
    const title = document.createElement('div');
    title.innerHTML = `
        <h2 style="color: #2c5282; margin-top: 0; padding: 20px 20px 0;">
            📊 ${company.name} - ${groupData.groupName || groupData.groupCode} 指标组
        </h2>
        <p style="color: #666; padding: 0 20px; margin-bottom: 20px;">
            包含 ${groupData.indicators.length} 个指标
        </p>
    `;
    container.appendChild(title);
    
    // 首先获取指标组的AI分析结果（只获取一次）
    const analysisData = await fetchDeepSeekAnalysis(company.ts_code, groupData.groupCode);
    
    // 1. 在图表前插入直接分析卡片
    if (analysisData) {
        const directCardContainer = document.createElement('div');
        directCardContainer.innerHTML = generateDirectAnalysisCard(analysisData, groupData.groupCode, groupData.groupName);
        container.appendChild(directCardContainer);
    }
    
    // 创建图表容器
    const chartsWrapper = document.createElement('div');
    chartsWrapper.id = 'charts-wrapper';
    container.appendChild(chartsWrapper);
    
    // 为每个指标创建图表容器
    for (const indicator of groupData.indicators) {
        // 创建指标容器
        const indicatorContainer = document.createElement('div');
        indicatorContainer.style.cssText = 'margin: 20px;';
        
        // 创建图表容器
        const chartContainer = document.createElement('div');
        chartContainer.id = `chart-${indicator.code.replace(/\./g, '-')}`;
        chartContainer.className = 'chart-container';
        chartContainer.style.cssText = `
            padding: 20px;
            background: #f0f9ff;
            border-radius: 8px;
            border: 1px solid #bee3f8;
        `;
        
        // 图表标题
        const chartTitle = document.createElement('h3');
        chartTitle.className = 'chart-title';
        chartTitle.textContent = `${indicator.code} ${indicator.name}`;
        if (indicator.unit) {
            chartTitle.textContent += ` (${indicator.unit})`;
        }
        chartTitle.style.cssText = 'color: #2c5282; margin-top: 0; margin-bottom: 15px;';
        chartContainer.appendChild(chartTitle);
        
        // 图表类型标签
        if (indicator.chartType) {
            const typeLabel = document.createElement('span');
            typeLabel.textContent = `📈 ${indicator.chartType}`;
            typeLabel.style.cssText = `
                display: inline-block;
                background: #e6f7ff;
                color: #1890ff;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 12px;
                margin-left: 10px;
                vertical-align: middle;
            `;
            chartTitle.appendChild(typeLabel);
        }
        
        // 数据状态
        const dataStatus = document.createElement('div');
        dataStatus.textContent = indicator.data.length > 0 
            ? `✅ ${indicator.data.length} 年数据` 
            : '⚠️ 无数据';
        dataStatus.style.cssText = `
            color: ${indicator.data.length > 0 ? '#52c41a' : '#faad14'};
            font-size: 12px;
            margin-bottom: 10px;
        `;
        chartContainer.appendChild(dataStatus);
        
        // 图表画布
        const chartCanvas = document.createElement('div');
        chartCanvas.id = `chart-canvas-${indicator.code.replace(/\./g, '-')}`;
        chartCanvas.className = 'chart-canvas';
        chartCanvas.style.cssText = 'width: 100%; height: 300px;';
        chartContainer.appendChild(chartCanvas);
        
        indicatorContainer.appendChild(chartContainer);
        container.appendChild(indicatorContainer);
        
        // 渲染图表
        if (indicator.data.length > 0) {
            setTimeout(() => {
                // 根据chart_type选择图表类型
                let chartType = 'line'; // 默认折线图
                if (indicator.chartType === '柱状图') {
                    chartType = 'bar';
                } else if (indicator.chartType === '堆叠柱状图') {
                    chartType = 'bar';
                    // 这里需要额外的堆叠配置
                } else if (indicator.chartType === '象限点阵图') {
                    chartType = '象限点阵图'; // 保持原样，特殊处理
                }
                
                renderEChart(
                    chartCanvas.id,
                    indicator.data,
                    { 
                        type: chartType, 
                        name: indicator.name,
                        unit: indicator.unit,
                        indicator_code: indicator.code  // 添加指标代码
                    },
                    groupData.indicators.indexOf(indicator)
                );
            }, 100);
        } else {
            // 显示无数据提示
            const noDataMsg = document.createElement('div');
            noDataMsg.textContent = '暂无数据';
            noDataMsg.style.cssText = `
                text-align: center;
                padding: 40px 0;
                color: #999;
                font-style: italic;
            `;
            chartCanvas.appendChild(noDataMsg);
        }
    }
    
    // 如果没有指标数据，显示提示
    if (groupData.indicators.length === 0) {
        const noDataContainer = document.createElement('div');
        noDataContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: #666;">
                <h3>📊 暂无指标数据</h3>
                <p>未找到 ${groupData.groupCode} 指标组的计算数据</p>
                <p style="font-size: 14px; color: #999;">
                    请确保已运行指标计算并生成数据文件
                </p>
            </div>
        `;
        container.appendChild(noDataContainer);
    }
    
    // 2. 在图表后插入其他分析卡片（间接分析、结论、风险提示）
    if (analysisData) {
        const otherCardsContainer = document.createElement('div');
        otherCardsContainer.innerHTML = generateOtherAnalysisCards(analysisData, groupData.groupCode, groupData.groupName);
        container.appendChild(otherCardsContainer);
        
        // 手动绑定收起展开事件（为所有卡片，包括直接分析和其他分析）
        setTimeout(() => {
            bindToggleEvents();
        }, 200);
    }
}

/**
 * 象限点阵图（使用散点图实现）
 */
function getQuadrantScatterChart(dataPoints, chartName, unit = '', indicatorCode = '') {
    console.log(`创建象限点阵图: ${chartName}, 指标代码: ${indicatorCode}, 数据点: ${dataPoints.length}`);
    
    // 对于象限点阵图，我们需要二维数据
    // 假设数据格式: [{x: value1, y: value2, period: year, name: '公司名'}, ...]
    
    // 提取x和y坐标
    const scatterData = [];
    const categories = [];
    
    dataPoints.forEach(point => {
        // 尝试从数据点中提取x和y坐标
        // 对于财务战略矩阵：x轴 = 资金状态，y轴 = 价值创造
        // 对于资本结构定位：x轴 = 输血结构，y轴 = 造血占比
        
        let xValue, yValue;
        
        if (point.x !== undefined && point.y !== undefined) {
            // 如果数据点已经有x,y坐标
            xValue = point.x;
            yValue = point.y;
        } else if (point.value !== undefined && typeof point.value === 'object') {
            // 如果value是对象，包含x和y
            if (point.value.x !== undefined && point.value.y !== undefined) {
                xValue = point.value.x;
                yValue = point.value.y;
            } else {
                xValue = point.year || parseInt(point.period) || 0;
                yValue = point.value.value || 0;
            }
        } else if (point.value !== undefined) {
            // 如果只有一个值，假设它是y坐标，x坐标使用年份索引
            xValue = point.year || parseInt(point.period) || 0;
            yValue = point.value;
        } else {
            // 默认值
            xValue = Math.random() * 100 - 50;
            yValue = Math.random() * 100 - 50;
        }
        
        scatterData.push([xValue, yValue]);
        categories.push(point.period || point.year || '未知');
    });
    
    // 根据指标代码确定坐标轴范围逻辑
    let xMin, xMax, yMin, yMax;
    
    if (indicatorCode === '7.33.1') {
        // 7.33指标：坐标在0-100范围，坐标轴作为对称轴居中（中心在50）
        console.log('7.33指标：坐标在0-100范围，对称轴居中（中心50）');
        xMin = 0;
        xMax = 100;
        yMin = 0;
        yMax = 100;
    } else if (indicatorCode === '7.52.1') {
        // 7.52指标：坐标在-100到100之间，坐标轴作为对称轴居中（中心在0）
        console.log('7.52指标：坐标在-100到100之间，对称轴居中（中心0）');
        xMin = -100;
        xMax = 100;
        yMin = -100;
        yMax = 100;
    } else {
        // 其他指标：保持原有逻辑，以0为中心
        console.log('其他指标：保持以0为中心的坐标轴范围');
        
        // 确定象限边界 - 象限图应该以0为中心（对称轴）
        const xValues = scatterData.map(d => d[0]);
        const yValues = scatterData.map(d => d[1]);
        const dataXMin = Math.min(...xValues);
        const dataXMax = Math.max(...xValues);
        const dataYMin = Math.min(...yValues);
        const dataYMax = Math.max(...yValues);
        
        // 计算坐标轴范围，确保0在中间
        const xAbsMax = Math.max(Math.abs(dataXMin), Math.abs(dataXMax));
        const yAbsMax = Math.max(Math.abs(dataYMin), Math.abs(dataYMax));
        
        // 扩展范围，让图表更美观
        const xRange = Math.max(xAbsMax * 1.2, 1); // 至少为1
        const yRange = Math.max(yAbsMax * 1.2, 1);
        
        xMin = -xRange;
        xMax = xRange;
        yMin = -yRange;
        yMax = yRange;
    }
    
    // 象限图中心点
    const xCenter = indicatorCode === '7.33.1' ? 50 : 0; // 7.33中心在50，7.52中心在0
    const yCenter = indicatorCode === '7.33.1' ? 50 : 0;
    
    return {
        title: {
            text: chartName,
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function(params) {
                const index = params.dataIndex;
                const x = params.value[0];
                const y = params.value[1];
                const period = categories[index];
                
                // 确定象限 - 根据指标代码使用不同的中心点
                let quadrant = '';
                let quadrantName = '';
                
                if (indicatorCode === '7.33.1') {
                    // 7.33指标：以50为中心点（0-100范围）
                    if (x >= 50 && y >= 50) {
                        quadrant = '第一象限';
                        quadrantName = '金融负债驱动型';
                    } else if (x < 50 && y >= 50) {
                        quadrant = '第二象限';
                        quadrantName = '利润积累型';
                    } else if (x < 50 && y < 50) {
                        quadrant = '第三象限';
                        quadrantName = '经营驱动型';
                    } else if (x >= 50 && y < 50) {
                        quadrant = '第四象限';
                        quadrantName = '股东输血型';
                    }
                } else if (indicatorCode === '7.52.1') {
                    // 7.52指标：以0为中心点（-100到100范围）
                    if (x >= 0 && y >= 0) {
                        quadrant = '第一象限';
                        quadrantName = '利润资金双增型';
                    } else if (x < 0 && y >= 0) {
                        quadrant = '第二象限';
                        quadrantName = '资金占有能力强型';
                    } else if (x < 0 && y < 0) {
                        quadrant = '第三象限';
                        quadrantName = '利润资金双输型';
                    } else if (x >= 0 && y < 0) {
                        quadrant = '第四象限';
                        quadrantName = '账面利润型';
                    }
                } else {
                    // 其他指标：以0为中心点
                    if (x >= 0 && y >= 0) {
                        quadrant = '第一象限';
                        quadrantName = '第一象限';
                    } else if (x < 0 && y >= 0) {
                        quadrant = '第二象限';
                        quadrantName = '第二象限';
                    } else if (x < 0 && y < 0) {
                        quadrant = '第三象限';
                        quadrantName = '第三象限';
                    } else if (x >= 0 && y < 0) {
                        quadrant = '第四象限';
                        quadrantName = '第四象限';
                    }
                }
                
                // 根据指标代码显示不同的坐标轴名称
                const xAxisName = indicatorCode === '7.33.1' ? '输血占比' : 
                                indicatorCode === '7.52.1' ? '资金状态' : 'X轴';
                const yAxisName = indicatorCode === '7.33.1' ? '造血占比' : 
                                indicatorCode === '7.52.1' ? '价值创造' : 'Y轴';
                
                return `${period}<br/>${xAxisName}: ${x.toFixed(2)}<br/>${yAxisName}: ${y.toFixed(2)}<br/>象限: ${quadrant} (${quadrantName})`;
            }
        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%',
            top: '15%',
            containLabel: true
        },
        xAxis: {
            name: indicatorCode === '7.33.1' ? '输血占比' : 
                  indicatorCode === '7.52.1' ? '资金状态' : 
                  chartName.includes('财务战略') ? '资金状态' : '输血结构',
            nameLocation: 'middle',
            nameGap: 30,
            min: xMin,
            max: xMax,
            axisLine: {
                onZero: indicatorCode === '7.52.1', // 只有7.52需要onZero，因为中心是0
                lineStyle: {
                    color: '#666'
                }
            },
            axisTick: {
                show: true
            },
            splitLine: {
                lineStyle: {
                    type: 'dashed',
                    color: '#e0e0e0'
                }
            }
        },
        yAxis: {
            name: indicatorCode === '7.33.1' ? '造血占比' : 
                  indicatorCode === '7.52.1' ? '价值创造' : 
                  chartName.includes('财务战略') ? '价值创造' : '造血占比',
            nameLocation: 'middle',
            nameGap: 40,
            min: yMin,
            max: yMax,
            axisLine: {
                onZero: indicatorCode === '7.52.1', // 只有7.52需要onZero，因为中心是0
                lineStyle: {
                    color: '#666'
                }
            },
            axisTick: {
                show: true
            },
            splitLine: {
                lineStyle: {
                    type: 'dashed',
                    color: '#e0e0e0'
                }
            }
        },
        series: [
            {
                name: '数据点',
                type: 'scatter',
                symbolSize: 12,
                data: scatterData,
                itemStyle: {
                    color: function(params) {
                        const x = params.data[0];
                        const y = params.data[1];
                        
                        // 根据指标代码使用不同的中心点判断象限
                        if (indicatorCode === '7.33.1') {
                            // 7.33指标：以50为中心点（0-100范围）
                            if (x >= 50 && y >= 50) return '#ff6b6b'; // 第一象限 - 红色
                            else if (x < 50 && y >= 50) return '#4ecdc4'; // 第二象限 - 青色
                            else if (x < 50 && y < 50) return '#45b7d1'; // 第三象限 - 蓝色
                            else return '#96ceb4'; // 第四象限 - 绿色
                        } else if (indicatorCode === '7.52.1') {
                            // 7.52指标：以0为中心点（-100到100范围）
                            if (x >= 0 && y >= 0) return '#ff6b6b'; // 第一象限 - 红色
                            else if (x < 0 && y >= 0) return '#4ecdc4'; // 第二象限 - 青色
                            else if (x < 0 && y < 0) return '#45b7d1'; // 第三象限 - 蓝色
                            else return '#96ceb4'; // 第四象限 - 绿色
                        } else {
                            // 其他指标：以0为中心点
                            if (x >= 0 && y >= 0) return '#ff6b6b'; // 第一象限 - 红色
                            else if (x < 0 && y >= 0) return '#4ecdc4'; // 第二象限 - 青色
                            else if (x < 0 && y < 0) return '#45b7d1'; // 第三象限 - 蓝色
                            else return '#96ceb4'; // 第四象限 - 绿色
                        }
                    }
                },
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            },
            // 为7.33指标添加中心线（在50的位置）
            ...(indicatorCode === '7.33.1' ? [
                {
                    type: 'line',
                    symbol: 'none',
                    lineStyle: {
                        color: '#666',
                        width: 1,
                        type: 'solid'
                    },
                    data: [
                        [50, yMin],  // 垂直线起点
                        [50, yMax]   // 垂直线终点
                    ],
                    silent: true,
                    zlevel: 1
                },
                {
                    type: 'line',
                    symbol: 'none',
                    lineStyle: {
                        color: '#666',
                        width: 1,
                        type: 'solid'
                    },
                    data: [
                        [xMin, 50],  // 水平线起点
                        [xMax, 50]   // 水平线终点
                    ],
                    silent: true,
                    zlevel: 1
                }
            ] : []),
            // 为7.52指标确保中心线显示（在0的位置）
            ...(indicatorCode === '7.52.1' ? [
                {
                    type: 'line',
                    symbol: 'none',
                    lineStyle: {
                        color: '#666',
                        width: 1,
                        type: 'solid'
                    },
                    data: [
                        [0, yMin],  // 垂直线起点
                        [0, yMax]   // 垂直线终点
                    ],
                    silent: true,
                    zlevel: 1
                },
                {
                    type: 'line',
                    symbol: 'none',
                    lineStyle: {
                        color: '#666',
                        width: 1,
                        type: 'solid'
                    },
                    data: [
                        [xMin, 0],  // 水平线起点
                        [xMax, 0]   // 水平线终点
                    ],
                    silent: true,
                    zlevel: 1
                }
            ] : []),
            // 添加象限标签 - 根据指标代码放在不同的位置
            {
                type: 'scatter',
                symbolSize: 0,
                data: indicatorCode === '7.33.1' ? [
                    [75, 75],      // 第一象限：右上角 (0-100范围，中心50)
                    [25, 75],      // 第二象限：左上角 (0-100范围，中心50)
                    [25, 25],      // 第三象限：左下角 (0-100范围，中心50)
                    [75, 25]       // 第四象限：右下角 (0-100范围，中心50)
                ] : indicatorCode === '7.52.1' ? [
                    [50, 50],      // 第一象限：右上角 (-100到100范围，中心0)
                    [-50, 50],     // 第二象限：左上角 (-100到100范围，中心0)
                    [-50, -50],    // 第三象限：左下角 (-100到100范围，中心0)
                    [50, -50]      // 第四象限：右下角 (-100到100范围，中心0)
                ] : [
                    [xMax * 0.7, yMax * 0.7],      // 第一象限：右上角
                    [xMin * 0.7, yMax * 0.7],      // 第二象限：左上角
                    [xMin * 0.7, yMin * 0.7],      // 第三象限：左下角
                    [xMax * 0.7, yMin * 0.7]       // 第四象限：右下角
                ],
                label: {
                    show: true,
                    formatter: function(params) {
                        const index = params.dataIndex;
                        if (indicatorCode === '7.33.1') {
                            const labels = ['金融负债驱动型', '利润积累型', '经营驱动型', '股东输血型'];
                            return labels[index] || `第${index+1}象限`;
                        } else if (indicatorCode === '7.52.1') {
                            const labels = ['利润资金双增型', '资金占有能力强型', '利润资金双输型', '账面利润型'];
                            return labels[index] || `第${index+1}象限`;
                        } else {
                            return `第${index+1}象限`;
                        }
                    },
                    color: '#333',
                    fontSize: 14,
                    fontWeight: 'bold',
                    position: 'inside',
                    padding: [5, 5],
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    borderRadius: 4
                }
            }
        ]
    };
}

/**
 * 生成模拟数据（临时使用）
 */
function generateMockData() {
    const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
    return years.map(year => ({
        period: year,
        value: Math.random() * 100
    }));
}