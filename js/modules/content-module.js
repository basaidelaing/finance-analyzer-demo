// 内容模块
// 文件大小: <5KB

class ContentModule {
    constructor() {
        this.currentTab = 'charts';
        this.currentCompany = null;
        this.currentIndicator = null;
        this.chartInstance = null;
    }

    async init() {
        console.log('内容模块初始化...');
        
        // 绑定事件
        this.bindEvents();
        
        // 监听公司选择
        document.addEventListener('companySelected', (e) => {
            this.handleCompanySelected(e.detail.company);
        });
        
        // 监听指标选择
        document.addEventListener('indicatorSelected', (e) => {
            this.handleIndicatorSelected(e.detail.indicator);
        });
        
        console.log('内容模块初始化完成');
    }
    
    render() {
        return `
            <div class="module-header">
                <span>📈 分析结果</span>
            </div>
            <div class="module-content">
                <div class="tab-navigation">
                    <button class="tab-btn ${this.currentTab === 'charts' ? 'active' : ''}" 
                            data-tab="charts">
                        📈 图表分析
                    </button>
                    <button class="tab-btn ${this.currentTab === 'analysis' ? 'active' : ''}" 
                            data-tab="analysis">
                        AI分析
                    </button>
                    <button class="tab-btn ${this.currentTab === 'data' ? 'active' : ''}" 
                            data-tab="data">
                        📊 原始数据
                    </button>
                </div>
                
                <div class="tab-content">
                    <div id="chartsTab" class="tab-pane ${this.currentTab === 'charts' ? 'active' : ''}">
                        <div class="chart-container" id="chartContainer">
                            <div class="placeholder">
                                <div class="placeholder-icon">📊</div>
                                <h3>选择公司和指标查看图表</h3>
                                <p>在左侧选择公司和指标后，图表将显示在这里</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="analysisTab" class="tab-pane ${this.currentTab === 'analysis' ? 'active' : ''}">
                        <div class="analysis-container" id="analysisContainer">
                            <div class="placeholder">
                                <div class="placeholder-icon">🤖</div>
                                <h3>AI分析结果</h3>
                                <p>选择公司和指标后，AI分析将显示在这里</p>
                            </div>
                        </div>
                    </div>
                    
                    <div id="dataTab" class="tab-pane ${this.currentTab === 'data' ? 'active' : ''}">
                        <div class="data-container" id="dataContainer">
                            <div class="placeholder">
                                <div class="placeholder-icon">📋</div>
                                <h3>原始数据</h3>
                                <p>选择公司和指标后，原始数据将显示在这里</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // 延迟绑定，等待DOM渲染
        setTimeout(() => {
            this.bindTabButtons();
        }, 100);
    }
    
    bindTabButtons() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchTab(button.dataset.tab);
            });
        });
    }
    
    switchTab(tabName) {
        this.currentTab = tabName;
        
        // 更新按钮状态
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset.tab === tabName) {
                button.classList.add('active');
            }
        });
        
        // 更新内容显示
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabName}Tab`) {
                pane.classList.add('active');
            }
        });
        
        // 如果已选择公司和指标，加载对应数据
        if (this.currentCompany && this.currentIndicator) {
            this.loadCurrentData();
        }
    }
    
    handleCompanySelected(company) {
        this.currentCompany = company;
        console.log(`内容模块收到公司选择: ${company.name}`);
        
        // 更新UI提示
        this.updatePlaceholder();
        
        // 如果已选择指标，加载数据
        if (this.currentIndicator) {
            this.loadCurrentData();
        }
    }
    
    handleIndicatorSelected(indicator) {
        this.currentIndicator = indicator;
        console.log(`内容模块收到指标选择: ${indicator.code}`);
        
        // 更新UI提示
        this.updatePlaceholder();
        
        // 如果已选择公司，加载数据
        if (this.currentCompany) {
            this.loadCurrentData();
        }
    }
    
    updatePlaceholder() {
        let message = '选择公司和指标查看分析结果';
        
        if (this.currentCompany && !this.currentIndicator) {
            message = `已选择公司: ${this.currentCompany.name}，请选择指标`;
        } else if (!this.currentCompany && this.currentIndicator) {
            message = `已选择指标: ${this.currentIndicator.name}，请选择公司`;
        } else if (this.currentCompany && this.currentIndicator) {
            message = `正在加载 ${this.currentCompany.name} 的 ${this.currentIndicator.name} 数据...`;
        }
        
        // 更新所有占位符
        const placeholders = document.querySelectorAll('.placeholder p');
        placeholders.forEach(p => {
            p.textContent = message;
        });
    }
    
    async loadCurrentData() {
        if (!this.currentCompany || !this.currentIndicator) {
            return;
        }
        
        console.log(`加载数据: ${this.currentCompany.ts_code} - ${this.currentIndicator.code}`);
        
        // 根据当前标签页加载数据
        switch (this.currentTab) {
            case 'charts':
                await this.loadChartData();
                break;
            case 'analysis':
                await this.loadAIAnalysis();
                break;
            case 'data':
                await this.loadRawData();
                break;
        }
    }
    
    async loadChartData() {
        try {
            const tsCode = this.currentCompany.ts_code;
            const indicatorCode = this.currentIndicator.code;
            
            const response = await fetch(`/api/chart/${tsCode}/${indicatorCode}?period=past_10_years`);
            
            if (response.ok) {
                const data = await response.json();
                this.renderChart(data);
            } else {
                this.showError('图表数据加载失败');
            }
        } catch (error) {
            console.error('加载图表数据失败:', error);
            this.showError('图表数据加载异常');
        }
    }
    
    async loadAIAnalysis() {
        try {
            const tsCode = this.currentCompany.ts_code;
            const response = await fetch(`/api/analysis/${tsCode}?period=past_10_years`);
            
            if (response.ok) {
                const data = await response.json();
                this.renderAIAnalysis(data);
            } else {
                this.showError('AI分析加载失败');
            }
        } catch (error) {
            console.error('加载AI分析失败:', error);
            this.showError('AI分析加载异常');
        }
    }
    
    async loadRawData() {
        try {
            const tsCode = this.currentCompany.ts_code;
            const indicatorCode = this.currentIndicator.code;
            
            const response = await fetch(`/api/db/indicator/${tsCode}/${indicatorCode}?period=past_10_years`);
            
            if (response.ok) {
                const data = await response.json();
                this.renderRawData(data);
            } else {
                this.showError('原始数据加载失败');
            }
        } catch (error) {
            console.error('加载原始数据失败:', error);
            this.showError('原始数据加载异常');
        }
    }
    
    renderChart(chartData) {
        const container = document.getElementById('chartContainer');
        if (!container) return;
        
        // 清除现有图表
        if (this.chartInstance) {
            this.chartInstance.dispose();
        }
        
        // 创建新的图表容器
        container.innerHTML = '<div id="mainChart" style="width: 100%; height: 400px;"></div>';
        
        // 初始化ECharts
        const chartDom = document.getElementById('mainChart');
        this.chartInstance = echarts.init(chartDom);
        
        // 简单图表配置
        const option = {
            title: {
                text: `${this.currentCompany.name} - ${this.currentIndicator.name}`,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis'
            },
            xAxis: {
                type: 'category',
                data: chartData.data?.periods || ['2020', '2021', '2022', '2023', '2024']
            },
            yAxis: {
                type: 'value'
            },
            series: [{
                data: chartData.data?.values || [120, 200, 150, 80, 70],
                type: 'line',
                smooth: true
            }]
        };
        
        this.chartInstance.setOption(option);
    }
    
    renderAIAnalysis(analysisData) {
        const container = document.getElementById('analysisContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="analysis-result">
                <h3>${this.currentCompany.name} - AI分析报告</h3>
                <div class="analysis-content">
                    <p>${analysisData.message || 'AI分析数据加载成功'}</p>
                    <div class="analysis-meta">
                        <span>数据来源: ${analysisData.source || '财务数据库'}</span>
                        <span>分析时间: ${new Date().toLocaleString()}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    renderRawData(rawData) {
        const container = document.getElementById('dataContainer');
        if (!container) return;
        
        const data = rawData.data || [];
        
        if (data.length === 0) {
            container.innerHTML = '<div class="no-data">暂无原始数据</div>';
            return;
        }
        
        let tableHTML = `
            <div class="data-table">
                <h3>${this.currentCompany.name} - ${this.currentIndicator.name}</h3>
                <table>
                    <thead>
                        <tr>
                            <th>日期</th>
                            <th>值</th>
                            <th>单位</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        data.forEach(item => {
            tableHTML += `
                <tr>
                    <td>${item.period || 'N/A'}</td>
                    <td>${item.value !== undefined ? item.value.toFixed(2) : 'N/A'}</td>
                    <td>${item.unit || ''}</td>
                </tr>
            `;
        });
        
        tableHTML += `
                    </tbody>
                </table>
                <div class="data-summary">
                    共 ${data.length} 条记录
                </div>
            </div>
        `;
        
        container.innerHTML = tableHTML;
    }
    
    showError(message) {
        // 在所有标签页显示错误
        const containers = [
            'chartContainer',
            'analysisContainer', 
            'dataContainer'
        ];
        
        containers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = `
                    <div class="error-message">
                        <div class="error-icon">⚠️</div>
                        <h4>数据加载失败</h4>
                        <p>${message}</p>
                        <button onclick="location.reload()">刷新页面</button>
                    </div>
                `;
            }
        });
    }
}

// 创建实例并导出
const contentModule = new ContentModule();
export default contentModule;