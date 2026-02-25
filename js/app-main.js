/**
 * 主应用文件 - 整合所有UI模块
 * 文件大小: <8KB
 */

// 导入模块
import UICore from './modules/ui-core.js';
import UIDirectory from './modules/ui-directory.js';
import UIAIDisplay from './modules/ui-ai-display.js';
import UIRawData from './modules/ui-raw-data.js';

class FinancialAnalyzerApp {
    constructor() {
        // 初始化模块
        this.uiCore = new UICore();
        this.uiDirectory = new UIDirectory();
        this.uiAIDisplay = new UIAIDisplay();
        this.uiRawData = new UIRawData();
        
        // 应用状态
        this.currentCompany = {
            ts_code: '600519.SH',
            name: '贵州茅台'
        };
        this.currentIndicator = '7.11';
        this.currentPeriod = 'past_10_years';
    }

    /**
     * 初始化应用
     */
    async init() {
        console.log('初始化财务分析应用');
        
        try {
            // 初始化UI
            this.uiCore.init();
            this.uiDirectory.initSearch();
            
            // 加载公司列表
            await this.loadCompanyList();
            
            // 加载维度七指标列表
            await this.loadDimension7Indicators();
            
            // 加载初始数据
            await this.loadInitialData();
            
            console.log('应用初始化完成');
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.uiCore.showError('初始化失败', error.message);
        }
    }

    /**
     * 加载公司列表
     */
    async loadCompanyList() {
        try {
            const response = await fetch('/api/companies');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const companies = await response.json();
            this.uiCore.setCompanyList(companies);
        } catch (error) {
            console.warn('加载公司列表失败:', error);
            // 使用默认公司列表
            const defaultCompanies = [
                { ts_code: '600519.SH', name: '贵州茅台', industry: '白酒' },
                { ts_code: '000858.SZ', name: '五粮液', industry: '白酒' },
                { ts_code: '002304.SZ', name: '洋河股份', industry: '白酒' }
            ];
            this.uiCore.setCompanyList(defaultCompanies);
        }
    }

    /**
     * 加载维度七指标列表
     */
    async loadDimension7Indicators() {
        try {
            const response = await fetch('/api/indicators/dimension7');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const indicators = await response.json();
            this.uiCore.setDimension7Indicators(indicators);
        } catch (error) {
            console.warn('加载维度七指标失败:', error);
            // 使用默认指标列表
            const defaultIndicators = [
                { code: '7.11', name: '核心利润与核心利润率', is_available: true },
                { code: '7.12', name: '利润结构健康度（三支柱分析）', is_available: true },
                { code: '7.13', name: '资产结构性收益比率', is_available: true },
                { code: '7.14', name: '经营资产"轻/重/虚"化指数', is_available: true },
                { code: '7.21', name: '核心利润获现率', is_available: true }
            ];
            this.uiCore.setDimension7Indicators(defaultIndicators);
        }
    }

    /**
     * 加载初始数据
     */
    async loadInitialData() {
        // 显示加载状态
        this.uiCore.showLoading();
        
        try {
            // 加载图表数据
            await this.loadChartData();
            
            // 加载AI分析数据
            await this.loadAIAnalysis();
            
            // 加载原始数据
            await this.loadRawData();
            
        } catch (error) {
            console.error('加载初始数据失败:', error);
            this.uiCore.showError('数据加载失败', error.message);
        } finally {
            // 隐藏加载状态
            this.uiCore.hideLoading();
        }
    }

    /**
     * 选择公司
     */
    async selectCompany(tsCode, companyName) {
        console.log(`选择公司: ${companyName} (${tsCode})`);
        
        this.currentCompany = { ts_code: tsCode, name: companyName };
        this.uiCore.updateCompanyInfo(companyName, tsCode);
        
        // 重新加载数据
        await this.reloadData();
    }

    /**
     * 选择指标
     */
    async selectIndicator(indicatorCode) {
        console.log(`选择指标: ${indicatorCode}`);
        
        this.currentIndicator = indicatorCode;
        
        // 更新当前指标显示
        const indicatorName = this.uiCore.getIndicatorName(indicatorCode);
        document.getElementById('currentIndicator').textContent = 
            `${indicatorCode} ${indicatorName}`;
        
        // 重新加载数据
        await this.reloadData();
    }

    /**
     * 搜索公司
     */
    searchCompanies(query) {
        if (!this.uiCore.companyList || this.uiCore.companyList.length === 0) {
            this.uiDirectory.showSearchSuggestions([]);
            return;
        }
        
        const lowerQuery = query.toLowerCase();
        const suggestions = this.uiCore.companyList.filter(company => 
            company.name.toLowerCase().includes(lowerQuery) ||
            company.ts_code.toLowerCase().includes(lowerQuery)
        ).slice(0, 10); // 最多显示10个建议
        
        this.uiDirectory.showSearchSuggestions(suggestions);
    }

    /**
     * 加载图表数据
     */
    async loadChartData() {
        try {
            const url = `/api/chart/${this.currentCompany.ts_code}/${this.currentIndicator}?period=${this.currentPeriod}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const chartData = await response.json();
            
            // 检查是否是真实数据
            if (chartData.success && chartData.real_data) {
                // 根据图表类型显示
                if (chartData.chart_type === 'multi') {
                    this.uiCore.showMultiCharts();
                    // 这里需要调用图表渲染模块
                    if (window.chartManager) {
                        window.chartManager.renderMultiCharts(chartData.data);
                    }
                } else {
                    this.uiCore.showSingleChart();
                    // 这里需要调用图表渲染模块
                    if (window.chartManager) {
                        window.chartManager.renderSingleChart(chartData.data);
                    }
                }
            } else {
                // 没有真实数据
                console.warn('没有真实图表数据');
            }
            
        } catch (error) {
            console.error('加载图表数据失败:', error);
            // 显示错误或占位符
        }
    }

    /**
     * 加载AI分析数据
     */
    async loadAIAnalysis() {
        try {
            const url = `/api/analysis/${this.currentCompany.ts_code}?period=${this.currentPeriod}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const analysisData = await response.json();
            
            if (analysisData.found) {
                this.uiAIDisplay.updateAIAnalysis(analysisData);
            } else {
                this.uiAIDisplay.showNoAIAnalysis();
            }
            
        } catch (error) {
            console.error('加载AI分析失败:', error);
            this.uiAIDisplay.showAIAnalysisError(error.message);
        }
    }

    /**
     * 加载原始数据
     */
    async loadRawData() {
        try {
            const url = `/api/db/indicator/${this.currentCompany.ts_code}/${this.currentIndicator}?period=${this.currentPeriod}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const rawData = await response.json();
            this.uiRawData.showRawData(rawData);
            
        } catch (error) {
            console.error('加载原始数据失败:', error);
            this.uiRawData.showRawDataError(error.message);
        }
    }

    /**
     * 重新加载所有数据
     */
    async reloadData() {
        this.uiCore.showLoading();
        
        try {
            await Promise.all([
                this.loadChartData(),
                this.loadAIAnalysis(),
                this.loadRawData()
            ]);
        } catch (error) {
            console.error('重新加载数据失败:', error);
            this.uiCore.showError('数据加载失败', error.message);
        } finally {
            this.uiCore.hideLoading();
        }
    }

    /**
     * 刷新数据
     */
    async refreshData() {
        console.log('刷新数据');
        await this.reloadData();
        this.uiCore.showSuccess('数据刷新成功');
    }

    /**
     * 导出报告
     */
    exportReport() {
        const report = {
            company: this.currentCompany,
            indicator: this.currentIndicator,
            period: this.currentPeriod,
            timestamp: new Date().toISOString()
        };
        this.uiCore.downloadReport(report);
    }
}

// 创建并初始化应用
const app = new FinancialAnalyzerApp();

// 将应用暴露给全局作用域
window.app = app;

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app.init();
});

// 导出应用实例
export default app;