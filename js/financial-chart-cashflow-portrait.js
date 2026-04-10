/**
 * 三大现金流净额分组柱状图 - 带正负基线0
 * 贵州茅台三大现金流演变（2014-2024）
 */

// 增强版现金流柱状图函数
function buildCashflowBarChartOptionEnhanced(option, config, data) {
    // 初始化必需属性
    if (!option.legend) option.legend = { data: [] };
    if (!option.series) option.series = [];
    if (!option.graphic) option.graphic = [];
    
    // 数据处理：按年份排序
    const processedData = data.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    const years = processedData.map(d => d.year.toString());
    
    // 提取数据：单位亿元
    const operating = processedData.map(d => {
        const val = d.n_cashflow_operating / 10000; // 转换为亿元
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    const investing = processedData.map(d => {
        const val = d.n_cashflow_investing / 10000;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    const financing = processedData.map(d => {
        const val = d.n_cashflow_financing / 10000;
        return typeof val === 'number' ? val : parseFloat(val) || 0;
    });
    
    // ========== X轴 ==========
    option.xAxis = {
        type: 'category',
        data: years,
        name: '年份',
        axisLabel: { rotate: 0, fontSize: 12 },
        axisLine: { lineStyle: { color: '#333' } }
    };
    
    // ========== Y轴 ==========
    option.yAxis = [{
        type: 'value',
        name: '现金流净额（亿元）',
        nameLocation: 'middle',
        nameGap: 50,
        splitLine: {
            show: true,
            lineStyle: { type: 'dashed', opacity: 0.5 }
        }
    }];
    
    // ========== 基准线：x=0（灰色） ==========
    option.markLine = {
        data: [
            { xAxis: 0, label: { formatter: '零基线', position: 'end' }, lineStyle: { type: 'solid', color: '#999' } }
        ],
        silent: true
    };
    
    // ========== Tooltip ==========
    option.tooltip = {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
            const idx = params[0].dataIndex;
            const year = years[idx];
            let html = `<strong>${year}年</strong><br/>`;
            params.forEach(p => {
                const val = p.value.toFixed(2);
                const color = p.color;
                const name = p.seriesName;
                html += `<div style="color:${color}">■ ${name}: ${val} 亿元</div>`;
            });
            return html;
        }
    };
    
    // ========== 图例 ==========
    option.legend = {
        data: ['经营现金流', '投资现金流', '筹资现金流'],
        top: 50,
        selected: {
            '经营现金流': true,
            '投资现金流': true,
            '筹资现金流': true
        },
        tooltip: { show: true }
    };
    
    // ========== 系列：分组柱状图 ==========
    // 经营现金流 - 统一绿色（标准色号）
    option.series.push({
        name: '经营现金流',
        type: 'bar',
        data: operating.map(v => ({ value: v })),
        itemStyle: {
            color: '#2E7D32' // 统一标准绿色，不管正负
        },
        barWidth: '26%',
        label: {
            show: true,
            position: 'outside', // 使用官方outside参数，自动处理正负位置
            formatter: function(params) {
                return params.value.toFixed(2);
            },
            fontSize: 10,
            color: '#2E7D32' // 绿色
        },
        emphasis: {
            focus: 'series'
        }
    });
    
    // 投资现金流 - 统一黄色（标准色号）
    option.series.push({
        name: '投资现金流',
        type: 'bar',
        data: investing.map(v => ({ value: v })),
        itemStyle: {
            color: '#FF9800' // 统一标准黄色，不管正负
        },
        barWidth: '26%',
        label: {
            show: true,
            position: 'outside', // 使用官方outside参数，自动处理正负位置
            formatter: function(params) {
                return params.value.toFixed(2);
            },
            fontSize: 10,
            color: '#FF9800' // 黄色
        },
        emphasis: {
            focus: 'series'
        }
    });
    
    // 筹资现金流 - 统一蓝色（标准色号）
    option.series.push({
        name: '筹资现金流',
        type: 'bar',
        data: financing.map(v => ({ value: v })),
        itemStyle: {
            color: '#1E88E5' // 统一标准蓝色，不管正负
        },
        barWidth: '26%',
        label: {
            show: true,
            position: 'outside', // 使用官方outside参数，自动处理正负位置
            formatter: function(params) {
                return params.value.toFixed(2);
            },
            fontSize: 10,
            color: '#1E88E5' // 蓝色
        },
        emphasis: {
            focus: 'series'
        }
    });
    
    // ========== 工具箱 ==========
    option.toolbox = {
        show: true,
        right: 15,
        top: 15,
        feature: {
            dataZoom: {
                yAxisIndex: 0,
                title: { zoom: '🔍 缩放', back: '↩️ 还原' }
            },
            saveAsImage: {
                title: '💾 保存图片',
                pixelRatio: 2
            },
            restore: {
                title: '🔄 重置'
            }
        }
    };
    
    // ========== 区域缩放（时间滑块） ==========
    option.dataZoom = [
        { type: 'inside', start: 0, end: 100, minValueSpan: 3 },
        { type: 'slider', start: 0, end: 100, height: 20, bottom: 10 }
    ];
    
    // ========== 网格 ==========
    option.grid = {
        left: '10%',
        right: '12%',
        bottom: '25%', // 加大底部空间，给负数标签留足够位置，不会贴到坐标轴
        top: '25%',
        containLabel: true
    };
    
    return option;
}

/**
 * 现金流肖像与生命周期联动表格
 */
function buildCashflowLifeCycleTable(option, config, data) {
    console.log('>>> 构建现金流生命周期表格（graphic渲染）');
    
    // 【修复】不要覆盖option对象引用，只修改属性，避免ECharts内部属性丢失
    if (!option) option = {};
    // 清空原有内容
    option.tooltip = { show: false };
    option.legend = { show: false };
    option.xAxis = { show: false };
    option.yAxis = { show: false };
    // 【关键修复】添加一个空的透明series，满足ECharts必须有至少一个series的要求
    option.series = [
        {
            type: 'bar',
            data: [],
            itemStyle: { opacity: 0 },
            label: { show: false }
        }
    ];
    option.graphic = [];
    option.grid = { left: 0, right: 0, top: 80, bottom: 20, containLabel: true };
    option.title = {
        text: '现金流肖像与生命周期',
        subtext: '悬停高亮联动 · 点击查看详情',
        left: 'center',
        top: 10,
        textStyle: { fontSize: 16 },
        subtextStyle: { fontSize: 12, color: '#666' }
    };
    
    // ========== 第一步：计算衍生指标 ==========
    // 1. 现金流符号转换：正值=+，负值=-
    // 2. 现金流肖像组合：经营符号-投资符号-筹资符号
    // 3. 生命周期映射：按照经典现金流组合理论判定
    const processedData = data.map(row => {
        // 转换为数值类型，确保计算正确
        const operating = parseFloat(row.n_cashflow_operating) || 0;
        const investing = parseFloat(row.n_cashflow_investing) || 0;
        const financing = parseFloat(row.n_cashflow_financing) || 0;

        // 符号转换
        const operating_symbol = operating >= 0 ? '+' : '-';
        const investing_symbol = investing >= 0 ? '+' : '-';
        const financing_symbol = financing >= 0 ? '+' : '-';

        // 现金流肖像组合
        const cashflow_portrait = `${operating_symbol} ${investing_symbol} ${financing_symbol}`;

        // 生命周期映射规则
        let life_cycle = '未知';
        const portraitKey = operating_symbol + investing_symbol + financing_symbol;
        switch (portraitKey) {
            case '+++': life_cycle = '特殊'; break;
            case '++-': life_cycle = '成熟期'; break;
            case '+-+': life_cycle = '成长期'; break;
            case '+--': life_cycle = '成熟期'; break;
            case '-++': life_cycle = '衰退期'; break;
            case '-+-': life_cycle = '衰退期'; break;
            case '--+': life_cycle = '成长期'; break;
            case '---': life_cycle = '衰退期'; break;
            default: life_cycle = '未知';
        }

        // 返回合并后完整数据
        return {
            ...row,
            operating_symbol,
            investing_symbol,
            financing_symbol,
            cashflow_portrait,
            life_cycle
        };
    });
    
    // 数据按年份排序
    processedData.sort((a, b) => parseInt(a.year) - parseInt(b.year));
    
    // 定义生命周期颜色映射（使用规范色号）
    const lifeCycleColors = {
        '成长期': { bg: '#e8f5e9', border: '#2E7D32', text: '#1b5e20' }, // 绿色系
        '成熟期': { bg: '#e3f2fd', border: '#1E88E5', text: '#0d47a1' }, // 蓝色系
        '衰退期': { bg: '#ffebee', border: '#f44336', text: '#b71c1c' }, // 红色系
        '特殊': { bg: '#fff3e0', border: '#FF9800', text: '#e65100' }    // 黄色系
    };
    
    // 表格配置
    const rowHeight = 40;
    const headerHeight = 50;
    const tableWidth = 95; // 百分比
    const headers = ['年份', '经营性现金流', '投资性现金流', '筹资性现金流', '生命周期'];
    const colWidths = [14, 18, 18, 18, 32]; // 三个现金流列宽一致收窄，总和100%
    
    // 绘制表头背景
    option.graphic.push({
        type: 'rect',
        left: '2.5%',
        top: 80, // 从标题下方开始，增加上边距
        shape: {
            width: tableWidth + '%',
            height: headerHeight,
            radius: [6, 6, 0, 0]
        },
        style: {
            fill: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: '#1E88E5' },
                { offset: 1, color: '#0d47a1' }
            ]),
            stroke: '#1E88E5', // 规范蓝色
            lineWidth: 1
        },
        silent: true
    });
    
    // 绘制表头文字（全部居中）
    let currentLeft = 2.5;
    headers.forEach((header, i) => {
        const colWidth = (colWidths[i] / 100) * tableWidth;
        option.graphic.push({
            type: 'text',
            left: (currentLeft + colWidth / 2) + '%',
            top: (80 + headerHeight / 2 - 8) + 'px',
            style: {
                text: header,
                fontSize: 14,
                fontWeight: 'bold',
                fill: '#ffffff',
                textAlign: 'center' // 表头居中
            },
            silent: true
        });
        currentLeft += colWidth;
    });
    
    // 绘制数据行（使用计算后的带衍生指标的数据）
    processedData.forEach((row, rowIndex) => {
        const top = 80 + headerHeight + rowIndex * rowHeight;
        
        // 行背景
        option.graphic.push({
            type: 'rect',
            left: '2.5%',
            top: top,
            shape: {
                width: tableWidth + '%',
                height: rowHeight,
                radius: rowIndex === data.length - 1 ? [0, 0, 6, 6] : 0
            },
            style: {
                fill: rowIndex % 2 === 0 ? '#ffffff' : '#F9FAFB',
                stroke: '#E5E7EB',
                lineWidth: 1
            },
            silent: true
        });
        
        // 单元格数据
        const formatNum = (num) => (parseFloat(num)/10000).toFixed(2) + '亿';
        const cellData = [
            row.year,
            row.operating_symbol + ' ' + formatNum(row.n_cashflow_operating),
            row.investing_symbol + ' ' + formatNum(row.n_cashflow_investing),
            row.financing_symbol + ' ' + formatNum(row.n_cashflow_financing),
            row.life_cycle
        ];
        
        // 绘制单元格
        currentLeft = 2.5;
        cellData.forEach((cell, colIndex) => {
            let textColor = '#374151';
            let fontWeight = 'normal';
            
            // 现金流颜色编码（和柱状图完全统一）
            if (colIndex >= 1 && colIndex <= 3) {
                const symbol = [row.operating_symbol, row.investing_symbol, row.financing_symbol][colIndex - 1];
                // 不同系列对应不同主色，负值用红色
                if (colIndex === 1) {
                    textColor = symbol === '+' ? '#2E7D32' : '#f44336'; // 经营：绿/红
                } else if (colIndex === 2) {
                    textColor = symbol === '+' ? '#FF9800' : '#f44336'; // 投资：黄/红
                } else {
                    textColor = symbol === '+' ? '#1E88E5' : '#f44336'; // 筹资：蓝/红
                }
                fontWeight = '500';
            }
            
            // 生命周期特殊样式
            if (colIndex === 4 && row.life_cycle) {
                const colors = lifeCycleColors[row.life_cycle] || { bg: '#f3f4f6', border: '#d1d5db', text: '#4b5563' };
                
                // 绘制生命周期标签背景
                option.graphic.push({
                    type: 'rect',
                    left: (currentLeft + 1) + '%',
                    top: (top + rowHeight / 2 - 14) + 'px',
                    shape: {
                        width: '80%',
                        height: 28,
                        radius: 6
                    },
                    style: {
                        fill: colors.bg,
                        stroke: colors.border,
                        lineWidth: 1
                    },
                    silent: true
                });
                
                textColor = colors.text;
                fontWeight = '500';
            }
            
            // 绘制文字（全部居中显示）
            const colWidth = (colWidths[colIndex] / 100) * tableWidth;
            option.graphic.push({
                type: 'text',
                left: (currentLeft + colWidth / 2) + '%',
                top: (top + rowHeight / 2 - 7) + 'px',
                style: {
                    text: cell,
                    fontSize: 13,
                    fill: textColor,
                    fontWeight: fontWeight,
                    textAlign: 'center' // 强制水平居中
                },
                silent: true
            });
            
            currentLeft += (colWidths[colIndex] / 100) * tableWidth;
        });
    });
    
    // 设置图表总高度
    const totalHeight = 80 + headerHeight + data.length * rowHeight + 30;
    option.grid = {
        top: 0,
        height: totalHeight + 'px'
    };
    
    console.log('>>> 表格构建完成，共' + data.length + '行');
    return option;
}
