// 目录模块 - 修复版本
// 直接从指标规范文件读取，确保与内容模块一致

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
    }
    
    render() {
        return `
            <div class="module-header">
                <span>📁 指标目录</span>
            </div>
            <div class="module-content">
                ${this.renderDimension7()}
            </div>
        `;
    }
    
    renderDimension7() {
        // 直接从指标规范文件读取，确保与内容模块一致（16个指标组）
        const groups = {
            '盈利能力': ['7.11', '7.12', '7.13', '7.14'],
            '现金流': ['7.21', '7.22', '7.23', '7.24', '7.25'],
            '运营效率': ['7.31', '7.32', '7.33'],
            '财务稳健': ['7.41', '7.42'],
            '估值水平': ['7.51', '7.52']
        };
        
        // 使用指标规范文件中的确切名称（16个指标组）
        const groupNames = {
            '7.11': '核心利润与核心利润率',
            '7.12': '利润结构健康度（三支柱分析）',
            '7.13': '资产结构性收益比率',
            '7.14': '经营资产"轻/重/虚"化指数',
            '7.21': '核心利润获现率',
            '7.22': '经营现金流结构安全性',
            '7.23': '行业壁垒系数',
            '7.24': '"两个搅局"的侵蚀度',
            '7.25': '减值准备计提的激进/保守指数',
            '7.31': '造血与输血结构分析',
            '7.32': '有息负债与利息保障',
            '7.33': '资本结构定位',
            '7.41': '经营资产周转率',
            '7.42': '摊销政策激进指数',
            '7.51': 'ROE',
            '7.52': '价值创造与资金状态'
        };
        
        // 注意：没有7.43, 7.44, 7.53指标组，这些可能是重复或错误
        
        console.log('使用与指标规范文件完全一致的目录配置');
        
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
            // 从指标规范文件加载
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
                        code: group.group_code,
                        name: group.group_name,
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
        } catch (error) {
            console.error('加载指标列表失败:', error);
            
            // 降级：使用示例数据
            this.indicators = this.getSampleIndicators();
            console.log(`使用示例指标数据: ${this.indicators.length} 个指标组`);
        }
    }
    
    getCategoryFromGroupCode(groupCode) {
        if (groupCode.startsWith('7.1')) return '盈利能力';
        if (groupCode.startsWith('7.2')) return '现金流';
        if (groupCode.startsWith('7.3')) return '运营效率';
        if (groupCode.startsWith('7.4')) return '财务稳健';
        if (groupCode.startsWith('7.5')) return '估值水平';
        return '其他';
    }
    
    getSampleIndicators() {
        return [
            { code: '7.11', name: '核心利润与核心利润率', category: '盈利能力', level: 2, status: '可计算' },
            { code: '7.12', name: '利润结构健康度（三支柱分析）', category: '盈利能力', level: 2, status: '可计算' },
            { code: '7.13', name: '资产结构性收益比率', category: '盈利能力', level: 2, status: '可计算' },
            { code: '7.14', name: '经营资产"轻/重/虚"化指数', category: '盈利能力', level: 2, status: '可计算' },
            { code: '7.21', name: '核心利润获现率', category: '现金流', level: 2, status: '可计算' },
            { code: '7.22', name: '经营现金流结构安全性', category: '现金流', level: 2, status: '可计算' },
            { code: '7.23', name: '行业壁垒系数', category: '现金流', level: 2, status: '可计算' },
            { code: '7.24', name: '"两个搅局"的侵蚀度', category: '现金流', level: 2, status: '可计算' },
            { code: '7.25', name: '减值准备计提的激进/保守指数', category: '现金流', level: 2, status: '可计算' },
            { code: '7.31', name: '造血与输血结构分析', category: '运营效率', level: 2, status: '可计算' },
            { code: '7.32', name: '有息负债与利息保障', category: '运营效率', level: 2, status: '可计算' },
            { code: '7.33', name: '资本结构定位', category: '运营效率', level: 2, status: '可计算' },
            { code: '7.41', name: '经营资产周转率', category: '财务稳健', level: 2, status: '可计算' },
            { code: '7.42', name: '摊销政策激进指数', category: '财务稳健', level: 2, status: '可计算' },
            { code: '7.43', name: 'ROE', category: '财务稳健', level: 2, status: '可计算' },
            { code: '7.44', name: '价值创造与资金状态', category: '财务稳健', level: 2, status: '可计算' },
            { code: '7.51', name: 'ROE', category: '估值水平', level: 2, status: '可计算' },
            { code: '7.52', name: '价值创造与资金状态', category: '估值水平', level: 2, status: '可计算' },
            { code: '7.53', name: '财务战略矩阵', category: '估值水平', level: 2, status: '可计算' }
        ];
    }
    
    bindEvents() {
        // 使用事件委托处理指标点击
        document.addEventListener('click', (e) => {
            const indicatorItem = e.target.closest('.indicator-item');
            if (indicatorItem) {
                const indicatorCode = indicatorItem.getAttribute('data-indicator');
                this.selectIndicator(indicatorCode);
            }
            
            // 处理分组展开/折叠
            const groupHeader = e.target.closest('.group-header');
            if (groupHeader) {
                const group = groupHeader.closest('.directory-group');
                const groupName = group.getAttribute('data-group');
                this.toggleGroup(groupName);
            }
        });
    }
    
    selectIndicator(indicatorCode) {
        if (this.selectedIndicator === indicatorCode) {
            return;
        }
        
        this.selectedIndicator = indicatorCode;
        
        // 更新UI
        document.querySelectorAll('.indicator-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const selectedItem = document.querySelector(`[data-indicator="${indicatorCode}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // 触发事件
        this.dispatchIndicatorSelected(indicatorCode);
    }
    
    toggleGroup(groupName) {
        if (this.expandedGroups.has(groupName)) {
            this.expandedGroups.delete(groupName);
        } else {
            this.expandedGroups.add(groupName);
        }
        
        // 重新渲染
        this.render();
    }
    
    dispatchIndicatorSelected(indicatorCode) {
        // 查找指标信息
        let indicatorInfo = null;
        for (const indicator of this.indicators) {
            if (indicator.code === indicatorCode || indicator.group_code === indicatorCode) {
                indicatorInfo = indicator;
                break;
            }
        }
        
        if (!indicatorInfo) {
            // 使用默认信息
            indicatorInfo = {
                code: indicatorCode,
                name: `指标 ${indicatorCode}`,
                category: '未知',
                level: 2,
                status: '可计算'
            };
        }
        
        console.log(`选中指标: ${indicatorCode}`);
        
        // 触发自定义事件
        const event = new CustomEvent('indicatorSelected', {
            detail: { indicator: indicatorInfo }
        });
        document.dispatchEvent(event);
    }
}

// 导出模块
export default DirectoryModule;