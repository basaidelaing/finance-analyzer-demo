/**
 * 卡片式仪表板 - 用于7.26等指标组的关键指标安全评级展示
 * 动态支持任意数量的卡片
 */

function buildCardDashboard(wrapper, config, data) {
    console.log('>>> buildCardDashboard started');
    
    // 获取最新一年的数据
    const sortedData = [...data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    console.log('>>> 最新数据:', latestYear, latestData);
    
    // 卡片配置定义
    const cardConfigs = [
        {
            field: 'receipt_ratio',
            name: '收现比',
            unit: '',
            formatter: (val) => val.toFixed(2),
            getRating: (val) => {
                if (val > 0.95) return { level: 'green', text: '回款能力强', desc: '销售现金流保障度高' };
                if (val >= 0.85) return { level: 'yellow', text: '回款正常', desc: '需关注应收账款变化' };
                return { level: 'red', text: '回款偏弱', desc: '可能存在赊销风险或票据结算增加' };
            }
        },
        {
            field: 'cash_pressure_ratio',
            name: '付现压迫度',
            unit: '',
            formatter: (val) => val.toFixed(2),
            getRating: (val) => {
                if (val < 1.1) return { level: 'green', text: '采购付现正常', desc: '对供应商占款能力较强' };
                if (val <= 1.3) return { level: 'yellow', text: '付现压力正常', desc: '需关注存货周转' };
                return { level: 'red', text: '付现压力大', desc: '可能占用大量现金或预付增加' };
            }
        },
        {
            field: 'contract_liab_ratio',
            name: '合同负债占比',
            unit: '%',
            formatter: (val) => (val * 100).toFixed(1) + '%', // 小数转百分比
            getRating: (val) => {
                const percentVal = val * 100;
                if (percentVal > 10) return { level: 'green', text: '渠道议价能力强', desc: '预收款充足' };
                if (percentVal >= 5) return { level: 'yellow', text: '渠道支持正常', desc: '' };
                return { level: 'red', text: '渠道议价能力弱', desc: '预收款不足' };
            }
        },
        {
            field: 'triple_coverage_ratio',
            name: '三重覆盖倍数',
            unit: '',
            formatter: (val) => val.toFixed(2),
            getRating: (val) => {
                if (val > 1.2) return { level: 'green', text: '覆盖能力充裕', desc: '财务极稳健' };
                if (val >= 0.8) return { level: 'yellow', text: '覆盖能力尚可', desc: '但需关注边际变化' };
                return { level: 'red', text: '覆盖不足', desc: '需警惕现金流风险' };
            }
        }
    ];
    
    // 颜色映射 - 白色背景，彩色边框和文字
    const colorMap = {
        green: { bg: '#ffffff', border: '#10b981', text: '#065f46', borderWidth: '4px' },
        yellow: { bg: '#ffffff', border: '#f59e0b', text: '#92400e', borderWidth: '4px' },
        red: { bg: '#ffffff', border: '#ef4444', text: '#991b1b', borderWidth: '4px' }
    };
    
    // 生成卡片HTML - 和7.43完全一致的尺寸和样式
    const cardsHtml = cardConfigs.map(cardConfig => {
        const rawValue = latestData?.[cardConfig.field];
        const value = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue) || 0;
        const rating = cardConfig.getRating(value);
        const colors = colorMap[rating.level];
        const displayValue = cardConfig.formatter(value);
        
        return `
            <div style="
                flex: 1;
                min-width: 180px;
                max-width: 220px;
                background: ${colors.bg};
                border: ${colors.borderWidth} solid ${colors.border};
                border-radius: 6px;
                padding: 10px 12px;
                margin: 0;
                box-shadow: 0 1px 3px rgba(0,0,0,0.08);
            ">
                <div style="margin-bottom: 6px;">
                    <span style="font-size: 13px; font-weight: 600; color: ${colors.text};">${cardConfig.name}</span>
                </div>
                <div style="font-size: 24px; font-weight: 700; color: ${colors.text}; margin: 6px 0;">
                    ${displayValue}
                </div>
                <div style="font-size: 12px; font-weight: 600; color: ${colors.text}; margin-bottom: 2px;">
                    ${rating.text}
                </div>
                ${rating.desc ? `<div style="font-size: 10px; color: ${colors.text}; opacity: 0.7; line-height: 1.2;">${rating.desc}</div>` : ''}
            </div>
        `;
    }).join('');
    
    // 完整仪表板HTML - 和7.43完全一致的布局
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
                    📊 ${latestYear}年 经营现金含量保障 - 安全评级
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                ${cardsHtml}
            </div>
        </div>
    `;
    
    // 插入到wrapper中
    wrapper.innerHTML = dashboardHtml + wrapper.innerHTML;
    
    console.log('>>> buildCardDashboard completed');
}
