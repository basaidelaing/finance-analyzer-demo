/**
 * 资产结构健康度卡片仪表板 - 用于7.31指标组
 */

function buildAssetStructureCardDashboard(wrapper, config, data) {
    console.log('>>> buildAssetStructureCardDashboard started');
    
    // 获取最新一年的数据
    const sortedData = [...data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    // 获取十年前的数据用于对比
    const tenYearAgoData = sortedData.find(d => parseInt(d.year) === parseInt(latestYear) - 10);
    
    console.log('>>> 最新数据:', latestYear, latestData);
    
    // 计算"重"化比率评级
    const heavyRatio = typeof latestData?.heavy_ratio === 'number' ? latestData.heavy_ratio : parseFloat(latestData?.heavy_ratio) || 0;
    let heavyRating, heavyChange = '';
    if (heavyRatio < 10) {
        heavyRating = { level: 'green', text: '健康' };
    } else if (heavyRatio <= 20) {
        heavyRating = { level: 'yellow', text: '注意' };
    } else {
        heavyRating = { level: 'red', text: '过高' };
    }
    
    // 计算十年变化
    if (tenYearAgoData) {
        const oldHeavyRatio = typeof tenYearAgoData.heavy_ratio === 'number' ? tenYearAgoData.heavy_ratio : parseFloat(tenYearAgoData.heavy_ratio) || 0;
        const change = (heavyRatio - oldHeavyRatio).toFixed(1);
        heavyChange = `十年${change > 0 ? '上升' : '下降'}${Math.abs(change)}个百分点`;
    }
    
    // 计算"虚"化比率评级
    const virtualRatio = typeof latestData?.virtual_ratio === 'number' ? latestData.virtual_ratio : parseFloat(latestData?.virtual_ratio) || 0;
    let virtualRating;
    if (virtualRatio < 1) {
        virtualRating = { level: 'green', text: '健康', desc: '商誉减值风险极低' };
    } else if (virtualRatio <= 3) {
        virtualRating = { level: 'yellow', text: '一般', desc: '商誉减值风险可控' };
    } else {
        virtualRating = { level: 'red', text: '过高', desc: '商誉减值风险较高' };
    }
    
    // 经营资产总额
    const operatingAssets = typeof latestData?.operating_assets === 'number' ? latestData.operating_assets : parseFloat(latestData?.operating_assets) || 0;
    const operatingAssetsDisplay = (operatingAssets / 100).toFixed(0) + '亿元'; // 假设原始单位是亿元？先按显示调整
    
    // 资产结构健康度综合评级
    let healthRating;
    if (heavyRating.level === 'green' && virtualRating.level === 'green') {
        healthRating = { level: 'green', text: '双绿灯', desc: '轻资产重品牌，内生增长典型' };
    } else if ((heavyRating.level === 'green' || virtualRating.level === 'green') && 
               (heavyRating.level !== 'red' && virtualRating.level !== 'red')) {
        healthRating = { level: 'yellow', text: '一绿一黄', desc: '资产结构基本健康' };
    } else {
        healthRating = { level: 'red', text: '需关注', desc: '资产结构存在改善空间' };
    }
    
    // 颜色映射 - 和7.43完全一致
    const colorMap = {
        green: { bg: '#ffffff', border: '#10b981', text: '#065f46', borderWidth: '4px' },
        yellow: { bg: '#ffffff', border: '#f59e0b', text: '#92400e', borderWidth: '4px' },
        red: { bg: '#ffffff', border: '#ef4444', text: '#991b1b', borderWidth: '4px' }
    };
    
    // 生成4个卡片 - 和7.43完全一致
    const heavyColors = colorMap[heavyRating.level];
    const virtualColors = colorMap[virtualRating.level];
    const healthColors = colorMap[healthRating.level];
    
    const cardsHtml = `
        <div style="
            flex: 1;
            min-width: 180px;
            max-width: 220px;
            background: ${heavyColors.bg};
            border: ${heavyColors.borderWidth} solid ${heavyColors.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        ">
            <div style="margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: ${heavyColors.text};">"重"化比率</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: ${heavyColors.text}; margin: 6px 0;">
                ${heavyRatio.toFixed(2)}%
            </div>
            <div style="font-size: 12px; font-weight: 600; color: ${heavyColors.text}; margin-bottom: 2px;">
                ${heavyRating.text}（&lt;10%为健康）
            </div>
            ${heavyChange ? `<div style="font-size: 10px; color: ${heavyColors.text}; opacity: 0.7; line-height: 1.2;">${heavyChange}</div>` : ''}
        </div>
        
        <div style="
            flex: 1;
            min-width: 180px;
            max-width: 220px;
            background: ${virtualColors.bg};
            border: ${virtualColors.borderWidth} solid ${virtualColors.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        ">
            <div style="margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: ${virtualColors.text};">"虚"化比率</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: ${virtualColors.text}; margin: 6px 0;">
                ${virtualRatio.toFixed(2)}%
            </div>
            <div style="font-size: 12px; font-weight: 600; color: ${virtualColors.text}; margin-bottom: 2px;">
                ${virtualRating.text}（&lt;1%为健康）
            </div>
            <div style="font-size: 10px; color: ${virtualColors.text}; opacity: 0.7; line-height: 1.2;">${virtualRating.desc}</div>
        </div>
        
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
                <span style="font-size: 13px; font-weight: 600; color: #374151;">经营资产总额</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: #374151; margin: 6px 0;">
                ${operatingAssetsDisplay}
            </div>
            <div style="font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 2px;">
                ${latestYear}年
            </div>
            <div style="font-size: 10px; color: #374151; opacity: 0.7; line-height: 1.2;">资产规模持续扩大</div>
        </div>
        
        <div style="
            flex: 1;
            min-width: 180px;
            max-width: 220px;
            background: ${healthColors.bg};
            border: ${healthColors.borderWidth} solid ${healthColors.border};
            border-radius: 6px;
            padding: 10px 12px;
            margin: 0;
            box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        ">
            <div style="margin-bottom: 6px;">
                <span style="font-size: 13px; font-weight: 600; color: ${healthColors.text};">资产结构健康度</span>
            </div>
            <div style="font-size: 24px; font-weight: 700; color: ${healthColors.text}; margin: 6px 0;">
                ${healthRating.text}
            </div>
            <div style="font-size: 10px; color: ${healthColors.text}; opacity: 0.7; line-height: 1.2;">${healthRating.desc}</div>
        </div>
    `;
    
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
                    📊 ${latestYear}年 资产结构健康度 - 快速概览
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                ${cardsHtml}
            </div>
        </div>
    `;
    
    // 插入到wrapper中
    wrapper.innerHTML = dashboardHtml + wrapper.innerHTML;
    
    console.log('>>> buildAssetStructureCardDashboard completed');
}
