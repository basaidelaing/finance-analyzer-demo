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
        console.log('搜索模块初始化...');
        
        // 获取DOM元素
        this.searchInput = document.getElementById('companySearchInput');
        this.suggestionsContainer = document.getElementById('searchSuggestions');
        
        // 调试：检查元素是否存在
        console.log('搜索框元素:', this.searchInput);
        console.log('建议容器元素:', this.suggestionsContainer);
        
        if (this.searchInput) {
            console.log('搜索框样式:', {
                display: window.getComputedStyle(this.searchInput).display,
                visibility: window.getComputedStyle(this.searchInput).visibility,
                opacity: window.getComputedStyle(this.searchInput).opacity,
                width: window.getComputedStyle(this.searchInput).width
            });
        }
        
        // 加载公司列表
        await this.loadCompanies();
        
        // 绑定事件
        this.bindEvents();
        
        console.log('搜索模块初始化完成');
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
        console.log('加载公司列表...');
        
        try {
            const response = await fetch('/api/companies');
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.companies = data.companies || [];
            console.log(`加载了 ${this.companies.length} 家公司`);
            
            // 显示前几家公司作为示例
            if (this.companies.length > 0) {
                console.log('示例公司:');
                this.companies.slice(0, 3).forEach(company => {
                    console.log(`  ${company.name} (${company.ts_code})`);
                });
            }
            
            return this.companies;
        } catch (error) {
            console.error('加载公司列表失败:', error);
            
            // 降级：使用示例数据
            this.companies = [
                { ts_code: '600519.SH', name: '贵州茅台' },
                { ts_code: '000858.SZ', name: '五粮液' },
                { ts_code: '002304.SZ', name: '洋河股份' },
                { ts_code: '000568.SZ', name: '泸州老窖' },
                { ts_code: '600809.SH', name: '山西汾酒' }
            ];
            console.log('使用示例公司数据');
            return this.companies;
        }
    }
    
    getDefaultCompanies() {
        return [
            { ts_code: '600519.SH', name: '贵州茅台' },
            { ts_code: '000858.SZ', name: '五粮液' },
            { ts_code: '002304.SZ', name: '洋河股份' },
            { ts_code: '600809.SH', name: '山西汾酒' },
            { ts_code: '000568.SZ', name: '泸州老窖' }
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
        this.showSuggestions(this.companies.slice(0, 10)); // 只显示前10个
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
        
        console.log(`选中公司: ${company.name} (${company.ts_code})`);
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