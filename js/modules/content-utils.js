// content-utils.js - 工具模块
// 文件大小: <10KB

/**
 * 工具模块 - 提供数据处理和格式化功能
 */

/**
 * 格式化图表数据
 */
export function formatChartData(chartData) {
    if (!chartData || !chartData.success) {
        return {
            html: '<p style="color: #e74c3c;">图表数据加载失败</p>',
            renderChart: () => {}
        };
    }
    
    const dataPoints = chartData.data || [];
    const chartCount = chartData.chart_count || 1;
    
    let chartHTML = `
        <p><strong>数据点数量:</strong> ${dataPoints.length}</p>
        <p><strong>时间范围:</strong> ${dataPoints.length > 0 ? 
            `${dataPoints[dataPoints.length-1].period} 至 ${dataPoints[0].period}` : '未知'}</p>
        <p><strong>图表数量:</strong> ${chartCount}</p>
    `;
    
    // 创建多个图表容器
    const chartIds = [];
    for (let i = 0; i < chartCount; i++) {
        const chartId = `chart-${Date.now()}-${i}`;
        chartIds.push(chartId);
        
        chartHTML += `
            <div style="margin: 30px 0; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px;">
                <h4 style="color: #2c5282; margin-top: 0;">图表 ${i + 1}</h4>
                <div id="${chartId}" style="width: 100%; height: 350px;"></div>
            </div>
        `;
    }
    
    chartHTML += `<p><strong>数据状态:</strong> ${chartData.real_data ? '✅ 真实财务数据' : '⚠️ 模拟数据'}</p>`;
    
    // 返回HTML和渲染函数
    return {
        html: chartHTML,
        renderChart: () => {
            // 动态导入图表模块进行渲染
            import('./content-charts.js').then(chartModule => {
                // 渲染所有图表
                chartIds.forEach((chartId, index) => {
                    chartModule.renderEChart(chartId, dataPoints, chartData.chart_config, index);
                });
            }).catch(error => {
                console.error('图表模块加载失败:', error);
            });
        }
    };
}

/**
 * 格式化AI分析数据
 */
export function formatAnalysisData(analysisData, indicatorData, currentIndicator) {
    if (!analysisData || !analysisData.success) {
        return {
            html: '<p style="color: #e74c3c;">AI分析加载失败</p>'
        };
    }
    
    const analysis = analysisData.analysis || {};
    const report = analysis.analysis_report_json || {};
    
    // 提取分析内容
    const overall = report.overall_assessment || {};
    const strengths = report.strength_areas || [];
    const risks = report.risk_factors || [];
    const recommendation = report.investment_recommendation || '请参考详细分析';
    
    // 使用indicatorData的interpretation框架
    const indicatorInterpretation = indicatorData?.interpretation || {};
    const indicatorName = indicatorData?.name || currentIndicator?.name || '当前指标';
    
    // 构建HTML
    let html = '';
    
    // 标题 - 使用指标名称和interpretation框架
    html += `
        <div style="margin-bottom: 20px; background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2c5282;">
            <h3 style="color: #2c5282; margin-top: 0;">🤖 基于${indicatorName}的AI分析</h3>
            ${indicatorInterpretation.core_interpretation ? 
                `<p><strong>分析框架:</strong> ${indicatorInterpretation.core_interpretation}</p>` : ''}
        </div>
    `;
    
    // 整体评估
    if (overall.score || overall.level) {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #2c5282; margin-top: 0;">📊 整体评估</h4>
                <p><strong>评分:</strong> ${overall.score || 'N/A'} / 100</p>
                <p><strong>等级:</strong> ${overall.level || '未知'}</p>
                <p><strong>趋势:</strong> ${overall.trend || '未知'}</p>
                <p><strong>行业对比:</strong> ${overall.industry_comparison || '未知'}</p>
            </div>
        `;
    }
    
    // 如果indicatorData有ai_analysis_reference，显示分析框架
    const aiRef = indicatorInterpretation.ai_analysis_reference;
    if (aiRef) {
        html += `
            <div style="margin-bottom: 20px; background: #f0f9ff; padding: 15px; border-radius: 8px;">
                <h4 style="color: #2c5282; margin-top: 0;">🔍 分析框架: ${aiRef.analysis_framework || '专业分析框架'}</h4>
        `;
        
        // 显示典型模式
        const patterns = aiRef.typical_patterns;
        if (patterns && Object.keys(patterns).length > 0) {
            html += `<p><strong>典型模式识别:</strong></p><ul style="margin: 10px 0; padding-left: 20px;">`;
            
            for (const [key, pattern] of Object.entries(patterns)) {
                html += `<li><strong>${pattern.name}:</strong> ${pattern.characteristics?.join('; ') || '无特征描述'}</li>`;
            }
            
            html += `</ul>`;
        }
        
        html += `</div>`;
    }
    
    // 优势领域
    if (strengths.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #27ae60;">✅ 优势领域</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${strengths.map(s => `<li>${s}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // 风险因素
    if (risks.length > 0) {
        html += `
            <div style="margin-bottom: 20px;">
                <h4 style="color: #e74c3c;">⚠️ 风险因素</h4>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    ${risks.map(r => `<li>${r}</li>`).join('')}
                </ul>
            </div>
        `;
    }
    
    // 阈值分析参考（已移除）
    // 投资建议（已移除）
    
    // 分析范围
    const indicators = analysis.indicator_codes || [];
    if (indicators.length > 0) {
        html += `
            <div style="margin-top: 15px; padding: 10px; background: #f1f1f1; border-radius: 4px;">
                <p><small>分析范围: 维度7的 ${indicators.length} 个指标</small></p>
            </div>
        `;
    }
    
    return {
        html: html
    };
}

/**
 * 根据字段名和指标代码返回单位
 */
export function getUnitByField(fieldName, indicatorCode) {
    // 根据字段名和指标代码返回单位
    if (!fieldName) return '单位';
    
    if (fieldName.includes('ratio') || fieldName.includes('margin') || fieldName.includes('rate')) {
        return '%';
    } else if (fieldName.includes('profit') || fieldName.includes('revenue') || fieldName.includes('income')) {
        return '万元';
    } else if (fieldName.includes('growth')) {
        return '增长率';
    } else if (fieldName.includes('turnover')) {
        return '次';
    } else if (fieldName.includes('multiple')) {
        return '倍';
    } else {
        // 根据指标代码推断单位
        if (indicatorCode) {
            if (indicatorCode.startsWith('7.1') || indicatorCode.startsWith('7.5')) {
                return '%';
            } else if (indicatorCode.startsWith('7.2')) {
                return '增长率';
            } else if (indicatorCode.startsWith('7.3')) {
                return '次';
            } else if (indicatorCode.startsWith('7.4')) {
                return '倍';
            }
        }
        return '单位';
    }
}

/**
 * 获取指标分类名称
 */
export function getCategoryName(categoryCode) {
    const categories = {
        'profitability': '盈利能力',
        'growth': '成长能力',
        'efficiency': '运营效率',
        'stability': '财务稳健',
        'valuation': '估值水平',
        'other': '其他'
    };
    
    return categories[categoryCode] || categoryCode;
}

/**
 * 格式化数值
 */
export function formatNumber(value, decimals = 2) {
    if (value === null || value === undefined) return 'N/A';
    
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    
    return num.toFixed(decimals);
}

/**
 * 格式化百分比
 */
export function formatPercent(value, decimals = 1) {
    if (value === null || value === undefined) return 'N/A';
    
    const num = parseFloat(value);
    if (isNaN(num)) return 'N/A';
    
    return `${(num * 100).toFixed(decimals)}%`;
}

/**
 * 获取指标颜色
 */
export function getIndicatorColor(indicatorCode) {
    const colorMap = {
        '7.11': '#5470c6',
        '7.12': '#91cc75',
        '7.13': '#fac858',
        '7.14': '#ee6666',
        '7.21': '#5470c6',
        '7.22': '#91cc75',
        '7.23': '#fac858',
        '7.24': '#ee6666',
        '7.25': '#73c0de',
        '7.31': '#5470c6',
        '7.32': '#91cc75',
        '7.33': '#fac858',
        '7.41': '#ee6666',
        '7.42': '#73c0de',
        '7.43': '#5470c6',
        '7.44': '#91cc75',
        '7.51': '#fac858',
        '7.52': '#ee6666',
        '7.53': '#73c0de'
    };
    
    return colorMap[indicatorCode] || '#5470c6';
}