// 函数实现由对应专用js文件提供，无需提前声明


// 全局变量
let companies = []; // 所有公司列表 {ts_code, name}
let currentCompany = null;
let currentGroup = null;
let myChart = null;
let chartInstance = null;

// 配置目录和数据目录
const CONFIG_BASE_URL = 'config/';
const DATA_BASE_URL = './';

// 自定义图表类型到ECharts类型映射
const CHART_TYPE_MAP = {
    'bubbleTrajectory': 'scatter',
    'stackedArea': 'line',
    'multiLineColor': 'line',
    'cashflowLifeCycleTable': 'bar',
    'cashConversionCombo': 'bar',
    'cashflowStructure': 'bar',
    'coreProfit': 'line',
    'barrierEfficiency': 'bar',
    'roeStructural': 'line',
    'multiLine': 'line',
    'stackedBar': 'bar',
    'groupedBar': 'bar',
    'duPontFactors': 'bar',
    'cashflowBarChart': 'bar',
    'line': 'line',
    'bar': 'bar'
};

// 全局统一样式配置
const GLOBAL_STYLE = {
  // 统一颜色体系
  colors: {
    blue: '#1E88E5',
    red: '#f44336',
    yellow: '#FF9800',
    green: '#2E7D32',
    black: '#424242',
    gradient: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
      { offset: 0, color: '#1E88E5' },
      { offset: 1, color: '#f44336' }
    ])
  },
  // 统一工具栏配置
  toolbox: {
    show: true,
    right: 15,
    top: 15,
    feature: {
      restore: { title: '🔄 还原图表' },
      saveAsImage: { title: '💾 下载图片' },
      dataView: { title: '📋 查看数据', readOnly: true, lang: ['数据表格', '关闭', '刷新'] }
    },
    itemSize: 22,
    iconStyle: {
      borderColor: 'transparent',
      color: '#4E5969',
      bgColor: 'rgba(255,255,255,0.9)',
      opacity: 0.9
    },
    emphasis: {
      iconStyle: { color: '#165DFF' }
    }
  },
  // 统一图例配置
  legend: {
    top: 10,
    left: 'center',
    textStyle: {
      fontSize: 13,
      color: '#333'
    }
  },
  // 统一数据缩放配置
  dataZoom: [
    { type: 'inside', start: 0, end: 100 },
    { type: 'slider', start: 0, end: 100, height: 20, bottom: 40 }
  ],
  // 统一字体配置
  textStyle: {
    fontSize: 12,
    fontFamily: 'Microsoft YaHei, sans-serif'
  }
};

// 全局字段中文映射
const FIELD_NAME_MAP = {
  'n_cashflow_operating': '经营现金流',
  'n_cashflow_investing': '投资现金流',
  'n_cashflow_financing': '融资现金流',
  'operating_roe': '纯实业经营ROE贡献',
  'other_contribution': '其他贡献',
  'roe': '总ROE',
  'net_margin': '销售净利率',
  'asset_turnover': '资产周转率',
  'equity_multiplier': '权益乘数',
  'industry_barrier': '行业壁垒系数',
  'excess_gross_margin': '超额毛利率',
  'core_profit_margin': '核心利润率',
  'core_profit_ratio': '核心利润占比',
  'other_income_ratio': '其他收益占比',
  'misc_ratio': '杂项收益占比',
  'core_profit_amt': '核心利润额',
  'other_income_amt': '其他收益额',
  'misc_amt': '杂项收益额',
  'ROOA': '经营资产报酬率',
  'ROIA': '非经营资产报酬率',
  'goodwill_to_equity_ratio': '商誉/净资产比例',
  'amortization_radical_index': '摊销激进指数',
  'amortization_before_margin': '摊销前利润率',
  'amortization_after_margin': '摊销后利润率',
  'amortization_impact_diff': '摊销影响差值',
  'rd_ratio': '研发投入强度',
  'heavy_ratio': '重化比率',
  'virtual_ratio': '虚化比率',
  '内生资金占比(%)': '内生资金占比',
  '外生资金占比(%)': '外生资金占比',
  'dep': '折旧摊销',
  'int': '利息支出',
  'div': '现金股利',
  'ocf': '经营现金流净额'
};

// 预设的11家白酒公司
const PRESET_COMPANIES = [
    {"ts_code": "000568", "name": "泸州老窖"},
    {"ts_code": "000596", "name": "古井贡酒"},
    {"ts_code": "000799", "name": "酒鬼酒"},
    {"ts_code": "000858", "name": "五粮液"},
    {"ts_code": "600519", "name": "贵州茅台"},
    {"ts_code": "600702", "name": "舍得酒业"},
    {"ts_code": "600809", "name": "山西汾酒"},
    {"ts_code": "002304", "name": "洋河股份"},
    {"ts_code": "603369", "name": "今世缘"},
    {"ts_code": "600779", "name": "水井坊"},
    {"ts_code": "600888", "name": "伊力特"}
];

// 所有指标组列表（内部ID，不要修改）
const groupIds = [
    '7.11', '7.12', '7.13', '7.21', '7.22', '7.23', '7.24', '7.25', '7.26',
    '7.31', '7.32', '7.33', '7.41', '7.42', '7.43', '7.44', '7.51', '7.52', '7.53'
];

// 指标组显示名称映射（外部显示名称，可以修改）
const groupNames = {
    '7.11': '7.1 财务战略矩阵与创值定性',
    '7.12': '7.12 结构性净资产收益率归因',
    '7.13': '7.13 现金流肖像与生命周期判断',
    '7.21': '7.21 核心利润与核心利润率',
    '7.22': '7.22 行业超额壁垒与费效转化率',
    '7.23': '7.23 利润结构基石与质量分布',
    '7.24': '7.24 资产结构性收益比率',
    '7.25': '7.25 核心利润获现率',
    '7.26': '7.26 经营现金流结构安全',
    '7.31': '7.31 资产固化与虚胖指数',
    '7.32': '7.32 重构后经营资产周转',
    '7.33': '7.33 并购无形资产质量压力测试',
    '7.41': '7.41 宏观异象与收入造假预警',
    '7.42': '7.42 非核心收益平滑与粉饰度',
    '7.43': '7.43 减值准备计提的激进/保守指数',
    '7.44': '7.44 四高”风险预警信号/极值背离与关联方掏空',
    '7.51': '7.51 内生资本与外源融资依赖度',
    '7.52': '7.52 有息负债与偿债保障',
    '7.53': '7.53 企业发展模式矩阵定位'
};

// 初始化
function init() {
    populateCompanySelect();
    populateGroupList();
    bindEvents();
}

// 填充公司选择下拉框
function populateCompanySelect() {
    const select = document.getElementById('company-select');
    companies = PRESET_COMPANIES;
    companies.forEach(comp => {
        const option = document.createElement('option');
        option.value = comp.ts_code;
        option.textContent = comp.ts_code + ' - ' + comp.name;
        select.appendChild(option);
    });
}

// 填充指标组列表
function populateGroupList() {
    const container = document.getElementById('group-list');
    groupIds.forEach(gid => {
        const item = document.createElement('div');
        item.className = 'group-item';
        item.dataset.group = gid;
        item.textContent = groupNames[gid] || gid; // 优先显示映射名称，没有则用ID
        item.addEventListener('click', () => {
            document.querySelectorAll('.group-item').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            currentGroup = gid;
            renderCurrentCharts();
        });
        container.appendChild(item);
    });
}

// 绑定事件
function bindEvents() {
    document.getElementById('company-select').addEventListener('change', () => {
        // 清空选中状态，用户重新选公司后需要重新选指标
        document.querySelectorAll('.group-item').forEach(el => el.classList.remove('active'));
        document.getElementById('charts-container').innerHTML = '';
        currentCompany = document.getElementById('company-select').value;
    });
}

// 默认图表构建
function buildDefaultOption(option, config, data) {
    // 确保option一定是有效对象，不管传入什么都不会崩溃
    if (!option || typeof option !== 'object') {
        option = {
            tooltip: {},
            xAxis: {},
            yAxis: [],
            series: [],
            graphic: []
        };
    }
    // 初始化必填属性
    if (!option.tooltip) option.tooltip = {};
    if (!option.xAxis) option.xAxis = {};
    if (!option.yAxis) option.yAxis = [];
    if (!option.series) option.series = [];
    if (!option.graphic) option.graphic = [];

    const {yField, yFields, colors} = config;
    // 兼容单数yField和复数yFields
    const actualYFieldsArr = yFields || (yField ? [yField] : []);
    
    // 应用全局统一样式
    option.toolbox = JSON.parse(JSON.stringify(GLOBAL_STYLE.toolbox));
    option.legend = JSON.parse(JSON.stringify(GLOBAL_STYLE.legend));
    if (!option.legend.data) option.legend.data = [];
    if (!option.legend.selected) option.legend.selected = {}; // 初始化selected对象，避免undefined报错
    option.dataZoom = JSON.parse(JSON.stringify(GLOBAL_STYLE.dataZoom));
    option.textStyle = JSON.parse(JSON.stringify(GLOBAL_STYLE.textStyle));
    option.grid = { left: '3%', right: '4%', bottom: '80px', top: '80px', containLabel: true };

    // 统一颜色体系
    const colorPalette = [GLOBAL_STYLE.colors.blue, GLOBAL_STYLE.colors.green, GLOBAL_STYLE.colors.yellow, GLOBAL_STYLE.colors.red, GLOBAL_STYLE.colors.black];

    option.xAxis = {
        type: 'category',
        data: data.map(d => d.year),
        name: config.unit?.x || '年份',
        axisLabel: {
            rotate: 0,
            fontSize: 12
        }
    };
    
    // 针对stackedArea类型（7.51/7.53）强制生成两个系列，按索引取第4、5列
    if (config.chartType === 'stackedArea') {
        option.yAxis = {
            type: 'value',
            name: config.unit?.y || '%',
            min: 0,
            axisLabel: {
                fontSize: 12,
                formatter: value => value.toFixed(2) + '%'
            }
        };
        option.legend.data = ['内生资金占比', '外生资金占比'];
        option.tooltip = {
            trigger: 'axis',
            formatter: function(params) {
                let result = '<div style="padding: 8px 12px; font-size: 13px;"><strong style="font-size: 15px;">' + params[0].name + '年</strong><br>';
                params.forEach(p => {
                    result += '<div style="color:' + p.color + '; margin-top: 4px;">■ ' + p.seriesName + ': ' + p.value.toFixed(2) + '%</div>';
                });
                result += '</div>';
                return result;
            }
        };
        option.series = [
            {
                name: '内生资金占比',
                type: 'line',
                stack: 'total',
                areaStyle: { opacity: 0.7, color: GLOBAL_STYLE.colors.yellow },
                lineStyle: { color: GLOBAL_STYLE.colors.yellow, width: 2 },
                itemStyle: { color: GLOBAL_STYLE.colors.yellow },
                data: data.map(d => {
                    const cols = Object.values(d);
                    return cols.length >= 4 ? parseFloat(cols[3]) || 0 : 0;
                }),
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 11,
                    color: GLOBAL_STYLE.colors.yellow,
                    formatter: params => params.value ? params.value.toFixed(2) + '%' : ''
                }
            },
            {
                name: '外生资金占比',
                type: 'line',
                stack: 'total',
                areaStyle: { opacity: 0.7, color: GLOBAL_STYLE.colors.green },
                lineStyle: { color: GLOBAL_STYLE.colors.green, width: 2 },
                itemStyle: { color: GLOBAL_STYLE.colors.green },
                data: data.map(d => {
                    const cols = Object.values(d);
                    return cols.length >= 5 ? parseFloat(cols[4]) || 0 : 0;
                }),
                label: {
                    show: true,
                    position: 'top',
                    fontSize: 11,
                    color: GLOBAL_STYLE.colors.green,
                    formatter: params => params.value ? params.value.toFixed(2) + '%' : ''
                }
            }
        ];
        console.log('>>> 强制生成stackedArea系列，数据示例:', option.series[0].data.slice(0, 3));
        return option;
    }

    // 处理Y轴配置 - 不显示最大值最小值标签
    const yAxisCount = config.yAxisCount || 1;
    option.yAxis = [];
    for (let i = 0; i < yAxisCount; i++) {
        let unit = '';
        if (config.unit?.y) {
            if (Array.isArray(config.unit.y)) {
                unit = config.unit.y[i] || config.unit.y[0] || '';
            } else {
                unit = config.unit.y;
            }
        }
        // 单位转换：万元转亿元
        if (unit === '万元') unit = '亿元';
        
        option.yAxis.push({
            type: 'value',
            name: unit,
            min: null, // 支持显示负值，不强制从0开始
            max: config.specialConfig?.yMax !== undefined ? config.specialConfig.yMax : null,
            axisLabel: {
                fontSize: 12,
                formatter: function(value) {
                    return value.toFixed(2);
                }
            },
            position: i === 0 ? 'left' : 'right',
            offset: i > 1 ? (i - 1) * 60 : 0,
            axisTick: {
                show: true
            }
        });
    }

    // 统一tooltip格式化（7.25风格）
    option.tooltip = {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: function(params) {
            let result = '<div style="padding: 8px 12px; font-size: 13px;"><strong style="font-size: 15px;">' + params[0].name + '年</strong><br>';
            const displayNames = config.yFieldNames || [];
            params.forEach((p, idx) => {
                // 优先使用配置中的yFieldNames，如果没有则用FIELD_NAME_MAP映射
                const name = displayNames[idx] || FIELD_NAME_MAP[p.seriesName] || p.seriesName;
                let unit = '';
                if (config.unit?.y) {
                    if (Array.isArray(config.unit.y)) {
                        unit = config.unit.y[p.seriesIndex] || config.unit.y[0] || '';
                    } else {
                        unit = config.unit.y;
                    }
                }
                // 单位转换：万元转亿元
                if (unit === '万元') unit = '亿元';
                const val = typeof p.value === 'object' ? p.value.value : p.value;
                result += '<div style="color:' + p.color + '; margin-top: 4px;">■ ' + name + ': ' + (val ? val.toFixed(2) : '-') + ' ' + unit + '</div>';
            });
            result += '</div>';
            return result;
        }
    };

    // 生成系列
    const colsCount = data.length > 0 ? (Object.keys(data[0]).length - 3) : 0;
    const actualYFields = actualYFieldsArr.length > 0 ? actualYFieldsArr : Array.from({length: Math.min(colsCount, 3)}, (_, i) => `指标${i+1}`);
    const displayNames = config.yFieldNames || [];
    
    actualYFields.forEach((yField, i) => {
        if (i >= colsCount) return; // 避免超出CSV列数
        // 优先使用配置中的yFieldNames，如果没有则用FIELD_NAME_MAP映射
        const displayName = displayNames[i] || FIELD_NAME_MAP[yField] || yField;
        option.legend.data.push(displayName);
        option.legend.selected[displayName] = true;

        const seriesColor = colors ? colors[i] : colorPalette[i % colorPalette.length];
        const seriesConfig = {
            name: displayName,
            type: CHART_TYPE_MAP[config.chartType] || config.chartType || 'line',
            data: data.map(d => {
                // 优先字段名匹配，只有字段名不存在时才按索引取
                let val = d[yField];
                const cols = Object.values(d);
                // 只有当字段名取不到值时，才按索引取第i+3列作为fallback
                if ((val === null || val === undefined || val === '') && cols.length >= 3 + i + 1) {
                    val = cols[3 + i];
                }
                // 强制转换为数字，空值返回0而不是null，确保能渲染
                const numVal = parseFloat(val);
                const finalVal = isNaN(numVal) ? 0 : numVal;
                
                // 数据标签颜色：正数白色，负数黑色
                const labelColor = finalVal >= 0 ? '#fff' : '#000';
                
                return {
                    value: finalVal,
                    label: {
                        color: labelColor
                    }
                };
            }),
            color: seriesColor,
            itemStyle: {
                color: seriesColor
            },
            smooth: true,
            yAxisIndex: config.yAxisCount > 1 ? (i >= actualYFields.length - 1 ? 1 : 0) : 0, // 多Y轴时最后一个系列用右轴
            label: {
                show: true,
                position: (config.chartType === 'stackedBar' || config.chartType === 'groupedBar') ? 'inside' : 'top', // 堆叠/分组柱状图在柱子中间
                fontSize: 11,
                formatter: function(params) {
                    if (params.value === null || params.value === undefined || params.value === 0) return '';
                    return Number(params.value).toFixed(2);
                }
            }
        };
        
        // 堆叠柱状图需要stack属性，groupedBar默认不堆叠
        if ((config.chartType === 'bar' || config.chartType === 'stackedBar' || config.chartType === 'groupedBar') && actualYFields.length > 1 && config.specialConfig?.stacked) {
            seriesConfig.stack = 'total';
        }

        // 气泡图特殊处理，设置气泡大小
        if (config.chartType === 'bubbleTrajectory') {
            seriesConfig.symbolSize = function (val) {
                return Math.abs(val) * 2 + 10;
            };
        }
        
        option.series.push(seriesConfig);
    });

    // 标记线
    if (config.specialConfig && config.specialConfig.markLines) {
        option.markLine = {
            data: [],
            silent: false,
            lineStyle: { width: 1.5, type: 'dashed' },
            label: { fontSize: 11 }
        };
        config.specialConfig.markLines.forEach(line => {
            if (line.y !== undefined) {
                option.markLine.data.push({yAxis: line.y, name: line.label});
            }
            if (line.x !== undefined) {
                option.markLine.data.push({xAxis: line.x, name: line.label});
            }
        });
    }

    return option;
}

// 独立函数：渲染分析结论卡片（在最上方）
async function renderAnalysisCards(container, config, currentGroup, currentCompany) {
    console.log('>>> renderAnalysisCards called, currentGroup=', currentGroup, 'currentCompany=', currentCompany);
    try {
        const analysisResponse = await fetch('./analysis/' + currentGroup + '.json');
        console.log('>>> analysisResponse=', analysisResponse);
        let analysisData = await analysisResponse.json();
        console.log('>>> analysisData=', analysisData);
        const companyName = PRESET_COMPANIES.find(c => c.ts_code === currentCompany)?.name;
        console.log('>>> companyName=', companyName);
        
        // 兼容三种数据格式
        let companyAnalysis = null;
        console.log('>>> analysisData format=', Array.isArray(analysisData) ? 'array' : 'object');
        if (Array.isArray(analysisData)) {
            const foundByCompany = analysisData.find(item => item.company === companyName);
            const foundByName = analysisData.find(item => item.name === companyName);
            console.log('>>> foundByCompany=', foundByCompany, 'foundByName=', foundByName);
            if (foundByCompany) {
                companyAnalysis = foundByCompany;
            } else if (foundByName) {
                companyAnalysis = foundByName;
            }
        } else {
            console.log('>>> analysisData[companyName]=', analysisData[companyName]);
            if (companyName && analysisData[companyName]) {
                companyAnalysis = analysisData[companyName];
            }
        }
        
        console.log('>>> companyAnalysis=', companyAnalysis);
        if (!companyAnalysis) {
            console.log('>>> companyAnalysis not found, return');
            return;
        }
        
        // 注意：因为用insertBefore插到最前面，所以要反过来顺序：先加数据解读，再加核心结论
        
        // 创建数据解读卡片
        const interpretationCardWrapper = document.createElement('div');
        interpretationCardWrapper.style.marginBottom = '20px';
        
        const interpretationTitle = document.createElement('h3');
        interpretationTitle.textContent = '数据解读 (' + config.groupName + ') - ' + companyName;
        interpretationTitle.style.fontSize = '16px';
        interpretationTitle.style.marginBottom = '12px';
        interpretationTitle.style.color = '#2E7D32';
        interpretationCardWrapper.appendChild(interpretationTitle);
        
        const interpretationContent = document.createElement('div');
        interpretationContent.style.padding = '16px';
        interpretationContent.style.background = '#f5fff5';
        interpretationContent.style.borderRadius = '8px';
        interpretationContent.style.borderLeft = '4px solid #2E7D32';
        
        // 添加直接结论
        if (companyAnalysis.direct_conclusions && companyAnalysis.direct_conclusions.length > 0) {
            const directSection = document.createElement('div');
            directSection.style.marginBottom = '12px';
            const directHeader = document.createElement('div');
            directHeader.style.fontWeight = 'bold';
            directHeader.style.fontSize = '14px';
            directHeader.style.color = '#1E88E5';
            directHeader.style.marginBottom = '8px';
            directHeader.textContent = '• 直接结论';
            directSection.appendChild(directHeader);
            
            const directList = document.createElement('ul');
            directList.style.paddingLeft = '20px';
            directList.style.margin = '0';
            companyAnalysis.direct_conclusions.forEach(conc => {
                const li = document.createElement('li');
                li.style.fontSize = '13px';
                li.style.lineHeight = '1.6';
                li.style.color = '#444';
                li.style.marginBottom = '6px';
                li.textContent = conc;
                directList.appendChild(li);
            });
            directSection.appendChild(directList);
            interpretationContent.appendChild(directSection);
        }
        
        // 添加间接结论
        if (companyAnalysis.indirect_conclusions && companyAnalysis.indirect_conclusions.length > 0) {
            const indirectSection = document.createElement('div');
            const indirectHeader = document.createElement('div');
            indirectHeader.style.fontWeight = 'bold';
            indirectHeader.style.fontSize = '14px';
            indirectHeader.style.color = '#FF9800';
            indirectHeader.style.marginBottom = '8px';
            indirectHeader.textContent = '• 间接结论';
            indirectSection.appendChild(indirectHeader);
            
            const indirectList = document.createElement('ul');
            indirectList.style.paddingLeft = '20px';
            indirectList.style.margin = '0';
            companyAnalysis.indirect_conclusions.forEach(conc => {
                const li = document.createElement('li');
                li.style.fontSize = '13px';
                li.style.lineHeight = '1.6';
                li.style.color = '#444';
                li.style.marginBottom = '6px';
                li.textContent = conc;
                indirectList.appendChild(li);
            });
            indirectSection.appendChild(indirectList);
            interpretationContent.appendChild(indirectSection);
        }
        
        interpretationCardWrapper.appendChild(interpretationContent);
        container.appendChild(interpretationCardWrapper);
        
        // 创建核心结论卡片
        const coreCardWrapper = document.createElement('div');
        coreCardWrapper.style.marginBottom = '20px';
        
        const coreTitle = document.createElement('h3');
        coreTitle.textContent = '核心结论 (' + config.groupName + ') - ' + companyName;
        coreTitle.style.fontSize = '16px';
        coreTitle.style.marginBottom = '12px';
        coreTitle.style.color = '#1E88E5';
        coreCardWrapper.appendChild(coreTitle);
        
        const coreContent = document.createElement('div');
        coreContent.style.padding = '16px';
        coreContent.style.background = 'linear-gradient(135deg, #f0f7ff 0%, #e3f2fd 100%)';
        coreContent.style.borderRadius = '8px';
        coreContent.style.borderLeft = '4px solid #1E88E5';
        coreContent.style.fontSize = '14px';
        coreContent.style.lineHeight = '1.6';
        coreContent.style.color = '#333';
        coreContent.textContent = companyAnalysis.core_conclusion;
        coreCardWrapper.appendChild(coreContent);
        
        container.appendChild(coreCardWrapper);
        
    } catch (e) {
        console.log('没有找到' + currentGroup + '的分析数据:', e.message);
    }
}

// 渲染当前选中公司和指标组的图表
async function renderCurrentCharts() {
    console.log('>>> renderCurrentCharts started, currentCompany=', currentCompany, 'currentGroup=', currentGroup);
    if (!currentCompany || !currentGroup) {
        console.log('>>> early return: missing company or group');
        return;
    }

    const container = document.getElementById('charts-container');
    container.innerHTML = '';

    let config = null; // 提前声明，确保作用域覆盖整个函数

    try {
        console.log('>>> Loading config...');
        // 加载配置
        const configResponse = await fetch(CONFIG_BASE_URL + currentGroup + '.json');
        config = await configResponse.json();
        console.log('>>> Loaded config,', config.charts.length, 'charts');
        config.charts.forEach((c, i) => {
            console.log('  chart', i, 'type=', c.chartType);
        });

        // 加载数据
        const dataResponse = await fetch(DATA_BASE_URL + currentGroup + '.csv');
        const dataText = await dataResponse.text();
        const data = parseCsv(dataText);

        // 过滤选中公司的数据
        const selectedCompanyData = filterCompanyData(data, currentCompany);
        console.log('过滤后数据行数:', selectedCompanyData.length);

        // ========== 关键修复：先检查是不是7.26/7.31/7.32/7.43等dashboard类型 ==========
        // 这些dashboard类型自己会处理布局，不需要我们提前设置grid布局（grid布局就是灰色背景的来源！）
        if (currentGroup === '7.26' && typeof build726Dashboard === 'function') {
            console.log('>>> IF match 7.26 dashboard, using dedicated 7.26 builder (BEFORE layout)');
            await build726Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.31' && typeof build731Dashboard === 'function') {
            console.log('>>> IF match 7.31 dashboard, using dedicated 7.31 builder (BEFORE layout)');
            await build731Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.32' && typeof build732Dashboard === 'function') {
            console.log('>>> IF match 7.32 dashboard, using dedicated 7.32 builder (BEFORE layout)');
            await build732Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.43' && typeof build743Dashboard === 'function') {
            console.log('>>> IF match 7.43 dashboard, using dedicated 7.43 builder (BEFORE layout)');
            await build743Dashboard(container, config, selectedCompanyData, data, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.41' && typeof build741Dashboard === 'function') {
            console.log('>>> IF match 7.41 dashboard, using dedicated 7.41 builder (BEFORE layout)');
            await build741Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.42' && typeof build742Dashboard === 'function') {
            console.log('>>> IF match 7.42 dashboard, using dedicated 7.42 builder (BEFORE layout)');
            await build742Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.44' && typeof build744Dashboard === 'function') {
            console.log('>>> IF match 7.44 dashboard, using dedicated 7.44 builder (BEFORE layout)');
            await build744Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.52' && typeof build752Dashboard === 'function') {
            console.log('>>> IF match 7.52 dashboard, using dedicated 7.52 builder (BEFORE layout)');
            await build752Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            return; // 直接返回，不进循环
        }
        if (currentGroup === '7.53' && typeof build753Dashboard === 'function') {
            console.log('>>> IF match 7.53 dashboard, using dedicated 7.53 builder (BEFORE layout)');
            try {
                await build753Dashboard(container, config, selectedCompanyData, currentGroup, currentCompany);
            } catch (e) {
                console.error('7.53 dashboard error:', e);
            }
            return; // 直接返回，不进循环
        }


        // 根据配置决定布局（只有非dashboard类型才设置grid布局）
        if (config.layout === 'grid2x2' && config.charts.length === 4) {
            // 2x2网格布局
            container.style.display = 'grid';
            container.style.gridTemplateColumns = '1fr 1fr';
            container.style.gap = '20px';
            container.style.gridTemplateRows = 'auto auto';
        } else {
            // 默认单列布局
            container.style.display = 'grid';
            container.style.gridTemplateColumns = '1fr';
            container.style.gap = '20px';
        }
        
        // 对每个图表创建容器并渲染
        for (const [index, chartConfig] of config.charts.entries()) {
            const wrapper = document.createElement('div');
            const isSingle = config.charts.length === 1;
            const isCardType = chartConfig.chartType === 'cardDashboard' || 
                              chartConfig.chartType === 'assetStructureCardDashboard' || 
                              chartConfig.chartType === 'simpleDataCardDashboard';
            wrapper.className = 'chart-wrapper' + (isSingle ? ' single-chart' : '') + (isCardType ? ' card-wrapper' : '');
            
            // 设置图表高度，2x2布局时使用较小高度
            if (config.layout === 'grid2x2' && config.charts.length === 4) {
                wrapper.style.height = '350px'; // 2x2布局时较小高度
            } else {
                wrapper.style.width = '100%';
            }
            
            const title = document.createElement('h3');
            title.textContent = chartConfig.title + ' (' + config.groupName + ') - ' + currentCompany;
            title.style.fontSize = '14px'; // 2x2布局时标题较小
            title.style.marginBottom = '10px';
            wrapper.appendChild(title);
            const chartDiv = document.createElement('div');
            chartDiv.className = 'chart';
            chartDiv.id = 'chart-' + index;
            
            // 设置图表div高度
            if (config.layout === 'grid2x2' && config.charts.length === 4) {
                chartDiv.style.height = '280px'; // 2x2布局时较小高度
            } else {
                chartDiv.style.height = '500px';
            }
            
            wrapper.appendChild(chartDiv);
            container.appendChild(wrapper);

            // 为每个图表加载单独的数据文件
            let chartData = selectedCompanyData;
            if (chartConfig.csvFile && chartConfig.csvFile !== currentGroup + '.csv') {
                console.log('>>> Loading separate CSV for chart', index, ':', chartConfig.csvFile);
                try {
                    const chartDataResponse = await fetch(DATA_BASE_URL + chartConfig.csvFile);
                    const chartDataText = await chartDataResponse.text();
                    const chartRawData = parseCsv(chartDataText);
                    chartData = filterCompanyData(chartRawData, currentCompany);
                    console.log('  Filtered chart data rows:', chartData.length);
                } catch (e) {
                    console.error('  Failed to load separate CSV, using default:', e.message);
                }
            }

            // 初始化ECharts - 高清渲染，解决模糊问题
            const chart = echarts.init(chartDiv, null, {
                renderer: 'canvas',
                devicePixelRatio: Math.max(window.devicePixelRatio || 2, 2), // 至少2倍分辨率
                antialias: true // 开启抗锯齿
            });
            let option = {
                tooltip: {},
                xAxis: {},
                yAxis: [],
                series: [],
                graphic: []
            };

            // 根据图表类型构建option
            window.lastChartIndex = index; // 供表格函数获取当前索引
            
            // ========== 特殊处理：商誉仪表盘直接渲染自定义布局 ==========
            if (chartConfig.chartType === 'goodwillDashboard' && typeof buildGoodwillDashboard === 'function') {
                console.log('>>> IF match goodwillDashboard, using dedicated dashboard builder');
                buildGoodwillDashboard(wrapper, chartConfig, chartData);
                continue; // 跳过后续ECharts渲染逻辑
            }

            // ========== 特殊处理：卡片仪表板直接渲染自定义布局 ==========
            if (chartConfig.chartType === 'cardDashboard' && typeof buildCardDashboard === 'function') {
                console.log('>>> IF match cardDashboard, using dedicated card dashboard builder');
                buildCardDashboard(wrapper, chartConfig, chartData);
                continue; // 跳过后续ECharts渲染逻辑
            }

            // ========== 特殊处理：资产结构卡片仪表板直接渲染自定义布局 ==========
            if (chartConfig.chartType === 'assetStructureCardDashboard' && typeof buildAssetStructureCardDashboard === 'function') {
                console.log('>>> IF match assetStructureCardDashboard, using dedicated card dashboard builder');
                buildAssetStructureCardDashboard(wrapper, chartConfig, chartData);
                continue; // 跳过后续ECharts渲染逻辑
            }

            // ========== 特殊处理：简单数据卡片仪表板直接渲染自定义布局 ==========
            if (chartConfig.chartType === 'simpleDataCardDashboard' && typeof buildSimpleDataCardDashboard === 'function') {
                console.log('>>> IF match simpleDataCardDashboard, using dedicated card dashboard builder');
                buildSimpleDataCardDashboard(wrapper, chartConfig, chartData);
                continue; // 跳过后续ECharts渲染逻辑
            }

            // ========== 特殊处理：表格类型直接渲染HTML表格，绕过ECharts渲染问题 ==========
            if (chartConfig.chartType.toLowerCase().includes('table')) {
                console.log('>>> 检测到表格类型，直接渲染HTML表格');
                // 第一步：计算衍生指标（和专用函数逻辑完全一致）
                const processedData = chartData.map(row => {
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

                    return {
                        ...row,
                        operating_symbol,
                        investing_symbol,
                        financing_symbol,
                        cashflow_portrait,
                        life_cycle
                    };
                })
                // 过滤掉2013年的数据
                .filter(row => parseInt(row.year) !== 2013);

                // 第二步：生成HTML表格，适配图表卡片尺寸
                const tableHtml = `
                    <div style="padding: 10px; background: white; border-radius: 8px; max-height: 450px; overflow-y: auto;">
                        <h3 style="text-align: center; margin: 0 0 10px 0; font-size: 16px;">${chartConfig.title || '现金流肖像与生命周期'}</h3>
                        <table border="1" cellpadding="6" cellspacing="0" style="width: 100%; border-collapse: collapse; font-size: 12px; table-layout: fixed;">
                            <thead>
                                <tr style="background: #1E88E5; color: white;">
                                    <th style="width: 14%; padding: 6px; text-align: center; font-size: 12px;">年份</th>
                                    <th style="width: 18%; padding: 6px; text-align: center; font-size: 12px;">经营性现金流</th>
                                    <th style="width: 18%; padding: 6px; text-align: center; font-size: 12px;">投资性现金流</th>
                                    <th style="width: 18%; padding: 6px; text-align: center; font-size: 12px;">筹资性现金流</th>
                                    <th style="width: 32%; padding: 6px; text-align: center; font-size: 12px;">生命周期</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${processedData.sort((a,b) => parseInt(a.year) - parseInt(b.year)).map(row => {
                                    const lifeCycleColor = {
                                        '成长期': '#d1fae5',
                                        '成熟期': '#dbeafe',
                                        '衰退期': '#fee2e2',
                                        '特殊': '#fef3c7',
                                        '未知': '#f3f4f6'
                                    }[row.life_cycle] || '#f3f4f6';

                                    return `
                                    <tr style="border-bottom: 1px solid #eee;">
                                        <td style="padding: 6px; text-align: center; font-size: 12px;">${row.year}</td>
                                        <td style="padding: 6px; text-align: center; color: ${row.operating_symbol === '+' ? '#2E7D32' : '#f44336'}; font-size: 12px;">
                                            ${row.operating_symbol} ${(Math.abs(row.n_cashflow_operating)/10000).toFixed(1)}亿
                                        </td>
                                        <td style="padding: 6px; text-align: center; color: ${row.investing_symbol === '+' ? '#FF9800' : '#f44336'}; font-size: 12px;">
                                            ${row.investing_symbol} ${(Math.abs(row.n_cashflow_investing)/10000).toFixed(1)}亿
                                        </td>
                                        <td style="padding: 6px; text-align: center; color: ${row.financing_symbol === '+' ? '#1E88E5' : '#f44336'}; font-size: 12px;">
                                            ${row.financing_symbol} ${(Math.abs(row.n_cashflow_financing)/10000).toFixed(1)}亿
                                        </td>
                                        <td style="padding: 6px; text-align: center; background: ${lifeCycleColor}; font-weight: 500; font-size: 12px;">
                                            ${row.life_cycle}
                                        </td>
                                    </tr>
                                    `;
                                }).join('')}
                            </tbody>
                        </table>
                    </div>
                `;

                // 第三步：替换ECharts容器为HTML表格
                chartDiv.innerHTML = tableHtml;
                continue; // 跳过后续ECharts渲染逻辑
            }

            // ========== 非表格类型走原有ECharts渲染逻辑 ==========
            let useDefault = false;
            // 优先匹配专用图表构建函数，增加函数存在性判断，避免未定义错误
            try {
                if (chartConfig.chartType === 'bubbleTrajectory' && typeof buildBubbleTrajectoryOption === 'function') {
                    console.log('>>> IF match bubbleTrajectory, using dedicated builder');
                    option = buildBubbleTrajectoryOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'structuralRoe' && typeof buildStructuralRoeOption === 'function') {
                    console.log('>>> IF match structuralRoe, using dedicated builder');
                    option = buildStructuralRoeOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'multiLineColor' && typeof buildMultiLineColorOption === 'function') {
                    console.log('>>> IF match multiLineColor, using dedicated builder');
                    option = buildMultiLineColorOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'cashflowLifeCycleTable' && typeof buildCashflowLifeCycleTable === 'function') {
                    console.log('>>> IF match cashflowLifeCycleTable, using dedicated builder');
                    option = buildCashflowLifeCycleTable(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'dualAxis726Special' && typeof build726SpecialDualAxisOption === 'function') {
                    console.log('>>> IF match dualAxis726Special, using dedicated 7.26 builder');
                    try {
                        option = build726SpecialDualAxisOption(option, chartConfig, chartData);
                    } catch (e) {
                        console.error('>>> 7.26 dualAxis函数执行报错：', e.stack);
                        useDefault = true;
                    }
                } else if (chartConfig.chartType === 'dualAxis' && typeof buildDualAxisOption === 'function') {
                    console.log('>>> IF match dualAxis, using dedicated builder');
                    try {
                        option = buildDualAxisOption(option, chartConfig, chartData);
                    } catch (e) {
                        console.error('>>> dualAxis函数执行报错：', e.stack);
                        useDefault = true;
                    }
                } else if ((chartConfig.chartType === 'coreProfit' || chartConfig.chartType === 'dualAxis') && typeof buildCoreProfitOption === 'function') {
                    console.log('>>> IF match coreProfit/dualAxis (7.21), using dedicated builder');
                    try {
                        option = buildCoreProfitOption(option, chartConfig, chartData);
                        console.log('>>> 7.21返回的option结构：', JSON.stringify(option, null, 2));
                    } catch (e) {
                        console.error('>>> 7.21函数执行报错：', e.stack);
                        useDefault = true;
                    }
                } else if ((chartConfig.chartType === 'barrierEfficiency' || chartConfig.chartType === 'dualAxisLine') && typeof buildBarrierEfficiencyOption === 'function') {
                    console.log('>>> IF match barrierEfficiency/dualAxisLine (7.22), using dedicated builder');
                    try {
                        option = buildBarrierEfficiencyOption(option, chartConfig, chartData);
                        console.log('>>> 7.22返回的option结构：', JSON.stringify(option, null, 2));
                    } catch (e) {
                        console.error('>>> 7.22函数执行报错：', e.stack);
                        useDefault = true;
                    }
                } else if (chartConfig.chartType === 'cashConversionCombo' && typeof buildCashConversionComboOption === 'function') {
                    console.log('>>> IF match cashConversionCombo, using dedicated builder');
                    option = buildCashConversionComboOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'cashflowStructure' && typeof buildCashflowStructureOption === 'function') {
                    console.log('>>> IF match cashflowStructure, using dedicated builder');
                    option = buildCashflowStructureOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'duPontFactors' && typeof buildDuPontFactorsOption === 'function') {
                    console.log('>>> IF match duPontFactors, using dedicated builder');
                    option = buildDuPontFactorsOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'cashflowBarChart' && (typeof buildCashflowBarChartOption === 'function' || typeof buildCashflowBarChartOptionEnhanced === 'function')) {
                    console.log('>>> IF match cashflowBarChart, using dedicated builder');
                    if (typeof buildCashflowBarChartOptionEnhanced === 'function') {
                        option = buildCashflowBarChartOptionEnhanced(option, chartConfig, chartData);
                    } else {
                        option = buildCashflowBarChartOption(option, chartConfig, chartData);
                    }
                } else if (chartConfig.chartType === 'stackedBar' && typeof buildStackedBarOption === 'function') {
                    console.log('>>> IF match stackedBar, using dedicated builder');
                    option = buildStackedBarOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'groupedBar' && typeof buildGroupedBarOption === 'function') {
                    console.log('>>> IF match groupedBar, using dedicated builder');
                    option = buildGroupedBarOption(option, chartConfig, chartData);
                } else if (chartConfig.chartType === 'multiLine' && typeof buildMultiLineOption === 'function') {
                    console.log('>>> IF match multiLine, using dedicated builder');
                    option = buildMultiLineOption(option, chartConfig, chartData);
                } else if (chartConfig.groupId === '7.41' && typeof build741GridOption === 'function') {
                    console.log('>>> IF match 7.41 grid layout, using dedicated builder');
                    option = build741GridOption(option, chartConfig, chartData);
                } else {
                    useDefault = true;
                }

                // 校验option是否有效，无效则降级到默认
                const isTableType = chartConfig.chartType.toLowerCase().includes('table');
                // 表格类型完全跳过校验，直接使用专用函数返回的配置
                if (isTableType) {
                    console.log('>>> 表格类型，完全跳过校验，使用专用函数配置');
                    useDefault = false;
                } else {
                    const hasValidSeries = option && option.series && Array.isArray(option.series);
                    if (!option || !hasValidSeries) {
                        console.warn('⚠️ 专用函数返回无效option，自动降级到默认构建');
                        useDefault = true;
                    }
                }
            } catch (e) {
                console.error('❌ 专用构建函数执行失败，自动降级到默认构建:', e.message);
                useDefault = true;
            }

            if (useDefault) {
                // 所有异常情况都走默认逻辑，100%不会报错
                console.log('>>> Using default builder for type:', chartConfig.chartType);
                option = buildDefaultOption(option, chartConfig, chartData);
            }

            // 终极容错：如果setOption依然报错，直接重新生成默认配置再试一次
            try {
                chart.setOption(option);
            } catch (e) {
                console.error('❌ setOption失败，强制使用默认配置:', e.message);
                option = buildDefaultOption({}, chartConfig, chartData);
                chart.setOption(option);
            }

            // 响应resize
            window.addEventListener('resize', () => {
                chart.resize();
            });
        }

    } catch (e) {
        console.error('加载配置或数据失败', e);
        console.error('Error message:', e.message);
    }

    // ========== 普通指标组：最后渲染分析结论卡片到最上面 ==========
    const isDashboardGroup = ['7.26', '7.31', '7.32', '7.41', '7.42', '7.43', '7.44', '7.52', '7.53'].includes(currentGroup);
    if (!isDashboardGroup) {
        console.log('>>> 普通指标组，最后渲染分析结论卡片到最上面');
        const tempDiv = document.createElement('div');
        await renderAnalysisCards(tempDiv, config, currentGroup, currentCompany);
        
        // 把tempDiv里的所有元素插到container最前面
        while (tempDiv.firstChild) {
            container.insertBefore(tempDiv.firstChild, container.firstChild);
        }
    }
}

// CSV解析 - GBK编码已经在fetch时处理过了，这里只需要解析
function parseCsv(text) {
    const lines = text.split('\n').filter(line => line.trim());
    let header = lines[0].split(',').map(h => h.trim().replace(/^"/, '').replace(/"$/, ''));
    
    // 检查是否需要调整列顺序：如果第一列是company而不是ts_code
    const firstCol = header[0].toLowerCase();
    if (firstCol === 'company' && header.length >= 3) {
        // 对于有company列的CSV（如7.43），保留原始表头
        console.log('检测到company列，保留原始CSV表头');
    } else {
        // 对于标准格式CSV，前三列固定: ts_code, name, year
        console.log('使用标准CSV格式，前三列设为ts_code, name, year');
        header[0] = 'ts_code';
        header[1] = 'name';
        header[2] = 'year';
    }
    
    // 修复7.51 CSV表头乱码问题
    if (header.length >= 5 && header[3] && header[3].includes('����')) {
        header[3] = '内生资金占比(%)';
        header[4] = '外生资金占比(%)';
    }

    const result = [];
    lines.slice(1).forEach(line => {
        const cols = line.split(',').map(c => c.trim().replace(/^"/, '').replace(/"$/, ''));
        const obj = {};
        header.forEach((h, i) => {
            if (cols[i] !== undefined) {
                obj[h] = cols[i] || '';
                if (h !== 'ts_code' && h !== 'name' && h !== 'year' && !isNaN(parseFloat(obj[h])) && obj[h] !== '') {
                    obj[h] = parseFloat(obj[h]);
                }
            }
        });
        // 如果ts_code不存在，从第一列获取
        if (!obj['ts_code'] && cols[0] !== undefined) {
            obj['ts_code'] = cols[0];
        }
        // 补齐ts_code前缀零 - 只有字符串类型才需要处理
        if (typeof obj['ts_code'] === 'string' && obj['ts_code'] && !isNaN(parseInt(obj['ts_code'].split('.')[0]))) {
            const codeWithoutSuffix = obj['ts_code'].split('.')[0].padStart(6, '0');
            if (!obj['ts_code'].includes('.') && codeWithoutSuffix.length < 6) {
                obj['ts_code'] = parseInt(codeWithoutSuffix).toString().padStart(6, '0');
                if (obj['ts_code'].length === 6 && obj['ts_code'][0] === '6') {
                    obj['ts_code'] += '.SH';
                } else if (obj['ts_code'].length === 6) {
                    obj['ts_code'] += '.SZ';
                }
            }
        }
        result.push(obj);
    });

    console.log('CSV解析完成，总行数:', result.length);
    return result;
}

// 按公司过滤数据
function filterCompanyData(data, ts_code) {
    // ts_code可能带后缀.SH/.SZ，需要兼容
    const selectedNum = parseInt(ts_code);
    const selectedCodeNoSuffix = ts_code.split('.')[0].padStart(6, '0');
    console.log(`Filtering for ts_code=${ts_code}, selectedNum=${selectedNum}, selectedCodeNoSuffix=${selectedCodeNoSuffix}, data total rows=${data.length}`);
    const result = data.filter(row => {
        // 强制转换为字符串处理
        const rowTsCode = String(row.ts_code || '');
        const rowCodeNoSuffix = rowTsCode.split('.')[0].padStart(6, '0');
        // 只要数字部分匹配就算匹配成功
        const match = parseInt(rowCodeNoSuffix) === selectedNum || rowCodeNoSuffix === selectedCodeNoSuffix;
        if (match) {
            console.log(`  ✓ match: rowCode=${rowTsCode} -> ${rowCodeNoSuffix} matches ${selectedCodeNoSuffix}`);
        }
        return match;
    });
    console.log(`Filter done, found ${result.length} rows`);
    return result;
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    init();
});
