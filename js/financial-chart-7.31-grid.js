/**
 * 7.31 轻重资产结构比例 - 专用完整渲染函数
 * 独立渲染，跳过默认ECharts逻辑
 * 完全复制7.43的结构
 */

async function build731Dashboard(container, config, data, currentGroup, currentCompany) {
    console.log('>>> build731Dashboard started');
    
    // 清空容器 - 和7.43完全一样
    container.innerHTML = '';
    container.style.display = 'block';
    
    // ========== 第一步：先渲染4个资产结构健康度卡片 ==========
    const sortedData = [...data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    // 获取十年前的数据用于对比
    const tenYearAgoData = sortedData.find(d => parseInt(d.year) === parseInt(latestYear) - 10);
    
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
    const operatingAssetsDisplay = (operatingAssets / 100).toFixed(0) + '亿元';
    
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
    
    // 颜色映射 - 和7.43完全一样
    const colorMap = {
        green: { bg: '#ffffff', border: '#10b981', text: '#065f46', borderWidth: '4px' },
        yellow: { bg: '#ffffff', border: '#f59e0b', text: '#92400e', borderWidth: '4px' },
        red: { bg: '#ffffff', border: '#ef4444', text: '#991b1b', borderWidth: '4px' }
    };
    
    // 生成4个卡片HTML - 和7.43完全一样的结构
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
                ${heavyRating.text}（<10%为健康）
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
                ${virtualRating.text}（<1%为健康）
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
                    📊 ${latestYear}年 资产结构健康度 - 快速概览
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                ${cardsHtml}
            </div>
        </div>
    `;
    
    // 添加卡片到容器 - 和7.43完全一样
    container.innerHTML = cardsContainerHtml;
    
    // ========== 第二步：渲染主图表 ==========
    // 按年份排序
    const processedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    
    // 创建图表wrapper
    const chartWrapper = document.createElement('div');
    chartWrapper.className = 'chart-wrapper';
    chartWrapper.style.background = 'white';
    chartWrapper.style.borderRadius = '10px';
    chartWrapper.style.padding = '20px 24px 0 24px';
    chartWrapper.style.boxShadow = '0 2px 14px 0 rgba(0, 0, 0, 0.06)';
    chartWrapper.style.border = '1px solid #E5E6EB';
    chartWrapper.style.width = '100%';
    
    // 添加标题
    const title = document.createElement('h3');
    title.textContent = '轻重资产结构趋势 (' + config.groupName + ') - ' + currentCompany;
    title.style.fontSize = '17px';
    title.style.fontWeight = '600';
    title.style.color = '#1D2129';
    title.style.marginBottom = '16px';
    title.style.paddingBottom = '12px';
    title.style.borderBottom = '1px solid #E5E6EB';
    chartWrapper.appendChild(title);
    
    // 创建图表div
    const chartDiv = document.createElement('div');
    chartDiv.className = 'chart';
    chartDiv.id = '731-main-chart';
    chartDiv.style.height = '500px';
    chartDiv.style.width = '100%';
    chartWrapper.appendChild(chartDiv);
    container.appendChild(chartWrapper);
    
    // ========== 初始化ECharts并渲染 ==========
    const chart = echarts.init(chartDiv, null, {
        renderer: 'canvas',
        devicePixelRatio: Math.max(window.devicePixelRatio || 2, 2),
        antialias: true
    });
    
    // 构建option - 简化版，先显示卡片
    const option = {
        tooltip: { trigger: 'axis' },
        legend: { data: [], top: 10, left: 'center' },
        xAxis: { type: 'category', data: years },
        yAxis: [{ type: 'value' }],
        series: [],
        grid: { left: '3%', right: '3%', bottom: '80px', top: '60px', containLabel: true },
        toolbox: JSON.parse(JSON.stringify(GLOBAL_STYLE.toolbox)),
        dataZoom: []
    };
    
    // 简单系列
    option.series = [
        {
            name: '"重"化比率',
            type: 'line',
            data: processedData.map(d => {
                let val = d['heavy_ratio'] || 0;
                return typeof val === 'number' ? val : parseFloat(val) || 0;
            }),
            itemStyle: { color: '#1E88E5' },
            smooth: true
        },
        {
            name: '"虚"化比率',
            type: 'line',
            data: processedData.map(d => {
                let val = d['virtual_ratio'] || 0;
                return typeof val === 'number' ? val : parseFloat(val) || 0;
            }),
            itemStyle: { color: '#FF9800' },
            smooth: true
        }
    ];
    
    option.legend.data = ['"重"化比率', '"虚"化比率'];
    
    chart.setOption(option);
    
    // 窗口resize
    window.addEventListener('resize', () => { chart.resize(); });
    
    // ========== 最后：渲染分析结论卡片，并插到最上面 ==========
    console.log('>>> 准备渲染分析结论卡片到最上面');
    const tempDiv = document.createElement('div');
    await renderAnalysisCards(tempDiv, config, currentGroup, currentCompany);
    
    // 把tempDiv里的所有元素插到container最前面
    while (tempDiv.firstChild) {
        container.insertBefore(tempDiv.firstChild, container.firstChild);
    }
    
    console.log('>>> build731Dashboard completed');
}
