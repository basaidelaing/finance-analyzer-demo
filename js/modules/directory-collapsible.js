// 可收起展开的目录模块
// 文件大小: <8KB

class CollapsibleDirectory {
    constructor() {
        this.indicators = [];
        this.selectedIndicator = null;
        this.expandedState = {
            'dimension7': true,  // 维度7默认展开
            'profitability': true, // 盈利能力子类默认展开
            'growth': false,
            'efficiency': false,
            'stability': false,
            'valuation': false
        };
    }

    async init() {
        console.log('目录模块初始化...');
        
        // 加载指标列表
        await this.loadIndicators();
        
        // 绑定事件
        this.bindEvents();
        
        console.log('目录模块初始化完成');
    }
    
    async loadIndicators() {
        console.log('加载指标列表...');
        
        try {
            const response = await fetch('/api/indicators');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.indicators = data.indicators || data.service_status?.services || this.getSampleIndicators();
            console.log(`加载了 ${this.indicators.length} 个指标`);
            
        } catch (error) {
            console.error('加载指标列表失败:', error);
            this.indicators = this.getSampleIndicators();
            console.log('使用示例指标数据');
        }
    }
    
    getSampleIndicators() {
        // 维度7的19个指标示例
        return [
            // 盈利能力 (7.1x)
            { code: '7.11', name: '销售净利率', dimension: 'dimension7', category: 'profitability', level: 2 },
            { code: '7.12', name: '销售毛利率', dimension: 'dimension7', category: 'profitability', level: 2 },
            { code: '7.13', name: '净资产收益率', dimension: 'dimension7', category: 'profitability', level: 2 },
            { code: '7.14', name: '总资产报酬率', dimension: 'dimension7', category: 'profitability', level: 2 },
            
            // 成长能力 (7.2x)
            { code: '7.21', name: '营业收入增长率', dimension: 'dimension7', category: 'growth', level: 2 },
            { code: '7.22', name: '净利润增长率', dimension: 'dimension7', category: 'growth', level: 2 },
            { code: '7.23', name: '总资产增长率', dimension: 'dimension7', category: 'growth', level: 2 },
            { code: '7.24', name: '净资产增长率', dimension: 'dimension7', category: 'growth', level: 2 },
            { code: '7.25', name: '每股收益增长率', dimension: 'dimension7', category: 'growth', level: 2 },
            
            // 运营效率 (7.3x)
            { code: '7.31', name: '总资产周转率', dimension: 'dimension7', category: 'efficiency', level: 2 },
            { code: '7.32', name: '存货周转率', dimension: 'dimension7', category: 'efficiency', level: 2 },
            { code: '7.33', name: '应收账款周转率', dimension: 'dimension7', category: 'efficiency', level: 2 },
            
            // 财务稳健 (7.4x)
            { code: '7.41', name: '资产负债率', dimension: 'dimension7', category: 'stability', level: 2 },
            { code: '7.42', name: '流动比率', dimension: 'dimension7', category: 'stability', level: 2 },
            { code: '7.43', name: '速动比率', dimension: 'dimension7', category: 'stability', level: 2 },
            { code: '7.44', name: '利息保障倍数', dimension: 'dimension7', category: 'stability', level: 2 },
            
            // 估值水平 (7.5x)
            { code: '7.51', name: '市盈率', dimension: 'dimension7', category: 'valuation', level: 2 },
            { code: '7.52', name: '市净率', dimension: 'dimension7', category: 'valuation', level: 2 },
            { code: '7.53', name: '市销率', dimension: 'dimension7', category: 'valuation', level: 2 }
        ];
    }
    
    render() {
        return `
            <div class="module-header">
                <span>📊 财务指标目录（可收起展开）</span>
            </div>
            <div class="module-content">
                <div class="directory-tree" id="directoryTree">
                    ${this.renderDimension7()}
                </div>
            </div>
        `;
    }
    
    renderDimension7() {
        return `
            <div class="dimension-section">
                <!-- 一级目录：维度7 -->
                <div class="dimension-header" data-dimension="dimension7" style="
                    padding: 12px 15px;
                    background: #2c5282;
                    color: white;
                    border-radius: 6px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span style="font-weight: bold;">📈 维度7：盈利能力分析（19个指标）</span>
                    <span class="toggle-icon">${this.expandedState.dimension7 ? '▼' : '▶'}</span>
                </div>
                
                <!-- 二级目录（当维度7展开时显示） -->
                <div class="dimension-content" data-dimension="dimension7" style="
                    display: ${this.expandedState.dimension7 ? 'block' : 'none'};
                    padding-left: 20px;
                ">
                    ${this.renderCategory('profitability', '💰 盈利能力指标（5个）')}
                    ${this.renderCategory('growth', '📈 成长能力指标（5个）')}
                    ${this.renderCategory('efficiency', '⚡ 运营效率指标（3个）')}
                    ${this.renderCategory('stability', '🛡️ 财务稳健指标（4个）')}
                    ${this.renderCategory('valuation', '📊 估值水平指标（3个）')}
                </div>
            </div>
        `;
    }
    
    renderCategory(categoryKey, categoryName) {
        const isExpanded = this.expandedState[categoryKey] || false;
        const categoryIndicators = this.indicators.filter(i => i.category === categoryKey);
        
        return `
            <div class="category-section">
                <!-- 二级目录头 -->
                <div class="category-header" data-category="${categoryKey}" style="
                    padding: 10px 15px;
                    background: #4a90e2;
                    color: white;
                    border-radius: 5px;
                    margin: 8px 0;
                    cursor: pointer;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span>${categoryName}</span>
                    <span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>
                </div>
                
                <!-- 三级目录：指标列表（当类别展开时显示） -->
                <div class="category-content" data-category="${categoryKey}" style="
                    display: ${isExpanded ? 'block' : 'none'};
                    padding-left: 25px;
                ">
                    ${categoryIndicators.map(indicator => this.renderIndicator(indicator)).join('')}
                </div>
            </div>
        `;
    }
    
    renderIndicator(indicator) {
        const isSelected = this.selectedIndicator === indicator.code;
        
        return `
            <div class="indicator-item" data-code="${indicator.code}" style="
                padding: 8px 12px;
                margin: 5px 0;
                background: ${isSelected ? '#e6f7ff' : 'white'};
                border: 1px solid ${isSelected ? '#1890ff' : '#e0e0e0'};
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s;
            ">
                <div style="display: flex; align-items: center;">
                    <span style="
                        display: inline-block;
                        width: 24px;
                        height: 24px;
                        line-height: 24px;
                        text-align: center;
                        background: ${isSelected ? '#1890ff' : '#f0f0f0'};
                        color: ${isSelected ? 'white' : '#666'};
                        border-radius: 4px;
                        margin-right: 10px;
                        font-size: 12px;
                    ">${indicator.code}</span>
                    <span style="flex: 1;">${indicator.name}</span>
                    ${isSelected ? '<span style="color: #1890ff;">✓</span>' : ''}
                </div>
            </div>
        `;
    }
    
    bindEvents() {
        // 延迟绑定，确保DOM已渲染
        setTimeout(() => {
            this.bindToggleEvents();
            this.bindIndicatorEvents();
        }, 100);
    }
    
    bindToggleEvents() {
        // 维度切换
        const dimensionHeaders = document.querySelectorAll('.dimension-header');
        dimensionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const dimension = e.currentTarget.dataset.dimension;
                this.toggleDimension(dimension);
            });
        });
        
        // 类别切换
        const categoryHeaders = document.querySelectorAll('.category-header');
        categoryHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.toggleCategory(category);
            });
        });
    }
    
    bindIndicatorEvents() {
        const indicatorItems = document.querySelectorAll('.indicator-item');
        indicatorItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const indicatorCode = e.currentTarget.dataset.code;
                this.selectIndicator(indicatorCode);
            });
        });
    }
    
    toggleDimension(dimension) {
        this.expandedState[dimension] = !this.expandedState[dimension];
        this.updateToggleIcon(`[data-dimension="${dimension}"] .toggle-icon`, this.expandedState[dimension]);
        this.updateContentDisplay(`[data-dimension="${dimension}"]`, this.expandedState[dimension]);
    }
    
    toggleCategory(category) {
        this.expandedState[category] = !this.expandedState[category];
        this.updateToggleIcon(`[data-category="${category}"] .toggle-icon`, this.expandedState[category]);
        this.updateContentDisplay(`[data-category="${category}"]`, this.expandedState[category]);
    }
    
    updateToggleIcon(selector, isExpanded) {
        const icon = document.querySelector(selector);
        if (icon) {
            icon.textContent = isExpanded ? '▼' : '▶';
        }
    }
    
    updateContentDisplay(selector, isExpanded) {
        const content = document.querySelector(selector);
        if (content) {
            content.style.display = isExpanded ? 'block' : 'none';
        }
    }
    
    selectIndicator(indicatorCode) {
        // 更新选中状态
        this.selectedIndicator = indicatorCode;
        
        // 更新UI
        this.updateIndicatorSelection();
        
        // 查找指标详情
        const indicator = this.indicators.find(i => i.code === indicatorCode) || {
            code: indicatorCode,
            name: `指标 ${indicatorCode}`
        };
        
        // 触发指标选择事件
        this.dispatchIndicatorSelected(indicator);
        
        console.log(`选中指标: ${indicatorCode}`);
    }
    
    updateIndicatorSelection() {
        const indicatorItems = document.querySelectorAll('.indicator-item');
        indicatorItems.forEach(item => {
            const isSelected = item.dataset.code === this.selectedIndicator;
            item.style.background = isSelected ? '#e6f7ff' : 'white';
            item.style.borderColor = isSelected ? '#1890ff' : '#e0e0e0';
            
            // 更新选中标记
            const checkmark = item.querySelector('span:last-child');
            if (checkmark) {
                checkmark.textContent = isSelected ? '✓' : '';
                checkmark.style.color = isSelected ? '#1890ff' : 'transparent';
            }
        });
    }
    
    dispatchIndicatorSelected(indicator) {
        const event = new CustomEvent('indicatorSelected', {
            detail: { indicator }
        });
        document.dispatchEvent(event);
    }
}

// 创建实例并导出
const directoryModule = new CollapsibleDirectory();
export default directoryModule;