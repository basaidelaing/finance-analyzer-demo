// 目录模块
// 文件大小: <5KB

class DirectoryModule {
    constructor() {
        this.indicators = [];
        this.selectedIndicator = null;
        this.expandedGroups = new Set(['dimension7']);
    }

    async init() {
        console.log('目录模块初始化...');
        
        // 加载指标列表
        await this.loadIndicators();
        
        // 绑定事件
        this.bindEvents();
        
        console.log('目录模块初始化完成');
    }
    
    render() {
        return `
            <div class="module-header">
                <span>📊 财务指标目录</span>
            </div>
            <div class="module-content">
                <div class="directory-tree" id="directoryTree">
                    ${this.renderDimension7()}
                </div>
            </div>
        `;
    }
    
    renderDimension7() {
        // 直接从指标规范文件读取，确保与内容模块一致
        const groups = {
            '盈利能力': ['7.11', '7.12', '7.13', '7.14'],
            '现金流': ['7.21', '7.22', '7.23', '7.24', '7.25'],
            '运营效率': ['7.31', '7.32', '7.33'],
            '财务稳健': ['7.41', '7.42', '7.43', '7.44'],
            '估值水平': ['7.51', '7.52', '7.53']
        };
        
        // 使用与内容模块完全相同的指标组名
        const groupNames = {
            '7.11': '核心利润与核心利润率',
            '7.12': '利润结构健康度（三支柱分析）',
            '7.13': '费用控制能力',
            '7.14': '盈利质量',
            '7.21': '核心利润获现率',
            '7.22': '利润现金保障倍数',
            '7.23': '经营现金流增长率',
            '7.24': '自由现金流分析',
            '7.25': '现金流结构分析',
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
        
        console.log('使用静态目录配置，确保与内容模块一致');
        
        let html = `
            <div class="directory-group" data-group="dimension7">
                <div class="group-header ${this.expandedGroups.has('dimension7') ? 'expanded' : ''}">
                    <span class="group-title">维度七：综合财务分析</span>
                    <span class="group-arrow">${this.expandedGroups.has('dimension7') ? '▼' : '▶'}</span>
                </div>
        `;
        
        if (this.expandedGroups.has('dimension7')) {
            html += '<div class="group-content">';
            
            for (const [groupName, indicators] of Object.entries(groups)) {
                html += `
                    <div class="sub-group">
                        <div class="sub-group-title">${groupName}</div>
                        <div class="indicator-list">
                `;
                
                for (const code of indicators) {
                    const name = groupNames[code] || `指标 ${code}`;
                    const isActive = this.selectedIndicator === code;
                    html += `
                        <div class="indicator-item ${isActive ? 'active' : ''}" 
                             data-indicator="${code}">
                            <span class="indicator-code">${code}</span>
                            <span class="indicator-name">${name}</span>
                        </div>
                    `;
                }
                
                html += `
                        </div>
                    </div>
                `;
            }
            
            html += '</div>';
        }
        
        html += '</div>';
        
        return html;
    }
    
        async loadIndicators() {
        console.log('加载指标列表...');
        
        try {
            // 尝试从指标规范文件加载
            const response = await fetch('../data/indicators_specification_with_prefix.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 从指标规范中提取指标组信息
            this.indicators = [];
            if (data.indicators_groups && Array.isArray(data.indicators_groups)) {
                for (const group of data.indicators_groups) {
                    this.indicators.push({
                        group_code: group.group_code,
                        group_name: group.group_name,
                        code: group.group_code, // 兼容字段
                        name: group.group_name, // 兼容字段
                        dimension: 'dimension7',
                        category: this.getCategoryFromGroupCode(group.group_code),
                        level: 2,
                        status: '可计算'
                    });
                }
                console.log(`从指标规范加载了 ${this.indicators.length} 个指标组`);
            } else {
                throw new Error('指标规范格式不正确');
            }
            
            return this.indicators;
        } catch (error) {
            console.error('加载指标列表失败:', error);
            
            // 降级：使用示例数据（更新为正确的指标组名称）
            this.indicators = this.getDefaultIndicators();
            console.log('使用默认指标数据');
            return this.indicators;
        }
    }
    
    getCategoryFromGroupCode(groupCode) {
        // 根据指标组代码确定分类
        const codeNum = parseFloat(groupCode);
        if (codeNum >= 7.11 && codeNum <= 7.14) return 'profitability';
        if (codeNum >= 7.21 && codeNum <= 7.25) return 'growth';
        if (codeNum >= 7.31 && codeNum <= 7.33) return 'efficiency';
        if (codeNum >= 7.41 && codeNum <= 7.44) return 'stability';
        if (codeNum >= 7.51 && codeNum <= 7.53) return 'valuation';
        return 'other';
    }
    
    getSampleIndicators() {
        // 使用与getDefaultIndicators相同的数据
        return this.getDefaultIndicators();
    }
    
    getDefaultIndicators() {
        // 返回所有16个指标组
        return [
            { code: '7.11', name: '核心利润与核心利润率', dimension: 'dimension7', category: 'profitability', level: 2, status: '可计算' },
            { code: '7.12', name: '利润结构健康度（三支柱分析）', dimension: 'dimension7', category: 'profitability', level: 2, status: '可计算' },
            { code: '7.13', name: '费用控制能力', dimension: 'dimension7', category: 'profitability', level: 2, status: '可计算' },
            { code: '7.14', name: '盈利质量', dimension: 'dimension7', category: 'profitability', level: 2, status: '可计算' },
            { code: '7.21', name: '核心利润获现率', dimension: 'dimension7', category: 'growth', level: 2, status: '可计算' },
            { code: '7.22', name: '利润现金保障倍数', dimension: 'dimension7', category: 'growth', level: 2, status: '可计算' },
            { code: '7.23', name: '经营现金流增长率', dimension: 'dimension7', category: 'growth', level: 2, status: '可计算' },
            { code: '7.24', name: '自由现金流分析', dimension: 'dimension7', category: 'growth', level: 2, status: '可计算' },
            { code: '7.25', name: '现金流结构分析', dimension: 'dimension7', category: 'growth', level: 2, status: '可计算' },
            { code: '7.31', name: '总资产周转率', dimension: 'dimension7', category: 'efficiency', level: 2, status: '可计算' },
            { code: '7.32', name: '存货周转率', dimension: 'dimension7', category: 'efficiency', level: 2, status: '可计算' },
            { code: '7.33', name: '应收账款周转率', dimension: 'dimension7', category: 'efficiency', level: 2, status: '可计算' },
            { code: '7.41', name: '资产负债率', dimension: 'dimension7', category: 'stability', level: 2, status: '可计算' },
            { code: '7.42', name: '流动比率', dimension: 'dimension7', category: 'stability', level: 2, status: '可计算' },
            { code: '7.43', name: '速动比率', dimension: 'dimension7', category: 'stability', level: 2, status: '可计算' },
            { code: '7.44', name: '利息保障倍数', dimension: 'dimension7', category: 'stability', level: 2, status: '可计算' },
            { code: '7.51', name: '市盈率', dimension: 'dimension7', category: 'valuation', level: 2, status: '可计算' },
            { code: '7.52', name: '市净率', dimension: 'dimension7', category: 'valuation', level: 2, status: '可计算' },
            { code: '7.53', name: '市销率', dimension: 'dimension7', category: 'valuation', level: 2, status: '可计算' }
        ];
    }
    
    bindEvents() {
        // 延迟绑定，等待DOM渲染
        setTimeout(() => {
            this.bindGroupHeaders();
            this.bindIndicatorItems();
        }, 100);
    }
    
    bindGroupHeaders() {
        const groupHeaders = document.querySelectorAll('.group-header');
        groupHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const group = header.closest('.directory-group');
                const groupId = group.dataset.group;
                
                if (this.expandedGroups.has(groupId)) {
                    this.expandedGroups.delete(groupId);
                } else {
                    this.expandedGroups.add(groupId);
                }
                
                // 重新渲染目录
                this.refreshDirectory();
            });
        });
    }
    
    bindIndicatorItems() {
        const indicatorItems = document.querySelectorAll('.indicator-item');
        indicatorItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectIndicator(item.dataset.indicator);
            });
        });
    }
    
    selectIndicator(indicatorCode) {
        this.selectedIndicator = indicatorCode;
        
        // 更新UI
        const allItems = document.querySelectorAll('.indicator-item');
        allItems.forEach(item => {
            item.classList.remove('active');
            if (item.dataset.indicator === indicatorCode) {
                item.classList.add('active');
            }
        });
        
        // 触发指标选择事件
        this.dispatchIndicatorSelected(indicatorCode);
        
        console.log(`选中指标: ${indicatorCode}`);
    }
    
    dispatchIndicatorSelected(indicatorCode) {
        const indicator = this.indicators.find(i => i.code === indicatorCode) || {
            code: indicatorCode,
            name: `指标 ${indicatorCode}`
        };
        
        const event = new CustomEvent('indicatorSelected', {
            detail: { indicator }
        });
        document.dispatchEvent(event);
    }
    
    refreshDirectory() {
        const directoryTree = document.getElementById('directoryTree');
        if (directoryTree) {
            directoryTree.innerHTML = this.renderDimension7();
            this.bindEvents(); // 重新绑定事件
        }
    }
}

// 创建实例并导出
const directoryModule = new DirectoryModule();
export default directoryModule;