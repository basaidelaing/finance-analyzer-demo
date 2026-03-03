// 指标组图表渲染模块 - 新增功能
// 注意：这个文件应该被合并到content-charts.js中

/**
 * 渲染指标组图表
 */
export function renderGroupCharts(containerId, groupData, company) {
    if (!window.echarts) {
        console.error('ECharts未加载');
        return;
    }
    
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`容器未找到: ${containerId}`);
        return;
    }
    
    // 清空容器
    container.innerHTML = '';
    
    // 创建标题
    const title = document.createElement('div');
    title.innerHTML = `
        <h2 style="color: #2c5282; margin-top: 0; padding: 20px 20px 0;">
            📊 ${company.name} - ${groupData.groupCode} 指标组
        </h2>
    `;
    container.appendChild(title);
    
    // 为每个指标创建图表容器
    groupData.indicators.forEach((indicator, index) => {
        const chartContainer = document.createElement('div');
        chartContainer.id = `chart-${indicator.code.replace(/\./g, '-')}`;
        chartContainer.style.cssText = `
            margin: 20px;
            padding: 20px;
            background: #f0f9ff;
            border-radius: 8px;
            border: 1px solid #bee3f8;
        `;
        
        // 图表标题
        const chartTitle = document.createElement('h3');
        chartTitle.textContent = `${indicator.code} ${indicator.name}`;
        chartTitle.style.cssText = 'color: #2c5282; margin-top: 0;';
        chartContainer.appendChild(chartTitle);
        
        // 图表画布
        const chartCanvas = document.createElement('div');
        chartCanvas.id = `chart-canvas-${indicator.code.replace(/\./g, '-')}`;
        chartCanvas.style.cssText = 'width: 100%; height: 300px;';
        chartContainer.appendChild(chartCanvas);
        
        container.appendChild(chartContainer);
        
        // 渲染图表（暂时使用模拟数据）
        setTimeout(() => {
            // 导入主图表模块
            import('./content-charts.js').then(module => {
                module.renderEChart(
                    chartCanvas.id,
                    indicator.data.length > 0 ? indicator.data : generateMockData(),
                    { type: 'line', name: indicator.name },
                    index
                );
            });
        }, 100);
    });
}

/**
 * 生成模拟数据（临时使用）
 */
function generateMockData() {
    const years = ['2019', '2020', '2021', '2022', '2023', '2024'];
    return years.map(year => ({
        period: year,
        value: Math.random() * 100
    }));
}