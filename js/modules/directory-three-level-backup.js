// 三级目录模块
// 文件大小: <8KB

class ThreeLevelDirectory {
    constructor() {
        this.indicators = [];
        this.selectedIndicator = null;
        this.expandedState = {
            'dimension7': true,  // 一级：维度7默认展开
            'profitability': true, // 二级：盈利能力默认展开
            'growth': false,
            'efficiency': false,
            'stability': false,
            'valuation': false
        };
        this.dataLoaded = false; // 数据加载状态标记
    }

    async init() {
        console.log('三级目录模块初始化...');
        
        // 加载指标列表
        await this.loadIndicators();
        
        // 数据加载完成后重新渲染
        this.rerender();
        
        console.log('三级目录模块初始化完成');
    }
    
    rerender() {
        console.log('重新渲染目录（数据已加载）...');
        const container = document.getElementById('directoryContainer');
        if (container) {
            container.innerHTML = this.render();
            console.log('目录重新渲染完成');
            
            // 重新绑定事件（因为DOM已更新）
            this.bindEvents();
        }
    }
    
    async loadIndicators() {
        console.log('加载指标列表...');
        
        try {
            const response = await fetch('/api/indicators');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            let apiIndicators = data.indicators || [];
            console.log(`从API加载了 ${apiIndicators.length} 个指标:`, apiIndicators);
            
            // 检查API返回的指标name字段
            console.log('检查API指标name字段:');
            apiIndicators.forEach((indicator, index) => {
                console.log(`  ${index}: ${indicator.code} - name="${indicator.name || '空'}"`);
            });
            
            // 确保所有指标都有category字段
            this.indicators = this.enrichIndicatorsWithCategory(apiIndicators);
            
            // 如果API返回的指标数量不足，补充完整数据
            if (this.indicators.length < 19) {
                console.log(`API返回${this.indicators.length}个指标，补充完整数据到19个`);
                this.indicators = this.completeIndicators(this.indicators);
            }
            
            console.log(`现在有 ${this.indicators.length} 个指标（已添加category）:`, this.indicators);
            
            // 检查最终指标name字段
            console.log('检查最终指标name字段:');
            this.indicators.forEach((indicator, index) => {
                console.log(`  ${index}: ${indicator.code} - "${indicator.name}" (category: ${indicator.category})`);
            });
            
            // 标记数据已加载
            this.dataLoaded = true;
            
        } catch (error) {
            console.error('加载指标列表失败:', error);
            this.indicators = this.getFullIndicators();
            console.log('使用完整指标数据');
            this.dataLoaded = true;
        }
    }
    
    enrichIndicatorsWithCategory(indicators) {
        console.log('为指标添加category字段，原始数据:', indicators);
        
        // 为API返回的指标添加category字段
        const enriched = indicators.map(indicator => {
            // 如果已经有category字段，直接返回
            if (indicator.category) {
                console.log(`指标 ${indicator.code} 已有category: ${indicator.category}`);
                return indicator;
            }
            
            // 根据指标代码推断category
            const code = indicator.code || '';
            let category = '';
            
            if (code.startsWith('7.1')) {
                category = 'profitability';
            } else if (code.startsWith('7.2')) {
                category = 'growth';
            } else if (code.startsWith('7.3')) {
                category = 'efficiency';
            } else if (code.startsWith('7.4')) {
                category = 'stability';
            } else if (code.startsWith('7.5')) {
                category = 'valuation';
            } else {
                category = 'other';
            }
            
            console.log(`指标 ${code} 推断category为: ${category}`);
            
            return {
                ...indicator,
                category: category
            };
        });
        
        console.log('添加category后的指标:', enriched);
        return enriched;
    }
    
    completeIndicators(existingIndicators) {
        console.log('补充指标数据...');
        
        // 获取完整的指标列表
        const fullIndicators = this.getFullIndicators();
        
        // 创建现有指标的code集合
        const existingCodes = new Set(existingIndicators.map(i => i.code));
        
        // 合并：优先使用现有指标，补充缺失的
        const merged = [...existingIndicators];
        
        for (const fullIndicator of fullIndicators) {
            if (!existingCodes.has(fullIndicator.code)) {
                console.log(`补充指标: ${fullIndicator.code}`);
                merged.push(fullIndicator);
            }
        }
        
        console.log(`合并后共有 ${merged.length} 个指标`);
        return merged;
    }
    
    getFullIndicators() {
        // 维度7的19个完整指标 - 根据JSON定义更新（从check_indicator_definitions.py结果）
        return [
            // 盈利能力 (7.1x) - 根据JSON定义
            { code: '7.11', name: '核心利润与核心利润率', dimension: '7', category: 'profitability' },
            { code: '7.12', name: '利润结构健康度（三支柱分析）', dimension: '7', category: 'profitability' },
            { code: '7.13', name: '资产结构性收益比率', dimension: '7', category: 'profitability' },
            { code: '7.14', name: '经营资产"轻/重/虚"化指数', dimension: '7', category: 'profitability' },
            
            // 成长能力 (7.2x) - 根据JSON定义
            { code: '7.21', name: '核心利润获现率', dimension: '7', category: 'growth' },
            { code: '7.22', name: '经营现金流结构安全性', dimension: '7', category: 'growth' },
            { code: '7.23', name: '核心利润的行业壁垒系数', dimension: '7', category: 'growth' },
            { code: '7.24', name: '"两个搅局"的侵蚀度与持续性分析', dimension: '7', category: 'growth' },
            { code: '7.25', name: '减值准备计提的激进/保守指数', dimension: '7', category: 'growth' },
            
            // 运营效率 (7.3x) - 根据JSON定义
            { code: '7.31', name: '造血与输血结构分析', dimension: '7', category: 'efficiency' },
            { code: '7.32', name: '有息负债与偿债保障', dimension: '7', category: 'efficiency' },
            { code: '7.33', name: '企业发展模式矩阵定位', dimension: '7', category: 'efficiency' },
            
            // 财务稳健 (7.4x) - 根据JSON定义
            { code: '7.41', name: '重构后经营资产周转率', dimension: '7', category: 'stability' },
            { code: '7.42', name: '"四高"风险预警信号', dimension: '7', category: 'stability' },
            { code: '7.43', name: '并购无形资产质量压力测试', dimension: '7', category: 'stability' },
            { code: '7.44', name: '盈余管理空间诊断', dimension: '7', category: 'stability' },
            
            // 估值水平 (7.5x) - 根据JSON定义
            { code: '7.51', name: '结构性净资产收益率', dimension: '7', category: 'valuation' },
            { code: '7.52', name: '财务战略矩阵定', dimension: '7', category: 'valuation' },
            { code: '7.53', name: '现金流肖像与生命周期判断', dimension: '7', category: 'valuation' }
        ];
    }
    
    render() {
        if (!this.dataLoaded) {
            // 数据未加载时显示加载状态
            return `
                <div class="module-header">
                    <span>📊 财务指标目录（三级结构）</span>
                </div>
                <div class="module-content" style="height: 500px; overflow-y: auto; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: #666;">
                        <div style="margin-bottom: 10px;">⏳ 加载指标数据...</div>
                        <div style="font-size: 12px;">正在从服务器获取指标列表</div>
                    </div>
                </div>
            `;
        }
        
        // 数据已加载，显示完整目录
        return `
            <div class="module-header">
                <span>📊 财务指标目录（三级结构）</span>
            </div>
            <div class="module-content" style="height: 500px; overflow-y: auto;">
                <div class="directory-tree" id="directoryTree">
                    ${this.renderThreeLevelTree()}
                </div>
            </div>
        `;
    }
    
    renderThreeLevelTree() {
        return `
            <div class="three-level-directory">
                <!-- 一级：维度7 -->
                <div class="level1-section">
                    <div class="level1-header" data-level="dimension7" style="
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
                    
                    <!-- 二级：类别（当一级展开时显示） -->
                    <div class="level1-content" data-level="dimension7" style="
                        display: ${this.expandedState.dimension7 ? 'block' : 'none'};
                        padding-left: 20px;
                    ">
                        ${this.renderCategories()}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCategories() {
        console.log('渲染二级目录，当前指标数据:', this.indicators);
        
        const categories = [
            { key: 'profitability', name: '💰 盈利能力指标', count: 5 },
            { key: 'growth', name: '📈 成长能力指标', count: 5 },
            { key: 'efficiency', name: '⚡ 运营效率指标', count: 3 },
            { key: 'stability', name: '🛡️ 财务稳健指标', count: 4 },
            { key: 'valuation', name: '📊 估值水平指标', count: 3 }
        ];
        
        let html = '';
        for (const category of categories) {
            const isExpanded = this.expandedState[category.key] || false;
            const categoryIndicators = this.indicators.filter(i => i.category === category.key);
            
            console.log(`分类 ${category.key} 有 ${categoryIndicators.length} 个指标:`, categoryIndicators);
            
            html += `
                <div class="level2-section" style="margin-bottom: 8px;">
                    <!-- 二级目录头 -->
                    <div class="level2-header" data-level="${category.key}" style="
                        padding: 10px 15px;
                        background: #4a90e2;
                        color: white;
                        border-radius: 5px;
                        cursor: pointer;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    ">
                        <span>${category.name}（${category.count}个）</span>
                        <span class="toggle-icon">${isExpanded ? '▼' : '▶'}</span>
                    </div>
                    
                    <!-- 三级：指标列表（当二级展开时显示） -->
                    <div class="level2-content" data-level="${category.key}" style="
                        display: ${isExpanded ? 'block' : 'none'};
                        padding-left: 25px;
                        padding-top: 8px;
                    ">
                        ${this.renderIndicators(categoryIndicators)}
                    </div>
                </div>
            `;
        }
        
        return html;
    }
    
    renderIndicators(indicators) {
        let html = '';
        for (const indicator of indicators) {
            const isSelected = this.selectedIndicator === indicator.code;
            
            // 确保指标名称不为空
            const indicatorName = indicator.name || this.getIndicatorName(indicator.code) || `指标 ${indicator.code}`;
            
            html += `
                <div class="level3-item" data-indicator="${indicator.code}" style="
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
                        <span class="indicator-name" style="flex: 1;" data-original-name="${indicatorName}">${indicatorName}</span>
                        ${isSelected ? '<span class="selection-checkmark" style="color: #1890ff;">✓</span>' : ''}
                    </div>
                </div>
            `;
        }
        
        return html;
    }
    
    bindEvents() {
        // 延迟绑定，确保DOM已渲染
        setTimeout(() => {
            this.bindToggleEvents();
            this.bindIndicatorEvents();
        }, 100);
    }
    
    bindToggleEvents() {
        // 一级目录切换
        const level1Headers = document.querySelectorAll('.level1-header');
        level1Headers.forEach(header => {
            header.addEventListener('click', (e) => {
                const level = e.currentTarget.dataset.level;
                this.toggleLevel(level);
            });
        });
        
        // 二级目录切换
        const level2Headers = document.querySelectorAll('.level2-header');
        level2Headers.forEach(header => {
            header.addEventListener('click', (e) => {
                const level = e.currentTarget.dataset.level;
                this.toggleLevel(level);
            });
        });
    }
    
    bindIndicatorEvents() {
        const indicatorItems = document.querySelectorAll('.level3-item');
        indicatorItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const indicatorCode = e.currentTarget.dataset.indicator;
                this.selectIndicator(indicatorCode);
            });
        });
    }
    
    toggleLevel(level) {
        this.expandedState[level] = !this.expandedState[level];
        
        // 修复选择器：针对不同的级别使用不同的选择器
        if (level === 'dimension7') {
            this.updateToggleIcon('.level1-header[data-level="dimension7"] .toggle-icon', this.expandedState[level]);
            this.updateContentDisplay('.level1-content[data-level="dimension7"]', this.expandedState[level]);
        } else {
            this.updateToggleIcon(`.level2-header[data-level="${level}"] .toggle-icon`, this.expandedState[level]);
            this.updateContentDisplay(`.level2-content[data-level="${level}"]`, this.expandedState[level]);
        }
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
        console.log(`选中指标: ${indicatorCode}，当前指标数据:`, this.indicators);
        
        // 更新选中状态
        this.selectedIndicator = indicatorCode;
        
        // 更新UI
        this.updateIndicatorSelection();
        
        // 查找指标详情
        const indicator = this.indicators.find(i => i.code === indicatorCode);
        console.log('找到的指标:', indicator);
        
        if (!indicator) {
            console.warn(`未找到指标 ${indicatorCode}，使用默认名称`);
            const defaultIndicator = {
                code: indicatorCode,
                name: this.getIndicatorName(indicatorCode)
            };
            console.log('使用默认指标:', defaultIndicator);
            this.dispatchIndicatorSelected(defaultIndicator);
        } else {
            // 触发指标选择事件
            this.dispatchIndicatorSelected(indicator);
        }
        
        console.log(`选中指标完成: ${indicatorCode}`);
    }
    
    updateIndicatorSelection() {
        console.log('更新指标选中状态，当前选中:', this.selectedIndicator);
        const indicatorItems = document.querySelectorAll('.level3-item');
        console.log(`找到 ${indicatorItems.length} 个指标项`);
        
        indicatorItems.forEach((item, index) => {
            const indicatorCode = item.dataset.indicator;
            const isSelected = indicatorCode === this.selectedIndicator;
            
            console.log(`指标 ${index}: ${indicatorCode}, 是否选中: ${isSelected}`);
            
            // 只更新样式，不修改文本内容
            item.style.background = isSelected ? '#e6f7ff' : 'white';
            item.style.borderColor = isSelected ? '#1890ff' : '#e0e0e0';
            
            // 更新选中标记
            const checkmark = item.querySelector('.selection-checkmark');
            if (checkmark) {
                checkmark.textContent = isSelected ? '✓' : '';
                checkmark.style.color = isSelected ? '#1890ff' : 'transparent';
                console.log(`  选中标记: ${checkmark.textContent}`);
            } else if (isSelected) {
                // 如果应该显示选中标记但没有找到，创建一个
                console.log(`  创建新的选中标记`);
                const newCheckmark = document.createElement('span');
                newCheckmark.className = 'selection-checkmark';
                newCheckmark.style.cssText = 'color: #1890ff;';
                newCheckmark.textContent = '✓';
                item.querySelector('div').appendChild(newCheckmark);
            }
            
            // 调试：检查指标名称是否还在
            // 使用class选择器准确找到指标名称
            const nameSpan = item.querySelector('.indicator-name');
            if (nameSpan) {
                console.log(`  指标名称: "${nameSpan.textContent}"`);
                
                // 保护机制：如果名称为空，从data属性恢复
                if (!nameSpan.textContent || nameSpan.textContent.trim() === '') {
                    const originalName = nameSpan.dataset.originalName;
                    if (originalName) {
                        console.warn(`  指标名称为空，从data-original-name恢复: "${originalName}"`);
                        nameSpan.textContent = originalName;
                    } else {
                        // 如果没有data属性，使用指标代码作为名称
                        const indicatorCode = item.dataset.indicator;
                        const fallbackName = this.getIndicatorName(indicatorCode) || `指标 ${indicatorCode}`;
                        console.warn(`  指标名称为空，使用回退名称: "${fallbackName}"`);
                        nameSpan.textContent = fallbackName;
                    }
                }
            } else {
                console.warn(`  未找到指标名称元素！`);
            }
        });
    }
    
    getIndicatorName(code) {
        const nameMap = {
            '7.11': '销售净利率',
            '7.12': '销售毛利率', 
            '7.13': '净资产收益率',
            '7.14': '总资产报酬率',
            '7.21': '营业收入增长率',
            '7.22': '净利润增长率',
            '7.23': '总资产增长率',
            '7.24': '净资产增长率',
            '7.25': '每股收益增长率',
            '7.31': '总资产周转率',
            '7.32': '存货周转率',
            '7.33': '应收账款周转率',
            '7.41': '资产负债率',
            '7.42': '流动比率',
            '7.43': '速动比率',
            '7.44': '利息保障倍数',
            '7.51': '市盈率',
            '7.52': '市净率',
            '7.53': '市销率'
        };
        return nameMap[code] || `指标 ${code}`;
    }
    
    dispatchIndicatorSelected(indicator) {
        const event = new CustomEvent('indicatorSelected', {
            detail: { indicator }
        });
        document.dispatchEvent(event);
    }
}

// 创建实例并导出
const directoryModule = new ThreeLevelDirectory();
export default directoryModule;