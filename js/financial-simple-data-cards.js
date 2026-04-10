/**
 * 简单数据卡片仪表板 - 用于7.32等指标组（只显示数据，不评级）
 */

function buildSimpleDataCardDashboard(wrapper, config, data) {
    console.log('>>> buildSimpleDataCardDashboard started');
    
    // 获取最新一年的数据
    const sortedData = [...data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    console.log('>>> 最新数据:', latestYear, latestData);
    
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
    
    // 生成4个卡片 - 和7.43完全一致
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
    
    // 完整仪表板HTML - 和7.43完全一致
    const dashboardHtml = `
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
    
    // 插入到wrapper中
    wrapper.innerHTML = dashboardHtml + wrapper.innerHTML;
    
    console.log('>>> buildSimpleDataCardDashboard completed');
}
