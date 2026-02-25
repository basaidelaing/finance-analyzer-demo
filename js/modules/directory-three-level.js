// 三级目录模块 - 修复版
// 文件大小: <8KB
// 修复分类映射问题，使用静态指标数据

import { getAllIndicators, mapApiIndicators } from '../data/static-indicators.js';

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
        console.log('加载指标列表（使用静态数据）...');
        
        try {
            // 尝试从API获取指标数据（用于验证）
            const response = await fetch('http://localhost:8001/api/indicators');
            if (response.ok) {
                const data = await response.json();
                const apiIndicators = data.indicators || [];
                console.log(`API返回了 ${apiIndicators.length} 个指标`);
                
                // 映射API指标到前端格式
                this.indicators = mapApiIndicators(apiIndicators);
            } else {
                console.log('API请求失败，使用静态指标数据');
                this.indicators = getAllIndicators();
            }
            
            // 确保我们有所有16个指标
            if (this.indicators.length < 16) {
                console.log(`当前只有 ${this.indicators.length} 个指标，补充完整数据`);
                const staticIndicators = getAllIndicators();
                const existingCodes = new Set(this.indicators.map(i => i.code));
                
                // 补充缺失的指标
                for (const staticIndicator of staticIndicators) {
                    if (!existingCodes.has(staticIndicator.code)) {
                        console.log(`补充指标: ${staticIndicator.code}`);
                        this.indicators.push(staticIndicator);
                    }
                }
            }
            
            console.log(`最终有 ${this.indicators.length} 个指标:`, this.indicators);
            
            // 检查分类分布
            const categoryCounts = {};
            this.indicators.forEach(ind => {
                categoryCounts[ind.category] = (categoryCounts[ind.category] || 0) + 1;
            });
            console.log('指标分类分布:', categoryCounts);
            
            // 标记数据已加载
            this.dataLoaded = true;
            
        } catch (error) {
            console.error('加载指标列表失败，使用静态数据:', error);
            this.indicators = getAllIndicators();
            console.log('使用静态指标数据，共', this.indicators.length, '个指标');
            this.dataLoaded = true;
        }
    }
    
    // 不再需要这些方法，使用静态指标数据模块
    
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
        // 计算总指标数
        const totalIndicators = this.indicators.length;
        
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
                        <span style="font-weight: bold;">📈 维度7：财务分析指标（${totalIndicators}个指标）</span>
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
        
        // 根据PROJECT_REQUIREMENTS.md定义的分类
        const categories = [
            { key: 'profitability', name: '💰 结构性盈利能力分析', icon: '💰' },
            { key: 'growth', name: '📈 利润质量与现金流', icon: '📈' },
            { key: 'efficiency', name: '⚡ 资本结构', icon: '⚡' },
            { key: 'stability', name: '🛡️ 资产效率', icon: '🛡️' },
            { key: 'valuation', name: '📊 股东回报', icon: '📊' }
        ];
        
        let html = '';
        for (const category of categories) {
            const isExpanded = this.expandedState[category.key] || false;
            const categoryIndicators = this.indicators.filter(i => i.category === category.key);
            const indicatorCount = categoryIndicators.length;
            
            console.log(`分类 ${category.key} 有 ${indicatorCount} 个指标:`, categoryIndicators);
            
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
                        <span>${category.icon} ${category.name}（${indicatorCount}个）</span>
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
        // 从静态数据中查找指标名称
        const indicator = this.indicators.find(i => i.code === code);
        if (indicator && indicator.name) {
            return indicator.name;
        }
        
        // 回退到默认名称
        const defaultNames = {
            '7.11': '核心利润与核心利润率',
            '7.12': '利润结构健康度（三支柱分析）',
            '7.13': '净利润与净利率',
            '7.14': '经营资产"轻/重/虚"化指数',
            '7.21': '核心利润获现率',
            '7.22': '经营现金流结构安全性',
            '7.23': '核心利润的行业壁垒系数',
            '7.24': '"两个搅局"的侵蚀度与持续性分析',
            '7.25': '减值准备计提的激进/保守指数',
            '7.31': '资本结构健康度',
            '7.32': '有息负债与偿债保障',
            '7.33': '企业发展模式矩阵定位',
            '7.41': '重构后经营资产周转率',
            '7.42': '"四高"风险预警信号',
            '7.51': '结构性净资产收益率',
            '7.52': '财务战略矩阵定位'
        };
        
        return defaultNames[code] || `指标 ${code}`;
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