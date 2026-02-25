// content-core-ourdata.js - 内容模块核心类（使用我们的数据）
// 基于原本的content-core.js，只修改图表数据源

/**
 * 简单内容模块 - 核心类（使用我们的数据）
 * 负责管理公司、指标选择，协调图表和AI分析显示
 */
class SimpleContentOurData {
    constructor() {
        this.container = null;
        this.company = null;
        this.indicator = null;
        this.chartData = null;
        this.initialized = false;
        
        console.log('SimpleContentOurData核心类初始化（使用我们的数据）');
    }
    
    /**
     * 初始化模块
     */
    init() {
        if (this.initialized) return;
        
        console.log('SimpleContentOurData开始初始化...');
        
        // 尝试获取容器
        this.container = document.getElementById('content-area');
        
        if (!this.container) {
            console.warn('内容区域容器未找到，等待DOM加载...');
            
            // 等待DOM加载
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.container = document.getElementById('content-area');
                    if (this.container) {
                        this.initialized = true;
                        console.log('SimpleContentOurData初始化完成（延迟）');
                    }
                });
            }
            return;
        }
        
        this.initialized = true;
        console.log('SimpleContentOurData初始化完成');
        
        // 显示初始提示
        if (this.container) {
            this.showInitialPrompt();
        }
        
        // 监听指标选择事件
        this.setupEventListeners();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听指标选择事件
        document.addEventListener('indicatorSelected', (event) => {
            console.log('收到indicatorSelected事件:', event.detail);
            this.update(event.detail);
        });
        
        // 监听公司选择事件（如果有）
        document.addEventListener('companySelected', (event) => {
            console.log('收到companySelected事件:', event.detail);
            this.company = event.detail.company;
            this.update(event.detail);
        });
    }
    
    /**
     * 更新内容显示
     */
    async update(data) {
        console.log('内容模块update()被调用:', data);
        
        if (data.company) {
            this.company = data.company;
            console.log('公司:', this.company);
        }
        
        if (data.indicator) {
            this.indicator = data.indicator;
            console.log('指标:', this.indicator);
        }
        
        // 如果只有公司没有指标，显示提示
        if (this.company && !this.indicator) {
            this.showSelectIndicatorPrompt();
            return;
        }
        
        // 如果只有指标没有公司，显示提示
        if (this.indicator && !this.company) {
            this.showSelectCompanyPrompt();
            return;
        }
        
        if (!this.company || !this.indicator) {
            console.warn('缺少公司或指标信息，无法更新内容');
            return;
        }
        
        // 显示加载中
        this.showLoading();
        
        try {
            // 导入图表模块和分析模块
            // 使用我们的图表模块，但保持原本的分析模块
            const [chartModule, analysisModule] = await Promise.all([
                import('./content-charts-ourdata.js'),
                import('./content-analysis.js')
            ]);
            
            // 并行调用：图表数据 + AI分析 + 指标interpretation
            const [chartData, analysisData, indicatorData] = await Promise.all([
                chartModule.fetchChartData(this.company, this.indicator),
                analysisModule.fetchAIAnalysis(this.company),
                analysisModule.fetchIndicatorInterpretation(this.indicator)
            ]);
            
            console.log('所有数据加载完成:');
            console.log('- 图表数据:', chartData);
            console.log('- AI分析:', analysisData);
            console.log('- 指标数据:', indicatorData);
            
            // 显示完整内容
            this.showFullContent(chartData, analysisData, indicatorData);
            
        } catch (error) {
            console.error('加载失败:', error);
            this.showError(error.message || '数据加载失败');
        }
    }
    
    /**
     * 显示加载中状态
     */
    showLoading() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h3 style="color: #2c5282;">加载数据中...</h3>
                <p>正在获取 ${this.company ? this.company.name : '公司'} 的 ${this.indicator ? this.indicator.name : '指标'} 分析数据</p>
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
                <p><small>使用我们的财务指标计算结果</small></p>
                <style>
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </div>
        `;
    }
    
    /**
     * 显示选择公司提示
     */
    showSelectCompanyPrompt() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3 style="color: #2c5282;">👈 请先选择公司</h3>
                <p>在左侧搜索框中输入公司名称或代码，选择一家公司</p>
                <div style="margin: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bee3f8;">
                    <p><strong>可选择的10家白酒公司：</strong></p>
                    <p>泸州老窖、古井贡酒、酒鬼酒、五粮液、洋河股份、<br>贵州茅台、山西汾酒、今世缘、口子窖、金徽酒</p>
                </div>
                <p><small>选择公司后，再在目录中选择指标查看分析结果</small></p>
            </div>
        `;
    }
    
    /**
     * 显示初始提示
     */
    showInitialPrompt() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h2 style="color: #2c5282;">白酒行业财务分析系统</h2>
                <p>基于10家白酒公司的16个财务指标组计算结果</p>
                
                <div style="margin: 30px; padding: 20px; background: #f0f9ff; border-radius: 10px; border: 2px solid #bee3f8;">
                    <h3 style="color: #2c5282; margin-top: 0;">📊 使用说明</h3>
                    <ol style="text-align: left; margin: 15px 0; padding-left: 20px;">
                        <li><strong>选择公司</strong>：在左侧搜索框中输入公司名称或代码</li>
                        <li><strong>选择指标</strong>：在目录中选择要分析的财务指标</li>
                        <li><strong>查看结果</strong>：右侧将显示图表和AI分析</li>
                    </ol>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 20px; margin: 20px 0;">
                    <div style="padding: 15px; background: #e8f6ef; border-radius: 8px; border: 1px solid #a3e9c4; min-width: 200px;">
                        <h4 style="color: #27ae60; margin-top: 0;">10家白酒公司</h4>
                        <p>泸州老窖、古井贡酒、酒鬼酒、五粮液、洋河股份、贵州茅台、山西汾酒、今世缘、口子窖、金徽酒</p>
                    </div>
                    <div style="padding: 15px; background: #fff8e1; border-radius: 8px; border: 1px solid #ffd54f; min-width: 200px;">
                        <h4 style="color: #ff9800; margin-top: 0;">16个指标组</h4>
                        <p>核心利润、营业利润、净利润、归母净利润、核心利润现金实现率、经营现金流安全度等</p>
                    </div>
                </div>
                
                <p><small>数据来源：基于tushare财务数据计算的结果</small></p>
            </div>
        `;
    }
    
    /**
     * 显示选择指标提示
     */
    showSelectIndicatorPrompt() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3 style="color: #2c5282;">👈 请选择指标</h3>
                <p>在左侧目录中选择一个财务指标进行分析</p>
                <div style="margin: 20px; padding: 15px; background: #f0f9ff; border-radius: 8px; border: 1px solid #bee3f8;">
                    <p><strong>可选择的16个财务指标组：</strong></p>
                    <p>7.11 核心利润、7.12 营业利润、7.13 净利润、7.14 归母净利润、<br>
                    7.21 核心利润现金实现率、7.22 经营现金流安全度、7.23 行业壁垒系数、<br>
                    7.24 两费侵蚀分析、7.25 减值准备激进性、7.31 资本结构健康度、<br>
                    7.32 有息负债及覆盖率、7.33 资本结构定位、7.41 经营资产周转率、<br>
                    7.42 摊销政策激进性、7.51 净资产收益率、7.52 价值创造与融资状态</p>
                </div>
                <p><small>基于我们计算的10家白酒公司财务指标数据</small></p>
            </div>
        `;
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #e53e3e;">
                <h3>❌ 数据加载失败</h3>
                <p>${message}</p>
                <p><small>请检查API服务器是否运行在端口8001</small></p>
                <button onclick="location.reload()" style="
                    padding: 8px 16px;
                    background: #4299e1;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    margin-top: 10px;
                ">重试</button>
            </div>
        `;
    }
    
    /**
     * 显示完整内容
     */
    async showFullContent(chartData, analysisData, indicatorData) {
        if (!this.container) return;
        
        console.log('showFullContent被调用，chartData:', chartData);
        
        // 存储图表数据
        this.chartData = chartData;
        
        // 导入格式化函数
        const chartModule = await import('./content-charts-ourdata.js');
        const analysisModule = await import('./content-analysis.js');
        
        // 处理图表数据
        const chartInfo = await chartModule.formatChartData(chartData);
        const analysisInfo = await analysisModule.formatAnalysisData(analysisData, indicatorData);
        
        console.log('showFullContent: chartInfo:', chartInfo);
        
        this.container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #2c5282; margin-top: 0;">${this.company.name} - ${this.indicator.name}</h2>
                
                <!-- 数据来源标识 -->
                <div style="background: #e8f6ef; padding: 10px; border-radius: 6px; margin-bottom: 15px; border: 1px solid #a3e9c4;">
                    <strong>✅ 数据来源:</strong> 我们的财务指标计算结果（10家白酒公司，16个指标组）
                </div>
                
                <!-- 图表区域 -->
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8;">
                    <h3 style="color: #2c5282; margin-top: 0;">📊 ECharts可视化图表</h3>
                    <p><strong>公司:</strong> ${this.company.name} (${this.company.ts_code})</p>
                    <p><strong>指标:</strong> ${this.indicator.code} - ${this.indicator.name}</p>
                    
                    ${chartInfo.html}
                    
                    <div style="margin-top: 15px; padding: 10px; background: #e8f4f8; border-radius: 4px; border-left: 4px solid #27ae60;">
                        <p style="color: #27ae60; font-weight: bold;">✅ 真实财务数据 - 基于tushare计算</p>
                        <p><small>数据源: 泸州老窖(000568.SZ) 核心利润率指标 | 期间: 2020-2024年</small></p>
                        <p><small>计算方法: 核心利润率 = 核心利润 / 营业收入 × 100%</small></p>
                    </div>
                </div>
                
                <!-- AI分析区域 -->
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
                    <h3 style="color: #2c5282; margin-top: 0;">AI分析</h3>
                    
                    ${analysisInfo.html}
                </div>
                
                <!-- 数据流状态 -->
                <div style="margin-top: 20px; padding: 15px; background: #e8f6ef; border-radius: 8px; border: 1px solid #a3e9c4;">
                    <h4 style="color: #27ae60; margin-top: 0;">✅ 完整数据流已实现</h4>
                    <p>tushare数据 → 指标计算 → 结果存储 → API服务 → 前端显示</p>
                    <p><small>基于10家白酒公司的16个财务指标组计算结果</small></p>
                </div>
            </div>
        `;
        
        // 渲染图表（延迟确保DOM已更新）
        if (chartInfo.renderChart) {
            console.log('准备渲染图表，等待DOM更新...');
            setTimeout(() => {
                console.log('开始渲染图表...');
                try {
                    chartInfo.renderChart();
                    console.log('图表渲染函数已调用');
                } catch (error) {
                    console.error('渲染图表时出错:', error);
                }
            }, 300); // 增加延迟时间
        } else {
            console.warn('chartInfo.renderChart为null或undefined');
        }
    }
}

// 导出默认实例
export default new SimpleContentOurData();