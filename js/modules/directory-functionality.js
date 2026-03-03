/**
 * 目录功能模块 - 可展开/收起的一二级目录
 * 文件大小: <3KB
 */

class DirectoryManager {
    constructor() {
        this.directories = [];
        this.currentIndicator = null;
    }

    init() {
        console.log('初始化目录功能');
        
        // 绑定目录点击事件
        this.bindDirectoryEvents();
        
        // 绑定指标点击事件
        this.bindIndicatorEvents();
        
        // 初始化状态
        this.initDirectoryState();
        
        console.log('目录功能初始化完成');
    }

    bindDirectoryEvents() {
        // 一级目录标题点击事件
        const directoryTitles = document.querySelectorAll('.primary-directory-title');
        directoryTitles.forEach(title => {
            title.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDirectory(title);
            });
        });
        
        // 阻止二级目录点击事件冒泡
        const secondaryItems = document.querySelectorAll('.secondary-directory-item');
        secondaryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }

    bindIndicatorEvents() {
        // 二级目录项点击事件
        const indicatorItems = document.querySelectorAll('.secondary-directory-item');
        indicatorItems.forEach(item => {
            item.addEventListener('click', (e) => {
                this.selectIndicator(item);
            });
        });
    }

    initDirectoryState() {
        // 默认展开第一个目录
        const firstDirectory = document.querySelector('.primary-directory-title');
        if (firstDirectory) {
            this.expandDirectory(firstDirectory);
            firstDirectory.classList.add('active');
        }
        
        // 默认选择第一个指标
        const firstIndicator = document.querySelector('.secondary-directory-item');
        if (firstIndicator) {
            this.selectIndicator(firstIndicator, false);
        }
    }

    toggleDirectory(directoryTitle) {
        const directory = directoryTitle.getAttribute('data-directory');
        const arrow = directoryTitle.querySelector('.primary-directory-arrow');
        const secondaryDir = directoryTitle.parentElement.querySelector('.secondary-directory');
        
        if (secondaryDir.classList.contains('expanded')) {
            this.collapseDirectory(directoryTitle, arrow, secondaryDir);
        } else {
            this.expandDirectory(directoryTitle, arrow, secondaryDir);
        }
        
        // 更新活动状态
        document.querySelectorAll('.primary-directory-title').forEach(title => {
            title.classList.remove('active');
        });
        directoryTitle.classList.add('active');
    }

    expandDirectory(directoryTitle, arrow = null, secondaryDir = null) {
        if (!arrow) {
            arrow = directoryTitle.querySelector('.primary-directory-arrow');
        }
        if (!secondaryDir) {
            secondaryDir = directoryTitle.parentElement.querySelector('.secondary-directory');
        }
        
        arrow.textContent = '▼';
        secondaryDir.classList.add('expanded');
        secondaryDir.style.display = 'block';
        
        console.log(`展开目录: ${directoryTitle.textContent.trim()}`);
    }

    collapseDirectory(directoryTitle, arrow = null, secondaryDir = null) {
        if (!arrow) {
            arrow = directoryTitle.querySelector('.primary-directory-arrow');
        }
        if (!secondaryDir) {
            secondaryDir = directoryTitle.parentElement.querySelector('.secondary-directory');
        }
        
        arrow.textContent = '▶';
        secondaryDir.classList.remove('expanded');
        secondaryDir.style.display = 'none';
        
        console.log(`收起目录: ${directoryTitle.textContent.trim()}`);
    }

    selectIndicator(indicatorItem, triggerEvent = true) {
        const indicatorCode = indicatorItem.getAttribute('data-indicator');
        const indicatorName = indicatorItem.textContent.trim();
        
        // 更新活动状态
        document.querySelectorAll('.secondary-directory-item').forEach(item => {
            item.classList.remove('active');
        });
        indicatorItem.classList.add('active');
        
        this.currentIndicator = {
            code: indicatorCode,
            name: indicatorName
        };
        
        console.log(`选择指标: ${indicatorName} (${indicatorCode})`);
        
        if (triggerEvent) {
            // 触发指标选择事件
            const event = new CustomEvent('indicatorSelected', {
                detail: this.currentIndicator
            });
            document.dispatchEvent(event);
            
            this.showIndicatorNotification(indicatorName);
        }
    }

    showIndicatorNotification(indicatorName) {
        // 创建通知
        let notification = document.getElementById('indicatorNotification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'indicatorNotification';
            notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #2196f3;
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 1000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                animation: slideIn 0.3s;
            `;
            document.body.appendChild(notification);
        }
        
        notification.textContent = `加载指标: ${indicatorName}`;
        notification.style.display = 'block';
        
        // 2秒后隐藏
        setTimeout(() => {
            notification.style.display = 'none';
        }, 2000);
    }

    getCurrentIndicator() {
        return this.currentIndicator;
    }

    // 外部调用的方法：根据代码选择指标
    selectIndicatorByCode(indicatorCode) {
        const indicatorItem = document.querySelector(`[data-indicator="${indicatorCode}"]`);
        if (indicatorItem) {
            this.selectIndicator(indicatorItem);
            return true;
        }
        return false;
    }
}

// 导出模块
export default DirectoryManager;