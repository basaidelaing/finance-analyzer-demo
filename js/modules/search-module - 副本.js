// 搜索模块
// 文件大小: <5KB

class SearchModule {
    constructor() {
        this.companies = [];
        this.searchInput = null;
        this.suggestionsContainer = null;
        this.selectedCompany = null;
    }

    async init() {
        // 获取DOM元素
        this.searchInput = document.getElementById('companySearchInput');
        this.suggestionsContainer = document.getElementById('searchSuggestions');
        
        // 加载公司列表
        await this.loadCompanies();
        
        // 绑定事件
        this.bindEvents();
    }
    
    render() {
        return `
            <div class="module-header">
                <span>🔍 搜索白酒公司</span>
            </div>
            <div class="module-content">
                <div class="search-container">
                    <input type="text" 
                           id="companySearchInput"
                           class="search-input"
                           placeholder="输入公司名称或代码..."
                           autocomplete="off"
                           style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px;">
                    <div class="search-suggestions" id="searchSuggestions"></div>
                </div>
                
                <div class="selected-company" id="selectedCompanyInfo" style="display: none;">
                    <div class="company-card">
                        <h4 id="selectedCompanyName"></h4>
                        <p id="selectedCompanyCode"></p>
                    </div>
                </div>
            </div>
        `;
    }
    
        async loadCompanies() {
        try {
            // 从GitHub Pages加载公司列表 - 使用相对于GitHub Pages根目录的路径
            const response = await fetch('data/companies.json');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 检查数据格式
            if (Array.isArray(data)) {
                // 已经是数组格式 [{ts_code, name, ...}]
                this.companies = data.map(company => ({
                    ts_code: company.ts_code,
                    name: company.name,
                    industry: company.industry || '白酒',
                    list_date: company.list_date,
                    summary:company.summary
                }));
            } else if (typeof data === 'object') {
                // 旧格式：{公司代码: 公司名称}
                this.companies = [];
                for (const [ts_code, name] of Object.entries(data)) {
                    this.companies.push({ 
                        ts_code, 
                        name: typeof name === 'string' ? name : name.name || '未知公司',
                        industry: '白酒',
                        list_date: name.list_date || null,  // 尝试获取list_date
                        market_cap_rank: name.market_cap_rank || null
                    });
                }
            } else {
                throw new Error('未知的公司数据格式');
            }
            
            console.log(`从本地文件加载了 ${this.companies.length} 家公司`);
            console.log('公司数据示例:', this.companies[0]);
            return this.companies;
        } catch (error) {
            console.error('加载公司列表失败:', error);
            
            // 降级：使用完整的11家公司数据
            this.companies = this.getDefaultCompanies();
            console.log(`使用默认公司数据: ${this.companies.length} 家公司`);
            return this.companies;
        }
    }
    
    getDefaultCompanies() {
        // 11家白酒上市公司
        return [
            { ts_code: '600519.SH', name: '贵州茅台', industry: '白酒' },
            { ts_code: '000858.SZ', name: '五粮液', industry: '白酒' },
            { ts_code: '002304.SZ', name: '洋河股份', industry: '白酒' },
            { ts_code: '000568.SZ', name: '泸州老窖', industry: '白酒' },
            { ts_code: '600809.SH', name: '山西汾酒', industry: '白酒' },
            { ts_code: '000596.SZ', name: '古井贡酒', industry: '白酒' },
            { ts_code: '000799.SZ', name: '酒鬼酒', industry: '白酒' },
            { ts_code: '603369.SH', name: '今世缘', industry: '白酒' },
            { ts_code: '603589.SH', name: '口子窖', industry: '白酒' },
            { ts_code: '600197.SH', name: '伊力特', industry: '白酒' },
            { ts_code: '600199.SH', name: '金种子酒', industry: '白酒' }
        ];
    }
    
    bindEvents() {
        if (!this.searchInput) return;
        
        // 输入事件
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearchInput(e.target.value);
        });
        
        // 焦点事件
        this.searchInput.addEventListener('focus', () => {
            this.showAllCompanies();
        });
        
        // 点击外部关闭建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSuggestions();
            }
        });
    }
    
    handleSearchInput(query) {
        if (!query.trim()) {
            this.showAllCompanies();
            return;
        }
        
        const results = this.searchCompanies(query);
        this.showSuggestions(results);
    }
    
    searchCompanies(query) {
        const lowerQuery = query.toLowerCase();
        return this.companies.filter(company => {
            return company.name.toLowerCase().includes(lowerQuery) ||
                   company.ts_code.toLowerCase().includes(lowerQuery);
        });
    }
    
    showAllCompanies() {
        this.showSuggestions(this.companies); // 显示所有公司
    }
    
    showSuggestions(companies) {
        if (!this.suggestionsContainer) return;
        
        if (companies.length === 0) {
            this.suggestionsContainer.innerHTML = '<div class="no-results">未找到匹配的公司</div>';
            this.suggestionsContainer.style.display = 'block';
            return;
        }
        
        const suggestionsHTML = companies.map(company => `
            <div class="suggestion-item" data-ts-code="${company.ts_code}">
                <div class="suggestion-name">${company.name}</div>
                <div class="suggestion-code">${company.ts_code}</div>
            </div>
        `).join('');
        
        this.suggestionsContainer.innerHTML = suggestionsHTML;
        this.suggestionsContainer.style.display = 'block';
        
        // 绑定点击事件
        const items = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        items.forEach(item => {
            item.addEventListener('click', () => {
                this.selectCompany(item.dataset.tsCode);
            });
        });
    }
    
    hideSuggestions() {
        if (this.suggestionsContainer) {
            this.suggestionsContainer.style.display = 'none';
        }
    }
    
    async selectCompany(tsCode) {
        const company = this.companies.find(c => c.ts_code === tsCode);
        if (!company) return;
        
        this.selectedCompany = company;
        this.hideSuggestions();
        
        if (this.searchInput) {
            this.searchInput.value = company.name;
        }
        
        // 显示选中公司信息
        this.showSelectedCompany(company);
        
        // 触发公司选择事件
        this.dispatchCompanySelected(company);
    }
    
    showSelectedCompany(company) {
        const infoContainer = document.getElementById('selectedCompanyInfo');
        const nameElement = document.getElementById('selectedCompanyName');
        const codeElement = document.getElementById('selectedCompanyCode');
        
        if (infoContainer && nameElement && codeElement) {
            nameElement.textContent = company.name;
            codeElement.textContent = company.ts_code;
            infoContainer.style.display = 'block';
        }
    }
    
    dispatchCompanySelected(company) {
        const event = new CustomEvent('companySelected', {
            detail: { company }
        });
        document.dispatchEvent(event);
    }
}

// 创建实例并导出
const searchModule = new SearchModule();
export default searchModule;