/**
 * 7.26 经营现金含量保障 - 专用完整渲染函数
 * 独立渲染，跳过默认ECharts逻辑
 * 完全复制7.43的结构
 */

async function build726Dashboard(container, config, data, currentGroup, currentCompany) {
    console.log('>>> build726Dashboard started, currentGroup=', currentGroup, 'currentCompany=', currentCompany);
    
    // 清空容器 - 和7.43完全一样
    container.innerHTML = '';
    container.style.display = 'block';
    
    // ========== 第一步：先渲染4个安全评级卡片 ==========
    const sortedData = [...data].sort((a, b) => parseInt(b.year) - parseInt(a.year));
    const latestData = sortedData[0];
    const latestYear = latestData?.year || 'N/A';
    
    // 卡片配置定义（和7.43完全一样）
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
            formatter: (val) => (val * 100).toFixed(1) + '%',
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
    
    // 颜色映射 - 和7.43完全一样
    const colorMap = {
        green: { bg: '#ffffff', border: '#10b981', text: '#065f46', borderWidth: '4px' },
        yellow: { bg: '#ffffff', border: '#f59e0b', text: '#92400e', borderWidth: '4px' },
        red: { bg: '#ffffff', border: '#ef4444', text: '#991b1b', borderWidth: '4px' }
    };
    
    // 生成4个卡片HTML - 和7.43完全一样
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
                    📊 ${latestYear}年 经营现金含量保障 - 安全评级
                </h3>
            </div>
            <div style="display: flex; flex-wrap: nowrap; gap: 10px; justify-content: flex-start;">
                ${cardsHtml}
            </div>
        </div>
    `;
    
    // 添加卡片到容器 - 和7.43完全一样，之后不再设置任何container.style
    container.innerHTML = cardsContainerHtml;
    
    // ========== 第二步：渲染主图表 ==========
    // 按年份排序
    const processedData = [...data].sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    
    // 创建图表wrapper - 和7.43完全一样
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
    title.textContent = '经营现金含量三重保障 (' + config.groupName + ') - ' + currentCompany;
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
    chartDiv.id = '726-main-chart';
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
    
    // 构建option - 直接用7.43的逻辑
    const option = {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: [], top: 10, left: 'center' },
        xAxis: { type: 'category', data: years },
        yAxis: [],
        series: [],
        grid: { left: '3%', right: '3%', bottom: '80px', top: '60px', containLabel: true },
        graphic: [],
        toolbox: { show: true, right: 15, top: 15 },
        dataZoom: []
    };
    
    // 提取数据
    const yAxisConfig = config.charts[1].yAxis;
    const displayNames = yAxisConfig.map(a => a.fieldName);
    
    const seriesData = yAxisConfig.map((axis, index) => {
        return processedData.map(d => {
            let val = d[axis.field] || 0;
            let numVal = typeof val === 'number' ? val : parseFloat(val) || 0;
            
            if (axis.unit === '亿元') {
                numVal = numVal / 10000;
            } else if (axis.field === 'contract_liab_ratio') {
                // 已经是百分比，保持不变
            } else if (axis.unit === '%' || axis.field?.includes('ratio') || axis.field?.includes('margin')) {
                numVal = numVal * 100;
            } else if (axis.field?.includes('profit') || axis.field?.includes('cash') || axis.field?.includes('cf')) {
                numVal = numVal / 10000;
            }
            
            return numVal;
        });
    });
    
    // X轴
    option.xAxis = {
        type: 'category',
        data: years,
        name: '年份',
        axisLabel: { rotate: 0, fontSize: 12 },
        axisLine: { lineStyle: { color: '#333' } }
    };
    
    // Y轴
    option.yAxis = [];
    option.yAxis.push({
        type: 'value',
        name: '收现比/付现压迫度/合同负债占比',
        position: 'left',
        alignTicks: true,
        showMinLabel: false,
        showMaxLabel: false,
        axisLabel: { 
            formatter: function(value) { return value.toFixed(2) + '%'; },
            fontSize: 11 
        },
        splitLine: { show: true, lineStyle: { type: 'dashed', opacity: 0.5 } }
    });
    option.yAxis.push({
        type: 'value',
        name: '经营性净现金流',
        position: 'right',
        alignTicks: true,
        showMinLabel: false,
        showMaxLabel: false,
        axisLabel: { 
            formatter: function(value) { return value.toFixed(2) + '亿元'; },
            fontSize: 11 
        },
        splitLine: { show: false }
    });
    
    // Tooltip
    option.tooltip = {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
        formatter: function(params) {
            const idx = params[0].dataIndex;
            let result = `<div><strong>${years[idx]}年</strong></div>`;
            params.forEach((p, i) => {
                const axisConfig = yAxisConfig[p.seriesIndex];
                const fieldName = displayNames[i] || axisConfig.fieldName;
                result += `<div style="color:${p.color}">■ ${fieldName}: ${p.value.toFixed(2)}${axisConfig.unit || ''}</div>`;
            });
            return result;
        }
    };
    
    // Legend
    option.legend.data = displayNames;
    
    // Series
    yAxisConfig.forEach((axis, index) => {
        const seriesType = axis.type === 'bar' ? 'bar' : 'line';
        const seriesColor = axis.color || (index === 0 ? '#1E88E5' : (index === 1 ? '#FF9800' : '#2E7D32'));
        const yAxisIdx = index < 3 ? 0 : 1;
        
        let labelColor, labelPosition;
        if (seriesType === 'line') {
            labelColor = seriesColor;
            labelPosition = 'top';
        } else {
            const is725SpecialBar = axis.field === 'core_profit' || axis.field === 'net_operate_cf';
            if (is725SpecialBar) {
                labelColor = seriesColor;
                labelPosition = 'top';
            } else {
                labelColor = '#fff';
                labelPosition = 'inside';
            }
        }
        
        const seriesConfig = {
            name: displayNames[index] || axis.fieldName,
            type: seriesType,
            yAxisIndex: yAxisIdx,
            data: seriesData[index].map(val => {
                const numVal = typeof val === 'number' ? val : parseFloat(val) || 0;
                return { value: numVal, label: { color: labelColor } };
            }),
            itemStyle: { color: seriesColor },
            label: {
                show: true,
                position: labelPosition,
                fontSize: 10,
                color: labelColor,
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return params.value.toFixed(2) + (axis.unit || '');
                }
            },
            emphasis: { itemStyle: { opacity: 0.8 } }
        };
        
        if (config.charts[1].specialConfig?.stacked && seriesType === 'bar' && index < 3) {
            seriesConfig.stack = 'total';
        }
        
        if (seriesType === 'line') {
            seriesConfig.smooth = true;
            seriesConfig.symbol = 'circle';
            seriesConfig.symbolSize = 6;
            seriesConfig.lineStyle = { width: 2 };
        }
        
        option.series.push(seriesConfig);
    });
    
    // DataZoom
    option.dataZoom = [
        { type: 'inside', start: 0, end: 100 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
    ];
    
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
    
    console.log('>>> build726Dashboard completed');
}
