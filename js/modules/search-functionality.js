/**
 * 搜索功能模块 - 白酒行业企业列表模糊搜索
 * 文件大小: <3KB
 */

class CompanySearch {
    constructor() {
        this.companies = [];
        this.searchInput = null;
        this.suggestionsContainer = null;
    }

    async init() {
        // 获取DOM元素
        this.searchInput = document.getElementById('companySearch');
        this.suggestionsContainer = document.getElementById('searchSuggestions');
        
        if (!this.searchInput || !this.suggestionsContainer) {
            console.error('搜索DOM元素未找到');
            return;
        }
        
        // 加载公司列表
        await this.loadCompanyList();
        
        // 绑定事件
        this.bindEvents();
    }

    async loadCompanyList() {
        try {
            const response = await fetch('/api/companies');
            if (response.ok) {
                const data = await response.json();
                this.companies = data.companies || [];
            } else {
                console.error('加载公司列表失败:', response.status);
                // 使用默认公司列表
                this.companies = [
                    {ts_code: '600519.SH', name: '贵州茅台'},
                    {ts_code: '000858.SZ', name: '五粮液'},
                    {ts_code: '002304.SZ', name: '洋河股份'},
                    {ts_code: '600809.SH', name: '山西汾酒'},
                    {ts_code: '000568.SZ', name: '泸州老窖'},
                    {ts_code: '603369.SH', name: '今世缘'},
                    {ts_code: '600779.SH', name: '水井坊'},
                    {ts_code: '000596.SZ', name: '古井贡酒'},
                    {ts_code: '600199.SH', name: '金种子酒'},
                    {ts_code: '600197.SH', name: '伊力特'}
                ];
            }
        } catch (error) {
            console.error('加载公司列表异常:', error);
            this.companies = [];
        }
    }

    bindEvents() {
        // 输入事件
        this.searchInput.addEventListener('input', (e) => {
            this.handleSearch(e.target.value);
        });
        
        // 点击外部关闭建议
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && 
                !this.suggestionsContainer.contains(e.target)) {
                this.suggestionsContainer.style.display = 'none';
            }
        });
        
        // 键盘事件
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.suggestionsContainer.style.display = 'none';
            }
        });
    }

    handleSearch(query) {
        if (!query || query.trim().length < 1) {
            this.clearSuggestions();
            return;
        }
        
        const searchTerm = query.trim().toLowerCase();
        const results = this.companies.filter(company => {
            return company.name.toLowerCase().includes(searchTerm) || 
                   company.ts_code.toLowerCase().includes(searchTerm);
        }).slice(0, 10); // 最多显示10个
        
        this.showSuggestions(results);
    }

    showSuggestions(companies) {
        if (companies.length === 0) {
            this.suggestionsContainer.innerHTML = '<div class="suggestion-item">未找到匹配的公司</div>';
            this.suggestionsContainer.style.display = 'block';
            return;
        }
        
        let html = '';
        companies.forEach(company => {
            html += `
                <div class="suggestion-item" data-ts-code="${company.ts_code}">
                    <strong>${company.name}</strong> (${company.ts_code})
                </div>
            `;
        });
        
        this.suggestionsContainer.innerHTML = html;
        this.suggestionsContainer.style.display = 'block';
        
        // 添加点击事件
        const suggestionItems = this.suggestionsContainer.querySelectorAll('.suggestion-item');
        suggestionItems.forEach(item => {
            item.addEventListener('click', () => {
                const tsCode = item.getAttribute('data-ts-code');
                const companyName = item.querySelector('strong').textContent;
                this.selectCompany(tsCode, companyName);
            });
        });
    }

    clearSuggestions() {
        this.suggestionsContainer.style.display = 'none';
    }

    selectCompany(tsCode, companyName) {
        // 更新搜索框
        this.searchInput.value = companyName;
        this.clearSuggestions();
        
        // 触发公司选择事件
        const event = new CustomEvent('companySelected', {
            detail: { ts_code: tsCode, name: companyName }
        });
        document.dispatchEvent(event);
        
        // 显示提示
        this.showNotification(`已选择: ${companyName}`);
    }

    showNotification(message) {
        // 创建通知元素
        let notification = document.getElementById('searchNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'searchNotification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4caf50;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                animation: fadeIn 0.3s;
            `;
            document.body.appendChild(notification);
        }
        
        notification.textContent = message;
        notification.style.display = 'block';
        
        // 3秒后隐藏
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }
}

// 导出模块
export default CompanySearch;