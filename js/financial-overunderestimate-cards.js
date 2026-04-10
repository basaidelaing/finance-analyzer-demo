/**
 * 7.43 高估低估健康度卡片仪表板
 */

function buildOverUnderestimateCardDashboard(wrapper, config, data) {
    console.log('>>> buildOverUnderestimateCardDashboard started');
    
    // 获取最新一年的数据
    const sortedData = [...data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    console.log('>>> 最新数据:', latestYear, latestData);
    
    // 阈值和评级逻辑
    function getRating(index) {
        const idx = parseFloat(index) || 0;
        if (idx < 0.8) {
            return { level: 'green', text: '保守', desc: '计提充分，风险较低' };
        } else if (idx <= 1.2) {
            return { level: 'yellow', text: '中性', desc: '计提适中，风险可控' };
        } else {
            return { level: 'red', text: '激进', desc: '计提不足，风险较高' };
        }
    }
    
    // 获取四个指数的评级
    const arIndex = parseFloat(latestData?.ar_index) || 0;
    const arRating = getRating(arIndex);
    
    const invIndex = parseFloat(latestData?.inventory_index) || 0;
    const invRating = getRating(invIndex);
    
    const faIndex = parseFloat(latestData?.fa_index) || 0;
    const faRating = getRating(faIndex);
    
    const compIndex = parseFloat(latestData?.comprehensive_index) || 0;
    const compRating = getRating(compIndex);
    
    // 综合评级逻辑
    function getOverallRating(ratings) {
        const redCount = ratings.filter(r => r.level === 'red').length;
        const yellowCount = ratings.filter(r => r.level === 'yellow').length;
        
        if (redCount >= 2) {
            return { level: 'red', text: '整体偏激进', desc: '多项指数显示计提不足' };
        } else if (redCount === 1 || yellowCount >= 2) {
            return { level: 'yellow', text: '整体中性', desc: '部分指数需关注' };
        } else {
            return { level: 'green', text: '整体偏保守', desc: '各项指数计提充分' };
        }
    }
    
    const overallRating = getOverallRating([arRating, invRating, faRating, compRating]);
    
    // 颜色映射
    const colorMap = {
        green: { bg: '#ffffff', border: '#2E7D32', text: '#1B5E20', borderWidth: '4px' },
        yellow: { bg: '#ffffff', border: '#FF9800', text: '#E65100', borderWidth: '4px' },
        red: { bg: '#ffffff', border: '#f44336', text: '#B71C1C', borderWidth: '4px' }
    };
    
    // 生成4个指数卡片
    const arColors = colorMap[arRating.level];
    const invColors = colorMap[invRating.level];
    const faColors = colorMap[faRating.level];
    const compColors = colorMap[compRating.level];
    const overallColors = colorMap[overallRating.level];
    
    const cardsHtml = `
        <div style="
            flex: 1;
            min-width: 180px;
            max-width: 220px;
            background: ${arColors.bg};
            border: ${arColors.borderWidth} solid ${arColors.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        ">
            <div style="margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: ${arColors.text};">应收账款指数</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: ${arColors.text}; margin: 6px 0;">
                ${arIndex.toFixed(4)}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: ${arColors.text}; margin-bottom: 2px;">
                ${arRating.text}（0.8-1.2为中性）
            </div>
            <div style="font-size: 10px; color: ${arColors.text}; opacity: 0.7; line-height: 1.2;">${arRating.desc}</div>
        </div>
        
        <div style="
            flex: 1;
            min-width: 180px;
            max-width: 220px;
            background: ${invColors.bg};
            border: ${invColors.borderWidth} solid ${invColors.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        ">
            <div style="margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: ${invColors.text};">存货指数</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: ${invColors.text}; margin: 6px 0;">
                ${invIndex.toFixed(4)}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: ${invColors.text}; margin-bottom: 2px;">
                ${invRating.text}（0.8-1.2为中性）
            </div>
            <div style="font-size: 10px; color: ${invColors.text}; opacity: 0.7; line-height: 1.2;">${invRating.desc}</div>
        </div>
        
        <div style="
            flex: 1;
            min-width: 180px;
            max-width: 220px;
            background: ${faColors.bg};
            border: ${faColors.borderWidth} solid ${faColors.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        ">
            <div style="margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: ${faColors.text};">固定资产指数</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: ${faColors.text}; margin: 6px 0;">
                ${faIndex.toFixed(4)}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: ${faColors.text}; margin-bottom: 2px;">
                ${faRating.text}（0.8-1.2为中性）
            </div>
            <div style="font-size: 10px; color: ${faColors.text}; opacity: 0.7; line-height: 1.2;">${faRating.desc}</div>
        </div>
        
        <div style="
            flex: 1;
            min-width: 180px;
            max-width: 220px;
            background: ${overallColors.bg};
            border: ${overallColors.borderWidth} solid ${overallColors.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        ">
            <div style="margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: ${overallColors.text};">综合评级</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: ${overallColors.text}; margin: 6px 0;">
                ${overallRating.text}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: ${overallColors.text}; margin-bottom: 2px;">
                ${compIndex.toFixed(4)}
            </div>
            <div style="font-size: 10px; color: ${overallColors.text}; opacity: 0.7; line-height: 1.2;">${overallRating.desc}</div>
        </div>
    `;
    
    // 完整仪表板HTML
    const dashboardHtml = `
        <div style="
            background: transparent;
            padding: 0;
            margin: 0 0 12px 0;
        ">
            <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            ">
                <h3 style="margin: 0; font-size: 14px; color: #374151; font-weight: 600;">
                    📊 ${latestYear}年 高估低估健康度 - 快速概览
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                ${cardsHtml}
            </div>
        </div>
    `;
    
    // 插入到wrapper中
    wrapper.innerHTML = dashboardHtml + wrapper.innerHTML;
    
    console.log('>>> buildOverUnderestimateCardDashboard completed');
}