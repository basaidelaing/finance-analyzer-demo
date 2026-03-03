/**
 * UI核心模块 - 基础UI功能
 * 文件大小: <8KB
 */

class UICore {
    constructor() {
        this.companyList = [];
        this.indicatorList = [];
    }

    /**
     * 初始化UI
     */
    init() {
        console.log('初始化UI核心');
        
        // 设置初始公司信息
        this.updateCompanyInfo('贵州茅台', '600519.SH');
        
        // 设置初始图表标题
        this.updateChartTitle('核心利润与核心利润率趋势分析');
        
        // 显示初始选项卡
        this.switchTab('charts');
    }

    /**
     * 更新公司信息
     */
    updateCompanyInfo(companyName, tsCode) {
        const nameElement = document.getElementById('currentCompanyName');
        if (nameElement) {
            nameElement.textContent = `${companyName} (${tsCode})`;
        }
        
        // 更新其他公司信息
        const industryElement = document.getElementById('currentIndustry');
        if (industryElement) {
            industryElement.textContent = '白酒';
        }
        
        const updateElement = document.getElementById('lastUpdate');
        if (updateElement) {
            updateElement.textContent = new Date().toISOString().split('T')[0];
        }
    }

    /**
     * 更新图表标题
     */
    updateChartTitle(title) {
        const titleElement = document.getElementById('chartTitle');
        if (titleElement) {
            titleElement.textContent = title;
        }
    }

    /**
     * 获取指标名称
     */
    getIndicatorName(indicatorCode) {
        // 从指标列表中查找
        if (this.indicatorList && Array.isArray(this.indicatorList)) {
            const indicator = this.indicatorList.find(ind => ind.code === indicatorCode);
            if (indicator && indicator.name) {
                return indicator.name;
            }
        }
        
        // 备用硬编码
        const nameMap = {
            '7.11': '核心利润与核心利润率',
            '7.12': '利润结构健康度（三支柱分析）',
            '7.13': '资产结构性收益比率',
            '7.14': '经营资产"轻/重/虚"化指数',
            '7.21': '核心利润获现率',
            '7.22': '经营现金流结构安全性',
            '7.23': '核心利润与经营活动现金流关系系数',
            '7.24': '核心利润含金量持续性分析',
            '7.25': '价值创造与利润分配匹配度指数',
            '7.31': '造血与输血结构分析',
            '7.32': '利息负债与偿债能力',
            '7.33': '企业发展模式定位',
            '7.41': '营运资产周转率',
            '7.42': '存货高、低周转预警信号',
            '7.43': '应收账款坏账压力测试',
            '7.44': '盈利质量占优性',
            '7.51': '结构性净资产收益率',
            '7.52': '战略净利润',
            '7.53': '现金流肖像与企业生命周期判断'
        };
        
        return nameMap[indicatorCode] || `指标 ${indicatorCode}`;
    }
    
    /**
     * 检查指标是否可计算
     */
    isIndicatorAvailable(indicatorCode) {
        if (this.indicatorList && Array.isArray(this.indicatorList)) {
            const indicator = this.indicatorList.find(ind => ind.code === indicatorCode);
            return indicator ? (indicator.is_available === true) : false;
        }
        return false;
    }

    /**
     * 切换选项卡
     */
    switchTab(tabId) {
        // 更新选项卡活动状态
        document.querySelectorAll('.tab-item').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabId}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
        
        // 显示对应内容
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const activeContent = document.getElementById(`${tabId}Tab`);
        if (activeContent) {
            activeContent.classList.add('active');
        }
    }

    /**
     * 设置公司列表
     */
    setCompanyList(companies) {
        this.companyList = companies;
        console.log(`加载了 ${companies.length} 家公司`);
    }

    /**
     * 设置维度七指标列表
     */
    setDimension7Indicators(indicators) {
        this.indicatorList = indicators;
        console.log(`加载了 ${indicators.length} 个维度七指标`);
    }

    /**
     * 显示单图表
     */
    showSingleChart() {
        const mainChart = document.getElementById('mainChartContainer');
        const multiCharts = document.getElementById('multiChartsContainer');
        
        if (mainChart) mainChart.style.display = 'block';
        if (multiCharts) multiCharts.style.display = 'none';
    }

    /**
     * 显示多图表
     */
    showMultiCharts() {
        const mainChart = document.getElementById('mainChartContainer');
        const multiCharts = document.getElementById('multiChartsContainer');
        
        if (mainChart) mainChart.style.display = 'none';
        if (multiCharts) multiCharts.style.display = 'block';
    }

    /**
     * 显示加载状态
     */
    showLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'flex';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoading() {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
    }

    /**
     * 显示成功消息
     */
    showSuccess(message) {
        console.log('成功:', message);
        // 这里可以实现一个toast通知
    }

    /**
     * 显示错误消息
     */
    showError(title, message) {
        console.error(`错误 [${title}]:`, message);
        // 这里可以实现一个错误弹窗
        alert(`${title}: ${message}`);
    }

    /**
     * 下载报告
     */
    downloadReport(report) {
        console.log('下载报告:', report);
        alert('报告导出功能开发中...');
    }
}

export default UICore;