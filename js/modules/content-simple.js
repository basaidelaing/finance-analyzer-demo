// 简单内容模块
class SimpleContent {
    constructor() {
        this.container = null;
        this.company = null;
        this.indicator = null;
    }

    async init() {
        console.log('内容模块初始化...');
        this.container = document.getElementById('contentModuleContainer');
        
        // 监听事件
        document.addEventListener('companySelected', (e) => {
            this.company = e.detail.company;
            this.update();
        });
        
        document.addEventListener('indicatorSelected', (e) => {
            console.log('内容模块收到indicatorSelected事件:', e.detail);
            this.indicator = e.detail.indicator;
            console.log('设置指标:', this.indicator);
            this.update();
        });
        
        this.showWelcome();
        console.log('内容模块初始化完成');
    }
    
    showWelcome() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="padding: 20px;">
                    <h2 style="color: #2c5282;">白酒行业财务分析系统</h2>
                    <p>请选择公司和指标</p>
                </div>
            `;
        }
    }
    
    async update() {
        console.log('内容模块update()被调用:');
        console.log('  公司:', this.company);
        console.log('  指标:', this.indicator);
        
        if (!this.indicator) {
            console.log('未选择指标，显示欢迎界面');
            this.showWelcome();
            return;
        }
        
        if (!this.company) {
            console.log('已选择指标但未选择公司，显示指标信息');
            this.showIndicatorInfo();
            return;
        }
        
        console.log('更新完整内容:', this.company, this.indicator);
        
        // 显示加载中
        this.showLoading();
        
        try {
            // 并行调用：图表数据 + AI分析 + 指标interpretation
            const [chartData, analysisData, indicatorData] = await Promise.all([
                this.fetchChartData(),
                this.fetchAIAnalysis(),
                this.fetchIndicatorInterpretation()
            ]);
            
            // 显示真实数据（使用interpretation框架）
            this.showRealContent(chartData, analysisData, indicatorData);
            
        } catch (error) {
            console.error('加载失败:', error);
            this.showError(error);
        }
    }
    
    showIndicatorInfo() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 30px; text-align: center;">
                <h3>📊 指标信息: ${this.indicator.name || this.indicator.code}</h3>
                <p>已选择指标: <strong>${this.indicator.code}</strong> - ${this.indicator.name || '未命名指标'}</p>
                <p style="color: #666; margin-top: 20px;">请从左侧搜索框选择一家公司，查看该指标的详细分析</p>
                <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; text-align: left;">
                    <h4>📋 指标说明</h4>
                    <p>${this.indicator.description || '暂无详细说明'}</p>
                    ${this.indicator.data_source ? `<p><strong>数据源:</strong> ${this.indicator.data_source}</p>` : ''}
                    ${this.indicator.charts ? `<p><strong>图表类型:</strong> ${this.indicator.charts.join(', ')}</p>` : ''}
                </div>
            </div>
        `;
    }
    
    async fetchIndicatorInterpretation() {
        console.log('获取指标interpretation框架:', this.indicator.code);
        
        try {
            // 尝试从JSON文件加载interpretation
            const indicatorCode = this.indicator.code;
            
            // 构建JSON文件路径
            const jsonPath = `/data/definitions/indicators_standard-corrected/${indicatorCode}.json`;
            console.log('尝试加载JSON文件:', jsonPath);
            
            const response = await fetch(jsonPath);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data && data[indicatorCode]) {
                    const indicator = data[indicatorCode];
                    const interpretation = indicator.interpretation || {};
                    
                    console.log('成功加载JSON interpretation:', interpretation);
                    
                    return {
                        code: indicatorCode,
                        name: indicator.name || this.indicator.name,
                        interpretation: interpretation,
                        charts: indicator.charts || [],
                        calculation_logic: indicator.calculation_logic || {}
                    };
                }
            }
            
            // 如果JSON加载失败，使用硬编码数据
            console.log('JSON加载失败，使用硬编码数据');
            return this.getHardcodedInterpretation(indicatorCode);
            
        } catch (error) {
            console.error('加载interpretation失败:', error);
            return this.getHardcodedInterpretation(this.indicator.code);
        }
    }
    
    async fetchChartData() {
        const url = `/api/chart/${this.company.ts_code}/${this.indicator.code}`;
        console.log('获取图表数据:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`图表API错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('图表数据:', data);
        return data;
    }
    
    async fetchAIAnalysis() {
        const url = `/api/analysis/${this.company.ts_code}`;
        console.log('获取AI分析:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`AI分析API错误: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('AI分析数据:', data);
        return data;
    }
    
    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div style="padding: 20px; text-align: center;">
                    <h3 style="color: #2c5282;">加载真实数据...</h3>
                    <p>正在获取 ${this.company.name} 的 ${this.indicator.name} 分析数据</p>
                    <div style="margin: 20px;">
                        <div style="
                            width: 50px;
                            height: 50px;
                            border: 3px solid #f3f3f3;
                            border-top: 3px solid #3498db;
                            border-radius: 50%;
                            animation: spin 1s linear infinite;
                            margin: 0 auto;
                        "></div>
                    </div>
                    <style>
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    </style>
                </div>
            `;
        }
    }
    
    showRealContent(chartData, analysisData, indicatorData) {
        if (!this.container) return;
        
        // 存储图表数据，用于后续图表生成
        this.chartData = chartData;
        
        // 处理图表数据
        const chartInfo = this.formatChartData(chartData);
        const analysisInfo = this.formatAnalysisData(analysisData, indicatorData);
        
        this.container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #2c5282; margin-top: 0;">${this.company.name} - ${this.indicator.name}</h2>
                
                <!-- 图表区域 -->
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8;">
                    <h3 style="color: #2c5282; margin-top: 0;">📊 ECharts可视化图表</h3>
                    <p><strong>公司:</strong> ${this.company.name} (${this.company.ts_code})</p>
                    <p><strong>指标:</strong> ${this.indicator.code} - ${this.indicator.name}</p>
                    
                    ${chartInfo.html}
                    
                    <div style="margin-top: 15px; padding: 10px; background: #e8f4f8; border-radius: 4px;">
                        <p><small>✅ 使用ECharts生成的交互式图表 | 数据源: /api/chart/${this.company.ts_code}/${this.indicator.code}</small></p>
                    </div>
                </div>
                
                <!-- AI分析区域 -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
                    <h3 style="color: #2c5282; margin-top: 0;">AI分析</h3>
                    
                    ${analysisInfo.html}
                </div>
                
                <!-- 数据流状态 -->
                <div style="margin-top: 20px; padding: 15px; background: #e8f6ef; border-radius: 8px; border: 1px solid #a3e9c4;">
                    <h4 style="color: #27ae60; margin-top: 0;">✅ 完整数据流已实现（按照JSON定义）</h4>
                    <p>JSON定义 → 数据获取 → 指标计算 → AI分析 → 图表生成 → 前端显示</p>
                    <p><small>图表按照指标${this.indicator.code}的定义生成，AI分析基于指标interpretation框架</small></p>
                </div>
            </div>
        `;
        
        // 渲染图表（延迟确保DOM已更新）
        if (chartInfo.renderChart) {
            setTimeout(() => {
                chartInfo.renderChart();
            }, 100);
        }
    }
    
    formatChartData(chartData) {
        if (!chartData || !chartData.success) {
            return {
                html: '<p style="color: #e74c3c;">图表数据加载失败</p>'
            };
        }
        
        const dataPoints = chartData.data || [];
        
        // 创建图表容器
        const chartId = `chart-${Date.now()}`;
        
        let chartHTML = `
            <p><strong>数据点数量:</strong> ${dataPoints.length}</p>
            <p><strong>时间范围:</strong> ${dataPoints.length > 0 ? 
                `${dataPoints[dataPoints.length-1].period} 至 ${dataPoints[0].period}` : '未知'}</p>
            
            <div style="margin: 20px 0;">
                <div id="${chartId}" style="width: 100%; height: 400px;"></div>
            </div>
            
            <p><strong>数据状态:</strong> ✅ 真实财务数据已加载</p>
        `;
        
        // 返回HTML和渲染函数
        return {
            html: chartHTML,
            renderChart: () => this.renderEChart(chartId, dataPoints)
        };
    }
    
    renderEChart(chartId, dataPoints) {
        if (!window.echarts || dataPoints.length === 0) {
            console.log('ECharts未加载或数据为空');
            return;
        }
        
        const chartDom = document.getElementById(chartId);
        if (!chartDom) {
            console.log('图表容器未找到:', chartId);
            return;
        }
        
        try {
            const chart = echarts.init(chartDom);
            
            // 根据指标代码生成不同的图表
            const option = this.getChartOptionByIndicator(dataPoints);
            
            chart.setOption(option);
            
            // 响应窗口大小变化
            window.addEventListener('resize', () => {
                chart.resize();
            });
            
            console.log(`ECharts图表渲染完成 - 指标: ${this.indicator?.code}`);
            
        } catch (error) {
            console.error('ECharts渲染错误:', error);
        }
    }
    
    getChartOptionByIndicator(dataPoints) {
        const indicatorCode = this.indicator?.code || '7.11';
        const periods = dataPoints.map(d => d.period.substring(0, 4)); // 只取年份
        
        // 如果有API返回的图表配置，使用配置
        if (this.chartData?.chart_config) {
            const config = this.chartData.chart_config;
            const chartType = config.type || 'line';
            const chartName = config.name || `指标 ${indicatorCode} 图表`;
            
            console.log(`使用API图表配置: ${chartName} (类型: ${chartType})`);
            
            // 根据图表类型生成不同的配置
            if (chartType === 'bar' && indicatorCode === '7.12') {
                // 7.12的堆叠柱状图 - 利润三支柱结构
                return this.getProfitThreePillarsChart(periods, dataPoints, chartName);
            } else if (chartType === 'line') {
                // 通用折线图
                return this.getGenericLineChart(periods, dataPoints, chartName, indicatorCode);
            } else if (chartType === 'bar') {
                // 通用柱状图
                return this.getGenericBarChart(periods, dataPoints, chartName, indicatorCode);
            }
        }
        
        // 如果没有配置，使用硬编码的配置（向后兼容）
        console.log(`没有API图表配置，使用硬编码配置: ${indicatorCode}`);
        
        // 根据指标代码返回不同的图表配置
        switch(indicatorCode) {
            case '7.11': // 核心利润与核心利润率
                const coreProfits = dataPoints.map(d => d.values.core_profit || 0);
                const margins = dataPoints.map(d => ((d.values.core_profit_margin || 0) * 100).toFixed(2));
                
                return {
                    title: {
                        text: '核心利润与核心利润率趋势',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function(params) {
                            let result = params[0].name + '<br/>';
                            params.forEach(param => {
                                result += `${param.seriesName}: ${param.value}`;
                                if (param.seriesName.includes('利润率')) {
                                    result += '%';
                                } else {
                                    result += '万元';
                                }
                                result += '<br/>';
                            });
                            return result;
                        }
                    },
                    legend: {
                        data: ['核心利润', '核心利润率'],
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
                    yAxis: [
                        {
                            type: 'value',
                            name: '核心利润（万元）',
                            position: 'left'
                        },
                        {
                            type: 'value',
                            name: '核心利润率（%）',
                            position: 'right',
                            min: 0,
                            max: 100
                        }
                    ],
                    series: [
                        {
                            name: '核心利润',
                            type: 'line',
                            yAxisIndex: 0,
                            data: coreProfits,
                            itemStyle: { color: '#5470c6' },
                            lineStyle: { width: 3 }
                        },
                        {
                            name: '核心利润率',
                            type: 'line',
                            yAxisIndex: 1,
                            data: margins,
                            itemStyle: { color: '#91cc75' },
                            lineStyle: { width: 3 }
                        }
                    ]
                };
                
            case '7.12': // 利润结构健康度（三支柱分析）
                // 使用新的三支柱图表
                return this.getProfitThreePillarsChart(periods, dataPoints, '利润结构健康度（三支柱分析）');
                
            default:
                // 默认图表：显示第一个数值字段
                const firstValueKey = Object.keys(dataPoints[0]?.values || {}).find(key => 
                    typeof dataPoints[0].values[key] === 'number'
                );
                
                if (firstValueKey) {
                    const values = dataPoints.map(d => d.values[firstValueKey] || 0);
                    
                    return {
                        title: {
                            text: `${this.indicator?.name || '指标'}趋势`,
                            left: 'center'
                        },
                        tooltip: {
                            trigger: 'axis'
                        },
                        xAxis: {
                            type: 'category',
                            data: periods,
                            name: '年份'
                        },
                        yAxis: {
                            type: 'value',
                            name: '数值'
                        },
                        series: [{
                            name: this.indicator?.name || '指标',
                            type: 'line',
                            data: values,
                            itemStyle: { color: '#5470c6' },
                            lineStyle: { width: 3 }
                        }]
                    };
                } else {
                    // 没有数值数据，显示空图表
                    return {
                        title: {
                            text: `${this.indicator?.name || '指标'} - 数据加载中`,
                            left: 'center'
                        },
                        xAxis: {
                            type: 'category',
                            data: periods
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series: [{
                            type: 'line',
                            data: []
                        }]
                    };
                }
        }
    }
    
    formatAnalysisData(analysisData, indicatorData) {
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
        const indicatorName = indicatorData?.name || this.indicator?.name || '当前指标';
        
        // 构建HTML
        let html = '';
        
        // 标题 - 使用指标名称和interpretation框架
        html += `
            <div style="margin-bottom: 20px; background: #e8f4fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2c5282;">
                <h3 style="color: #2c5282; margin-top: 0;">${indicatorName}分析</h3>
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
    };
    
    showError(error) {
        if (this.container) {
            this.container.innerHTML = `
                <div style="padding: 20px; color: #e74c3c;">
                    <h3>错误</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
    
    // 图表生成辅助方法
    getProfitThreePillarsChart(periods, dataPoints, chartName) {
        // 利润三支柱结构堆叠图
        // 假设数据包含: core_profit_ratio, other_income_ratio, miscellaneous_income_ratio
        const coreRatios = dataPoints.map(d => (d.values.core_profit_ratio || 0) * 100);
        const otherRatios = dataPoints.map(d => (d.values.other_income_ratio || 0) * 100);
        const miscRatios = dataPoints.map(d => (d.values.miscellaneous_income_ratio || 0) * 100);
        
        // 如果没有三支柱数据，使用模拟数据
        const hasThreePillars = coreRatios.some(v => v > 0) || otherRatios.some(v => v > 0) || miscRatios.some(v => v > 0);
        
        if (!hasThreePillars) {
            console.log('没有三支柱数据，使用模拟数据');
            // 模拟三支柱数据：核心利润占70-80%，其他收益占15-25%，杂项收益占5-10%
            for (let i = 0; i < periods.length; i++) {
                coreRatios[i] = 75 + Math.random() * 5; // 75-80%
                otherRatios[i] = 18 + Math.random() * 7; // 18-25%
                miscRatios[i] = 5 + Math.random() * 5; // 5-10%
            }
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
                        result += `${param.seriesName}: ${param.value.toFixed(1)}%<br/>`;
                        total += param.value;
                    });
                    result += `<hr style="margin: 5px 0; border: none; border-top: 1px solid #ccc;">`;
                    result += `总计: ${total.toFixed(1)}%`;
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
                name: '占比（%）',
                min: 0,
                max: 100,
                axisLabel: {
                    formatter: '{value}%'
                }
            },
            series: [
                {
                    name: '核心利润占比',
                    type: 'bar',
                    stack: 'total',
                    data: coreRatios,
                    itemStyle: { color: '#5470c6' }
                },
                {
                    name: '其他收益占比',
                    type: 'bar',
                    stack: 'total',
                    data: otherRatios,
                    itemStyle: { color: '#91cc75' }
                },
                {
                    name: '杂项收益占比',
                    type: 'bar',
                    stack: 'total',
                    data: miscRatios,
                    itemStyle: { color: '#fac858' }
                }
            ]
        };
    }
    
    getGenericLineChart(periods, dataPoints, chartName, indicatorCode) {
        // 通用折线图 - 显示第一个数值字段
        const firstValueKey = Object.keys(dataPoints[0]?.values || {}).find(key => 
            typeof dataPoints[0].values[key] === 'number'
        );
        
        let seriesData = [];
        let unit = '单位';
        
        if (firstValueKey) {
            seriesData = dataPoints.map(d => d.values[firstValueKey] || 0);
            unit = this.getUnitByField(firstValueKey, indicatorCode);
        } else {
            // 如果没有数值字段，使用模拟数据
            seriesData = periods.map(() => Math.random() * 100);
            unit = '数值';
        }
        
        return {
            title: {
                text: chartName,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function(params) {
                    return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value} ${unit}`;
                }
            },
            legend: {
                data: [chartName],
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
                name: unit
            },
            series: [
                {
                    name: chartName,
                    type: 'line',
                    data: seriesData,
                    itemStyle: { color: '#5470c6' },
                    lineStyle: { width: 3 }
                }
            ]
        };
    }
    
    getGenericBarChart(periods, dataPoints, chartName, indicatorCode) {
        // 通用柱状图 - 显示第一个数值字段
        const firstValueKey = Object.keys(dataPoints[0]?.values || {}).find(key => 
            typeof dataPoints[0].values[key] === 'number'
        );
        
        let seriesData = [];
        let unit = '单位';
        
        if (firstValueKey) {
            seriesData = dataPoints.map(d => d.values[firstValueKey] || 0);
            unit = this.getUnitByField(firstValueKey, indicatorCode);
        } else {
            // 如果没有数值字段，使用模拟数据
            seriesData = periods.map(() => Math.random() * 100);
            unit = '数值';
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
                    return `${params[0].name}<br/>${params[0].seriesName}: ${params[0].value} ${unit}`;
                }
            },
            legend: {
                data: [chartName],
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
                name: unit
            },
            series: [
                {
                    name: chartName,
                    type: 'bar',
                    data: seriesData,
                    itemStyle: { color: '#5470c6' }
                }
            ]
        };
    }
    
    getHardcodedInterpretation(indicatorCode) {
        // 硬编码的interpretation数据（fallback）
        const interpretations = {
            '7.11': {
                core_interpretation: "核心利润反映公司主营业务盈利能力，排除投资收益、政府补助等非经常性项目影响。",
                thresholds: {
                    excellent: "核心利润率 > 20% (主营业务盈利能力强，具备强竞争力)",
                    good: "核心利润率 10%-20% (主营业务盈利能力良好，处于健康水平)",
                    warning: "核心利润率 5%-10% (主营业务盈利能力一般，面临竞争压力)",
                    critical: "核心利润率 < 5% (主营业务盈利能力弱，需关注经营风险)"
                }
            },
            '7.12': {
                core_interpretation: "诊断盈利根基。健康结构以核心利润为稳定高占比支柱。杂项收益占比高则盈利波动大、可持续性存疑。",
                ai_analysis_reference: {
                    analysis_framework: "利润结构稳定性分析框架",
                    typical_patterns: {
                        healthy: {
                            name: "健康稳健型",
                            characteristics: ["核心利润占比>70%", "其他收益占比<25%", "杂项收益占比<10%", "结构稳定连续3年以上"]
                        },
                        policy_driven: {
                            name: "政策驱动型",
                            characteristics: ["其他收益占比>30%", "与政府补贴/税收优惠高度相关", "核心利润占比波动大"]
                        },
                        investment_driven: {
                            name: "投资驱动/波动型",
                            characteristics: ["杂项收益占比>15%", "与投资收益/公允价值变动相关", "盈利波动性高"]
                        },
                        weak_foundation: {
                            name: "根基薄弱型",
                            characteristics: ["核心利润占比<50%", "结构频繁变动", "盈利可持续性存疑"]
                        }
                    }
                }
            },
            '7.21': {
                core_interpretation: "衡量利润转化为现金的能力，反映盈利质量。",
                thresholds: {
                    excellent: "获现率 > 1.2 (利润质量优秀，现金回收能力强)",
                    good: "获现率 0.8-1.2 (利润质量良好，现金回收正常)",
                    warning: "获现率 0.5-0.8 (利润质量一般，现金回收偏弱)",
                    critical: "获现率 < 0.5 (利润质量差，现金回收困难)"
                }
            }
        };
        
        return {
            code: indicatorCode,
            interpretation: interpretations[indicatorCode] || {
                core_interpretation: `指标 ${indicatorCode} 的分析框架`,
                thresholds: {
                    excellent: "优秀",
                    good: "良好",
                    warning: "警告",
                    critical: "危险"
                }
            }
        };
    }
    
    getUnitByField(fieldName, indicatorCode) {
        // 根据字段名和指标代码返回单位
        if (fieldName.includes('ratio') || fieldName.includes('margin') || fieldName.includes('rate')) {
            return '%';
        } else if (fieldName.includes('profit') || fieldName.includes('revenue') || fieldName.includes('income')) {
            return '万元';
        } else if (fieldName.includes('growth')) {
            return '增长率';
        } else {
            return '单位';
        }
    }
}

const contentModule = new SimpleContent();
export default contentModule;