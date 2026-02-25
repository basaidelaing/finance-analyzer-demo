/**
 * 目录功能模块 - 处理目录导航
 * 文件大小: <8KB
 */

class UIDirectory {
    constructor() {
        // 绑定事件
        this.bindEvents();
    }

    /**
     * 绑定目录事件
     */
    bindEvents() {
        // 使用事件委托绑定一级目录点击事件
        document.addEventListener('click', (e) => {
            // 一级目录点击
            if (e.target.closest('.primary-directory-title')) {
                const titleElement = e.target.closest('.primary-directory-title');
                this.togglePrimaryDirectory(titleElement);
            }
            
            // 二级目录组点击
            if (e.target.closest('.secondary-directory-title')) {
                const titleElement = e.target.closest('.secondary-directory-title');
                this.toggleSecondaryDirectoryGroup(titleElement);
            }
            
            // 三级目录项点击
            if (e.target.closest('.tertiary-directory-item')) {
                const itemElement = e.target.closest('.tertiary-directory-item');
                const indicatorCode = itemElement.dataset.indicator;
                this.selectTertiaryDirectoryItem(indicatorCode);
                
                // 触发指标选择事件
                if (window.app && window.app.selectIndicator) {
                    window.app.selectIndicator(indicatorCode);
                }
            }
            
            // 二级目录项点击（非三级目录）
            if (e.target.closest('.secondary-directory-item')) {
                const itemElement = e.target.closest('.secondary-directory-item');
                const indicatorCode = itemElement.dataset.indicator;
                this.selectSecondaryDirectoryItem(indicatorCode);
                
                // 触发指标选择事件
                if (window.app && window.app.selectIndicator) {
                    window.app.selectIndicator(indicatorCode);
                }
            }
        });
    }

    /**
     * 切换一级目录
     */
    togglePrimaryDirectory(element) {
        const directory = element.dataset.directory;
        const arrow = element.querySelector('.primary-directory-arrow');
        const secondaryDir = element.nextElementSibling;
        
        // 切换活动状态
        document.querySelectorAll('.primary-directory-title').forEach(title => {
            title.classList.remove('active');
        });
        element.classList.add('active');
        
        // 切换箭头
        arrow.style.transform = arrow.style.transform === 'rotate(90deg)' ? 
            'rotate(0deg)' : 'rotate(90deg)';
        
        // 切换二级目录显示
        if (secondaryDir.classList.contains('expanded')) {
            secondaryDir.classList.remove('expanded');
        } else {
            // 先收起所有其他二级目录
            document.querySelectorAll('.secondary-directory').forEach(dir => {
                dir.classList.remove('expanded');
            });
            secondaryDir.classList.add('expanded');
        }
    }

    /**
     * 切换二级目录组
     */
    toggleSecondaryDirectoryGroup(element) {
        const group = element.dataset.group;
        const arrow = element.querySelector('.secondary-directory-arrow');
        const tertiaryDir = element.nextElementSibling;
        
        // 切换箭头
        arrow.style.transform = arrow.style.transform === 'rotate(90deg)' ? 
            'rotate(0deg)' : 'rotate(90deg)';
        
        // 切换三级目录显示
        if (tertiaryDir.classList.contains('expanded')) {
            tertiaryDir.classList.remove('expanded');
            element.classList.remove('active');
        } else {
            // 先收起同一父级下的其他三级目录
            const parentSecondaryDir = element.closest('.secondary-directory');
            parentSecondaryDir.querySelectorAll('.tertiary-directory').forEach(dir => {
                dir.classList.remove('expanded');
            });
            parentSecondaryDir.querySelectorAll('.secondary-directory-title').forEach(title => {
                title.classList.remove('active');
            });
            
            tertiaryDir.classList.add('expanded');
            element.classList.add('active');
        }
    }

    /**
     * 选择三级目录项
     */
    selectTertiaryDirectoryItem(indicatorCode) {
        // 移除所有活动状态
        document.querySelectorAll('.tertiary-directory-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 设置当前活动项
        const activeItem = document.querySelector(`[data-indicator="${indicatorCode}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            
            // 确保父级目录展开
            const secondaryGroup = activeItem.closest('.secondary-directory-group');
            const secondaryTitle = secondaryGroup.querySelector('.secondary-directory-title');
            const tertiaryDir = secondaryTitle.nextElementSibling;
            
            const primaryDir = activeItem.closest('.primary-directory');
            const primaryTitle = primaryDir.querySelector('.primary-directory-title');
            const secondaryDir = primaryTitle.nextElementSibling;
            
            // 展开一级目录
            primaryTitle.classList.add('active');
            primaryTitle.querySelector('.primary-directory-arrow').style.transform = 'rotate(90deg)';
            secondaryDir.classList.add('expanded');
            
            // 展开二级目录组
            secondaryTitle.classList.add('active');
            secondaryTitle.querySelector('.secondary-directory-arrow').style.transform = 'rotate(90deg)';
            tertiaryDir.classList.add('expanded');
        }
    }

    /**
     * 选择二级目录项
     */
    selectSecondaryDirectoryItem(indicatorCode) {
        // 移除所有活动状态
        document.querySelectorAll('.secondary-directory-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // 设置当前活动项
        const activeItem = document.querySelector(`[data-indicator="${indicatorCode}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
            
            // 确保父级目录展开
            const primaryDir = activeItem.closest('.primary-directory');
            const primaryTitle = primaryDir.querySelector('.primary-directory-title');
            const secondaryDir = primaryTitle.nextElementSibling;
            
            // 展开一级目录
            primaryTitle.classList.add('active');
            primaryTitle.querySelector('.primary-directory-arrow').style.transform = 'rotate(90deg)';
            secondaryDir.classList.add('expanded');
        }
    }

    /**
     * 显示搜索建议
     */
    showSearchSuggestions(suggestions) {
        const container = document.getElementById('searchSuggestions');
        if (!container) return;
        
        if (suggestions.length === 0) {
            container.innerHTML = '<div class="search-suggestion-item">未找到匹配的公司</div>';
        } else {
            container.innerHTML = suggestions.map(company => `
                <div class="search-suggestion-item" 
                     data-ts-code="${company.ts_code}"
                     data-company-name="${company.name}">
                    <strong>${company.name}</strong> (${company.ts_code})<br>
                    <small style="color: var(--text-light);">${company.industry || '白酒'}</small>
                </div>
            `).join('');
            
            // 绑定点击事件
            container.querySelectorAll('.search-suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const tsCode = e.currentTarget.dataset.tsCode;
                    const companyName = e.currentTarget.dataset.companyName;
                    
                    // 触发选择公司事件
                    if (window.app && window.app.selectCompany) {
                        window.app.selectCompany(tsCode, companyName);
                    }
                });
            });
        }
        
        container.style.display = 'block';
    }

    /**
     * 隐藏搜索建议
     */
    hideSearchSuggestions() {
        const container = document.getElementById('searchSuggestions');
        if (container) {
            container.style.display = 'none';
        }
    }

    /**
     * 初始化搜索功能
     */
    initSearch() {
        const searchInput = document.getElementById('companySearch');
        if (!searchInput) return;
        
        // 搜索输入事件
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length < 2) {
                this.hideSearchSuggestions();
                return;
            }
            
            // 触发搜索事件
            if (window.app && window.app.searchCompanies) {
                window.app.searchCompanies(query);
            }
        });
        
        // 点击其他地方隐藏搜索建议
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideSearchSuggestions();
            }
        });
        
        // 键盘事件
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSearchSuggestions();
            }
        });
    }
}

export default UIDirectory;