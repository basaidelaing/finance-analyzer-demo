/**
 * 7.32 经营资产周转天数 - 专用完整渲染函数
 * 独立渲染，跳过默认ECharts逻辑
 * 完全复制7.43的结构
 */

async function build732Dashboard(container, config, data, currentGroup, currentCompany) {
    console.log('>>> build732Dashboard started');
    
    // 清空容器 - 和7.43完全一样
    container.innerHTML = '';
    container.style.display = 'block';
    
    // ========== 第一步：先渲染4个关键指标概览卡片 ==========
    const sortedData = [...data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    // 卡片配置定义
    const cardConfigs = [
        {
            field: 'working_capital_days',
            name: '核心营运资本沉淀天数',
            unit: '天',
            formatter: (val) => val.toFixed(1)
        },
        {
            field: 'operating_asset_turnover',
            name: '经营资产周转率',
            unit: '次',
            formatter: (val) => val.toFixed(2)
        },
        {
            field: 'core_profit_margin',
            name: '核心利润率',
            unit: '%',
            formatter: (val) => val.toFixed(1) + '%'
        },
        {
            field: 'operating_asset_roa',
            name: '经营资产报酬率',
            unit: '%',
            formatter: (val) => val.toFixed(1) + '%'
        }
    ];
    
    // 生成4个卡片HTML - 和7.43完全一样的结构
    const cardsHtml = cardConfigs.map(cardConfig => {
        const rawValue = latestData?.[cardConfig.field];
        const value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue) || 0;
        const displayValue = cardConfig.formatter(value);
        
        return `
            <div style="
                flex: 1;
                min-width: 180px;
                max-width: 220px;
                background: #ffffff;
                border: 4px solid #6b7280;
                border-radius: 6px;
                padding: 10px 12px;
                margin: 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            ">
                <div style="margin-bottom: 6px;">
                    <span style="font-size: 13px; font-weight: 600; color: #374151;">${cardConfig.name}</span>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: #374151; margin: 6px 0;">
                    ${displayValue}
                </div>
                <div style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 2px;">
                    ${latestYear}年
                </div>
            </div>
        `;
    }).join('');
    
    // 完整卡片区域HTML - 完全和7.43一样
    const cardsContainerHtml = `
        <div style="
            background: transparent;
            padding: 0;
            margin: 0 0 20px 0;
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            ">
                <h3 style="margin: 0; font-size: 14px; color: #374151; font-weight: 600;">
                    📊 ${latestYear}年 关键指标概览
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                ${cardsHtml}
            </div>
        </div>
    `;
    
    // 添加卡片到容器 - 和7.43完全一样，之后不再设置任何container.style
    container.innerHTML = cardsContainerHtml;
    
    // ========== 第二步：渲染两个图表 ==========
    // 按年份排序
    const processedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    
    // ========== 图表1：核心营运资本沉淀天数与经营资产周转率 ==========
    const chartWrapper1 = document.createElement('div');
    chartWrapper1.className = 'chart-wrapper';
    chartWrapper1.style.background = 'white';
    chartWrapper1.style.borderRadius = '10px';
    chartWrapper1.style.padding = '20px 24px 0 24px';
    chartWrapper1.style.boxShadow = '0 2px 14px 0 rgba(0, 0, 0, 0.06)';
    chartWrapper1.style.border = '1px solid #E5E6EB';
    chartWrapper1.style.width = '100%';
    chartWrapper1.style.marginBottom = '20px';
    
    const title1 = document.createElement('h3');
    title1.textContent = '核心营运资本沉淀天数与经营资产周转率 (' + config.groupName + ') - ' + currentCompany;
    title1.style.fontSize = '17px';
    title1.style.fontWeight = '600';
    title1.style.color = '#1D2129';
    title1.style.marginBottom = '16px';
    title1.style.paddingBottom = '12px';
    title1.style.borderBottom = '1px solid #E5E6EB';
    chartWrapper1.appendChild(title1);
    
    const chartDiv1 = document.createElement('div');
    chartDiv1.className = 'chart';
    chartDiv1.id = '732-chart-1';
    chartDiv1.style.height = '500px';
    chartDiv1.style.width = '100%';
    chartWrapper1.appendChild(chartDiv1);
    container.appendChild(chartWrapper1);
    
    // ========== 图表2：核心利润率与经营资产报酬率 ==========
    const chartWrapper2 = document.createElement('div');
    chartWrapper2.className = 'chart-wrapper';
    chartWrapper2.style.background = 'white';
    chartWrapper2.style.borderRadius = '10px';
    chartWrapper2.style.padding = '20px 24px 0 24px';
    chartWrapper2.style.boxShadow = '0 2px 14px 0 rgba(0, 0, 0, 0.06)';
    chartWrapper2.style.border = '1px solid #E5E6EB';
    chartWrapper2.style.width = '100%';
    
    const title2 = document.createElement('h3');
    title2.textContent = '核心利润率与经营资产报酬率 (' + config.groupName + ') - ' + currentCompany;
    title2.style.fontSize = '17px';
    title2.style.fontWeight = '600';
    title2.style.color = '#1D2129';
    title2.style.marginBottom = '16px';
    title2.style.paddingBottom = '12px';
    title2.style.borderBottom = '1px solid #E5E6EB';
    chartWrapper2.appendChild(title2);
    
    const chartDiv2 = document.createElement('div');
    chartDiv2.className = 'chart';
    chartDiv2.id = '732-chart-2';
    chartDiv2.style.height = '500px';
    chartDiv2.style.width = '100%';
    chartWrapper2.appendChild(chartDiv2);
    container.appendChild(chartWrapper2);
    
    // ========== 初始化ECharts并渲染图表1 ==========
    const chart1 = echarts.init(chartDiv1, null, {
        renderer: 'canvas',
        devicePixelRatio: Math.max(window.devicePixelRatio || 2, 2),
        antialias: true
    });
    
    const option1 = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: ['核心营运资本沉淀天数', '经营资产周转率'], top: 10, left: 'center' },
        xAxis: { type: 'category', data: years, name: '年份' },
        yAxis: [
            { type: 'value', name: '天数', position: 'left', axisLabel: { formatter: '{value}天' } },
            { type: 'value', name: '次数', position: 'right', axisLabel: { formatter: '{value}次' } }
        ],
        series: [],
        grid: { left: '3%', right: '3%', bottom: '80px', top: '60px', containLabel: true },
        toolbox: JSON.parse(JSON.stringify(GLOBAL_STYLE.toolbox)),
        dataZoom: []
    };
    
    // 图表1数据
    const workingCapitalDaysData = processedData.map(d => {
        let val = d['working_capital_days'] || 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    const operatingAssetTurnoverData = processedData.map(d => {
        let val = d['operating_asset_turnover'] || 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    
    option1.series = [
        {
            name: '核心营运资本沉淀天数',
            type: 'line',
            yAxisIndex: 0,
            data: workingCapitalDaysData,
            itemStyle: { color: '#1E88E5' },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: '#1E88E5',
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return params.value.toFixed(1) + '天';
                }
            }
        },
        {
            name: '经营资产周转率',
            type: 'line',
            yAxisIndex: 1,
            data: operatingAssetTurnoverData,
            itemStyle: { color: '#FF9800' },
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2 },
            label: {
                show: true,
                position: 'top',
                fontSize: 10,
                color: '#FF9800',
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return params.value.toFixed(2) + '次';
                }
            }
        }
    ];
    
    option1.dataZoom = [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
    ];
    
    chart1.setOption(option1);
    
    // ========== 初始化ECharts并渲染图表2 ==========
    const chart2 = echarts.init(chartDiv2, null, {
        renderer: 'canvas',
        devicePixelRatio: Math.max(window.devicePixelRatio || 2, 2),
        antialias: true
    });
    
    const option2 = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: ['核心利润率', '经营资产报酬率'], top: 10, left: 'center' },
        xAxis: { type: 'category', data: years, name: '年份' },
        yAxis: { type: 'value', name: '%', axisLabel: { formatter: '{value}%' } },
        series: [],
        grid: { left: '3%', right: '3%', bottom: '80px', top: '60px', containLabel: true },
        toolbox: JSON.parse(JSON.stringify(GLOBAL_STYLE.toolbox)),
        dataZoom: []
    };
    
    // 图表2数据
    const coreProfitMarginData = processedData.map(d => {
        let val = d['core_profit_margin'] || 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    const operatingAssetRoaData = processedData.map(d => {
        let val = d['operating_asset_roa'] || 0;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    
    option2.series = [
        {
            name: '核心利润率',
            type: 'bar',
            data: coreProfitMarginData,
            itemStyle: { color: '#1E88E5' },
            label: {
                show: true,
                position: 'inside',
                fontSize: 10,
                color: '#fff',
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return params.value.toFixed(1) + '%';
                }
            }
        },
        {
            name: '经营资产报酬率',
            type: 'bar',
            data: operatingAssetRoaData,
            itemStyle: { color: '#2E7D32' },
            label: {
                show: true,
                position: 'inside',
                fontSize: 10,
                color: '#fff',
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return params.value.toFixed(1) + '%';
                }
            }
        }
    ];
    
    option2.dataZoom = [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
    ];
    
    chart2.setOption(option2);
    
    // 窗口resize
    window.addEventListener('resize', () => {
        chart1.resize();
        chart2.resize();
    });
    
    // ========== 最后：渲染分析结论卡片，并插到最上面 ==========
    console.log('>>> 准备渲染分析结论卡片到最上面');
    const tempDiv = document.createElement('div');
    await renderAnalysisCards(tempDiv, config, currentGroup, currentCompany);
    
    // 把tempDiv里的所有元素插到container最前面
    while (tempDiv.firstChild) {
        container.insertBefore(tempDiv.firstChild, container.firstChild);
    }
    
    console.log('>>> build732Dashboard completed');
}
