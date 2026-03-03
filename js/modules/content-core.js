// content-core.js - 内容模块核心类
// 文件大小: <10KB

/**
 * 简单内容模块 - 核心类
 * 负责管理公司、指标选择，协调图表和AI分析显示
 */
class SimpleContent {
    constructor() {
        this.container = null;
        this.company = null;
        this.indicator = null;
        this.indicatorGroup = null; // 存储选择的指标组
        this.chartData = null;
        this.initialized = false;
        
        console.log('SimpleContent核心类初始化');
    }
    
    /**
     * 初始化模块
     */
    init() {
        if (this.initialized) return;
        
        console.log('SimpleContent开始初始化...');
        console.log('document.readyState:', document.readyState);
        console.log('document.body:', document.body ? '存在' : '不存在');
        
        // 尝试获取容器
        this.container = document.getElementById('content-area');
        console.log('查找#content-area结果:', this.container ? '找到' : '未找到');
        
        if (!this.container) {
            console.warn('内容区域容器未找到: #content-area，等待DOM加载...');
            
            // 输出所有id为调试
            this.debugAllIds();
            
            // 等待DOM加载完成
            if (document.readyState === 'loading') {
                console.log('DOM还在加载中，添加监听器...');
                document.addEventListener('DOMContentLoaded', () => {
                    console.log('DOMContentLoaded事件触发');
                    this.container = document.getElementById('content-area');
                    if (this.container) {
                        console.log('DOM加载后找到容器');
                        this.finishInit();
                    } else {
                        console.error('DOM加载后仍未找到容器: #content-area');
                        this.debugAllIds();
                    }
                });
            } else {
                // DOM已加载，但容器不存在
                console.error('DOM已加载但容器不存在: #content-area');
                this.debugAllIds();
            }
            return;
        }
        
        this.finishInit();
    }
    
    /**
     * 调试：输出所有id
     */
    debugAllIds() {
        console.log('=== 调试：所有元素id ===');
        const allElements = document.querySelectorAll('[id]');
        console.log(`找到 ${allElements.length} 个有id的元素`);
        
        if (allElements.length > 0) {
            allElements.forEach((el, i) => {
                if (i < 10) { // 只显示前10个
                    console.log(`  ${el.id}: ${el.tagName}.${el.className || '无class'}`);
                }
            });
            if (allElements.length > 10) {
                console.log(`  ... 还有 ${allElements.length - 10} 个元素`);
            }
        } else {
            console.log('  没有找到有id的元素');
        }
        console.log('=== 调试结束 ===');
    }
    
    /**
     * 完成初始化
     */
    finishInit() {
        if (this.initialized) return;
        
        this.initialized = true;
        console.log('SimpleContent模块初始化完成');
        
        // 监听事件
        this.setupEventListeners();
        
        // 显示欢迎信息
        this.showWelcome();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 监听公司选择事件
        document.addEventListener('companySelected', (event) => {
            console.log('收到companySelected事件:', event.detail);
            this.company = event.detail.company;
            this.update();
        });
        
        // 监听指标选择事件（实际是指标组选择）
        document.addEventListener('indicatorSelected', (event) => {
            console.log('收到indicatorSelected事件（实际是指标组）:', event.detail);
            this.indicatorGroup = event.detail.indicator; // 实际上是指标组
            this.update();
        });
    }
    
    /**
     * 更新内容显示
     */
    update() {
        if (!this.container) {
            console.error('容器未初始化');
            return;
        }
        
        console.log('内容模块update()被调用:');
        console.log('公司:', this.company);
        console.log('指标组:', this.indicatorGroup);
        
        // 根据选择状态显示不同内容
        if (!this.company && !this.indicatorGroup) {
            this.showWelcome();
        } else if (this.indicatorGroup && !this.company) {
            this.showIndicatorInfo();
        } else if (this.company && this.indicatorGroup) {
            this.showGroupContent(); // 显示指标组内容
        } else if (this.company && !this.indicatorGroup) {
            this.showCompanyInfo();
        }
    }
    
    /**
     * 显示欢迎信息
     */
    showWelcome() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #666;">
                <h2 style="color: #2c5282;">📊 财务分析系统</h2>
                <p>请从左侧选择公司，从目录选择指标开始分析</p>
                <div style="margin-top: 30px; color: #999;">
                    <p><small>支持维度7的19个财务指标分析</small></p>
                    <p><small>包含图表可视化和数据洞察</small></p>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示公司信息
     */
    showCompanyInfo() {
        if (!this.container || !this.company) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #2c5282; margin-top: 0;">🏢 ${this.company.name}</h2>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
                    <p><strong>股票代码:</strong> ${this.company.ts_code}</p>
                    <p><strong>行业:</strong> ${this.company.industry || '未指定'}</p>
                    <p><strong>上市日期:</strong> ${this.company.list_date || '未知'}</p>
                    ${this.company.market_cap_rank ? `<p><strong>市值排名:</strong> ${this.company.market_cap_rank}</p>` : ''}
                    
                    ${this.company.summary ? `
                    <div style="background: #ffffff; padding: 12px; border-radius: 6px; border-left: 4px solid #eff1f3; margin: 10px 0;">
                        <p style="margin: 0; color: #ce2609; font-weight: 600;">📋 公司总结分析</p>
                        <p style="margin: 8px 0 0 0; color: #333; line-height: 1.4;">${this.company.summary}</p>
                    </div>
                    ` : ''}
                    
                    <p style="margin-top: 20px; color: #666;">请从目录选择要分析的指标</p>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示指标信息（实际是指标组信息）
     */
    showIndicatorInfo() {
        if (!this.container || !this.indicatorGroup) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px;">
                <h2 style="color: #2c5282; margin-top: 0;">📈 ${this.indicatorGroup.name || this.indicatorGroup.code}</h2>
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px;">
                    <p><strong>指标组代码:</strong> ${this.indicatorGroup.code}</p>
                    <p><strong>维度:</strong> ${this.indicatorGroup.dimension || '7'}</p>
                    <p><strong>类别:</strong> ${this.indicatorGroup.category || '未分类'}</p>
                    <p><strong>状态:</strong> ${this.indicatorGroup.status || '可计算'}</p>
                    <p><strong>数据源:</strong> ${this.indicatorGroup.data_source || 'tushare财务数据'}</p>
                    <p>${this.indicatorGroup.description || '该指标组包含多个具体财务指标'}</p>
                    <p><strong>包含指标:</strong> 通常包含2-3个具体财务指标</p>
                    <p style="margin-top: 20px; color: #666;">请从搜索框选择要分析的公司</p>
                </div>
            </div>
        `;
    }
    
    /**
     * 显示完整内容（公司+指标）
     */
    async showFullContent() {
        if (!this.container || !this.company || !this.indicator) return;
        
        // 显示加载中
        this.showLoading();
        
        try {
            // 导入图表模块和分析模块
            const [chartModule, analysisModule] = await Promise.all([
                import('./content-charts.js'),
                import('./content-analysis.js')
            ]);
            
            // 并行调用：图表数据 + AI分析 + 指标interpretation
            const [chartData, analysisData, indicatorData] = await Promise.all([
                chartModule.fetchChartData(this.company, this.indicator),
                analysisModule.fetchAIAnalysis(this.company),
                analysisModule.fetchIndicatorInterpretation(this.indicator)
            ]);
            
            // 显示真实数据（使用interpretation框架）
            this.showRealContent(chartData, analysisData, indicatorData);
            
        } catch (error) {
            console.error('加载失败:', error);
            this.showError(error);
        }
    }
    
    /**
     * 显示指标组内容（公司+指标组）
     */
    async showGroupContent() {
        if (!this.container || !this.company || !this.indicatorGroup) return;
        
        // 显示加载中
        this.showLoading();
        
        try {
            // 导入图表模块
            const chartModule = await import('./content-charts.js');
            
            // 获取指标组数据
            const groupData = await chartModule.fetchGroupData(this.company, this.indicatorGroup);
            
            // 显示指标组内容
            this.showGroupRealContent(groupData);
            
        } catch (error) {
            console.error('加载失败:', error);
            this.showError(error);
        }
    }
    
    /**
     * 显示加载中状态
     */
    showLoading() {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 40px; text-align: center;">
                <h3 style="color: #2c5282;">加载中...</h3>
                <p>正在获取${this.company?.name || '公司'}的${this.indicatorGroup?.code || '指标组'}数据</p>
                <div style="margin: 30px auto; width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #2c5282; border-radius: 50%; animation: spin 1s linear infinite;"></div>
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
     * 显示错误信息
     */
    showError(error) {
        if (!this.container) return;
        
        this.container.innerHTML = `
            <div style="padding: 20px; color: #e74c3c;">
                <h3>错误</h3>
                <p>${error.message}</p>
            </div>
        `;
    }
    
    /**
     * 显示指标组真实内容
     */
    showGroupRealContent(groupData) {
        if (!this.container) return;
        
        // 导入工具模块进行数据处理
        import('./content-charts.js').then(chartModule => {
            // 渲染指标组图表
            chartModule.renderGroupCharts('content-area', groupData, this.company);
            
        }).catch(error => {
            console.error('图表模块加载失败:', error);
            this.showError(error);
        });
    }
    
    /**
     * 获取DeepSeek AI分析结果
     */
    async fetchDeepSeekAnalysis(companyCode, indicatorCode) {
        try {
            // 构建文件路径
            const fileCode = indicatorCode.replace('.', '_');
            const filePath = `data/deepseek_analysis/${companyCode}/${companyCode}_${fileCode}_analysis.json`;
            
            console.log('获取DeepSeek分析结果:', filePath);
            
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
     * 生成AI分析结果卡片HTML
     */
    generateAIAnalysisCard(analysisData) {
        if (!analysisData) {
            return `
                <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                    <h3 style="color: #2c5282; margin-top: 0; display: flex; align-items: center; gap: 10px;">
                        <span style="background: #2c5282; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">AI</span>
                        AI分析结果
                    </h3>
                    <p style="color: #666; font-style: italic;">该指标的AI分析结果暂未生成</p>
                </div>
            `;
        }
        
        const { direct_analysis, indirect_analysis, conclusion, risk_analysis } = analysisData;
        
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
                    AI分析结果
                </h3>
                
                <!-- 直接分析 -->
                ${generateAnalysisCard('直接分析', direct_analysis, '#4CAF50', '✓', 'direct')}
                
                <!-- 间接分析 -->
                ${generateAnalysisCard('间接分析（行业结合）', indirect_analysis, '#2196F3', '↗', 'indirect')}
                
                <!-- 分析结论 -->
                ${generateAnalysisCard('分析结论', conclusion, '#FF9800', '★', 'conclusion')}
                
                <!-- 新增：风险提示（紫色卡片） -->
                ${generateAnalysisCard('风险提示', risk_analysis, '#9C27B0', '⚠', 'risk')}
                
                <!-- 数据来源 -->
                <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #bee3f8; font-size: 12px; color: #666;">
                    <p style="margin: 0;">📊 基于2014-2024年时间序列数据 | 🤖 DeepSeek AI分析 | 📅 ${analysisData.analysis_date || new Date().toLocaleDateString()}</p>
                </div>
                
                <!-- 收起展开功能脚本 -->
                <script>
                    (function() {
                        // 为所有收起展开按钮添加事件监听
                        document.querySelectorAll('.toggle-btn').forEach(button => {
                            button.addEventListener('click', function() {
                                const cardId = this.getAttribute('data-card');
                                const fullContent = document.getElementById('full-' + cardId);
                                const summary = this.closest('.analysis-card').querySelector('.summary');
                                
                                if (fullContent.style.display === 'none') {
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
                            const originalColor = window.getComputedStyle(button).backgroundColor;
                            button.setAttribute('data-original-color', originalColor);
                        });
                    })();
                </script>
                
                <style>
                    .analysis-card {
                        transition: all 0.3s ease;
                    }
                    
                    .analysis-card:hover {
                        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                        transform: translateY(-2px);
                    }
                    
                    .toggle-btn:hover {
                        opacity: 0.9;
                    }
                    
                    .full-content {
                        animation: fadeIn 0.3s ease;
                    }
                    
                    @keyframes fadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                </style>
            </div>
        `;
    }
    
    /**
     * 显示真实内容
     */
    async showRealContent(chartData, analysisData, indicatorData) {
        if (!this.container) return;
        
        // 存储图表数据，用于后续图表生成
        this.chartData = chartData;
        
        // 获取DeepSeek AI分析结果
        const deepSeekAnalysis = await this.fetchDeepSeekAnalysis(this.company.ts_code, this.indicator.code);
        
        // 导入工具模块进行数据处理
        import('./content-utils.js').then(utilsModule => {
            // 处理图表数据
            const chartInfo = utilsModule.formatChartData(chartData);
            const analysisInfo = utilsModule.formatAnalysisData(analysisData, indicatorData, this.indicator);
            
            // 生成AI分析卡片
            const aiAnalysisCard = this.generateAIAnalysisCard(deepSeekAnalysis);
            
            this.container.innerHTML = `
                <div style="padding: 20px;">
                    <h2 style="color: #2c5282; margin-top: 0;">${this.company.name} - ${this.indicator.name}</h2>
                    
                    <!-- AI分析结果卡片 -->
                    ${aiAnalysisCard}
                    
                    <!-- 图表区域 -->
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8;">
                        <h3 style="color: #2c5282; margin-top: 0;">📊 ECharts可视化图表</h3>
                        <p><strong>公司:</strong> ${this.company.name} (${this.company.ts_code})</p>
                        <p><strong>指标:</strong> ${this.indicator.code} - ${this.indicator.name}</p>
                        ${chartInfo.html}
                    </div>
                    
                    <!-- AI分析区域（已移除AI智能分析标题） -->
                    <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bee3f8;">
                        ${analysisInfo.html}
                    </div>
                    
                    <!-- 原始数据区域 -->
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-top: 20px; font-size: 14px;">
                        <h4 style="color: #666; margin-top: 0;">📋 数据信息</h4>
                        <p><strong>数据状态:</strong> ${chartData.real_data ? '✅ 真实财务数据' : '⚠️ 模拟数据'}</p>
                        <p><strong>更新时间:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>分析框架:</strong> 基于JSON定义的指标分析框架</p>
                    </div>
                </div>
            `;
            
            // 渲染图表
            if (chartInfo.renderChart) {
                chartInfo.renderChart();
            }
        }).catch(error => {
            console.error('工具模块加载失败:', error);
            this.showError(error);
        });
    }
}

// 导出实例
const contentModule = new SimpleContent();
export default contentModule;