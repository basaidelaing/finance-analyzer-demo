// content-analysis.js - AI分析模块
// 文件大小: <10KB

/**
 * AI分析模块 - 负责AI分析数据获取和处理
 */

/**
 * 获取AI分析数据
 */
export async function fetchAIAnalysis(company) {
    if (!company) {
        throw new Error('公司不能为空');
    }
    
    const url = `http://localhost:8001/api/analysis/${company.ts_code}`;
    console.log('获取AI分析:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`AI分析API错误: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('AI分析数据:', data);
    return data;
}

/**
 * 获取指标interpretation框架
 */
export async function fetchIndicatorInterpretation(indicator) {
    console.log('获取指标interpretation框架:', indicator.code);
    
    try {
        // 尝试从JSON文件加载interpretation
        const indicatorCode = indicator.code;
        
        // 构建JSON文件路径（暂时使用硬编码数据）
        const jsonPath = `/data/definitions/indicators_standard-corrected/${indicatorCode}.json`;
        console.log('尝试加载JSON文件（可能不存在）:', jsonPath);
        
        const response = await fetch(jsonPath);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data && data[indicatorCode]) {
                const indicatorData = data[indicatorCode];
                const interpretation = indicatorData.interpretation || {};
                
                console.log('成功加载JSON interpretation:', interpretation);
                
                return {
                    code: indicatorCode,
                    name: indicatorData.name || indicator.name,
                    interpretation: interpretation,
                    charts: indicatorData.charts || [],
                    calculation_logic: indicatorData.calculation_logic || {}
                };
            }
        }
        
        // 如果JSON加载失败，使用硬编码数据
        console.log('JSON加载失败，使用硬编码数据');
        return getHardcodedInterpretation(indicatorCode, indicator.name);
        
    } catch (error) {
        console.error('加载interpretation失败:', error);
        return getHardcodedInterpretation(indicator.code, indicator.name);
    }
}

/**
 * 硬编码的interpretation数据（fallback）
 */
export function getHardcodedInterpretation(indicatorCode, indicatorName = '') {
    // 硬编码的interpretation数据（fallback）
    const interpretations = {
        '7.11': {
            core_interpretation: "核心利润反映公司主营业务盈利能力，排除投资收益、政府补助等非经常性项目影响。",
            thresholds: {
                excellent: "核心利润率 > 20% (主营业务盈利能力强，具备强竞争力)",
                good: "核心利润率 10%-20% (主营业务盈利能力良好，处于健康水平)",
                warning: "核心利润率 5%-10% (主营业务盈利能力一般，面临竞争压力)",
                critical: "核心利润率 < 5% (主营业务盈利能力弱，需关注经营风险)"
            }
        },
        '7.12': {
            core_interpretation: "诊断盈利根基。健康结构以核心利润为稳定高占比支柱。杂项收益占比高则盈利波动大、可持续性存疑。",
            ai_analysis_reference: {
                analysis_framework: "利润结构稳定性分析框架",
                typical_patterns: {
                    healthy: {
                        name: "健康稳健型",
                        characteristics: ["核心利润占比>70%", "其他收益占比<25%", "杂项收益占比<10%", "结构稳定连续3年以上"]
                    },
                    policy_driven: {
                        name: "政策驱动型",
                        characteristics: ["其他收益占比>30%", "与政府补贴/税收优惠高度相关", "核心利润占比波动大"]
                    },
                    investment_driven: {
                        name: "投资驱动/波动型",
                        characteristics: ["杂项收益占比>15%", "与投资收益/公允价值变动相关", "盈利波动性高"]
                    },
                    weak_foundation: {
                        name: "根基薄弱型",
                        characteristics: ["核心利润占比<50%", "结构频繁变动", "盈利可持续性存疑"]
                    }
                }
            }
        },
        '7.13': {
            core_interpretation: "分析资产结构对收益的贡献，识别结构性盈利优势。",
            thresholds: {
                excellent: "结构性收益比率 > 1.5 (资产结构优化，盈利效率高)",
                good: "结构性收益比率 1.0-1.5 (资产结构合理，盈利效率正常)",
                warning: "结构性收益比率 0.7-1.0 (资产结构有待优化)",
                critical: "结构性收益比率 < 0.7 (资产结构不合理，影响盈利)"
            }
        },
        '7.14': {
            core_interpretation: "评估经营资产轻重结构，识别资产虚化风险。",
            thresholds: {
                excellent: "轻资产指数 > 0.7 (资产结构轻盈，运营效率高)",
                good: "轻资产指数 0.5-0.7 (资产结构合理)",
                warning: "轻资产指数 0.3-0.5 (资产偏重，效率待提升)",
                critical: "轻资产指数 < 0.3 (资产过重，运营压力大)"
            }
        },
        '7.21': {
            core_interpretation: "衡量利润转化为现金的能力，反映盈利质量。",
            thresholds: {
                excellent: "获现率 > 1.2 (利润质量优秀，现金回收能力强)",
                good: "获现率 0.8-1.2 (利润质量良好，现金回收正常)",
                warning: "获现率 0.5-0.8 (利润质量一般，现金回收偏弱)",
                critical: "获现率 < 0.5 (利润质量差，现金回收困难)"
            }
        },
        '7.31': {
            core_interpretation: "分析造血与输血结构，评估现金流健康度。",
            thresholds: {
                excellent: "造血占比 > 80% (现金流健康，内生增长强)",
                good: "造血占比 60%-80% (现金流良好)",
                warning: "造血占比 40%-60% (依赖外部输血)",
                critical: "造血占比 < 40% (现金流紧张，依赖性强)"
            }
        },
        '7.41': {
            core_interpretation: "评估重构后经营资产运营效率。",
            thresholds: {
                excellent: "周转率 > 2.0 (运营效率优秀)",
                good: "周转率 1.0-2.0 (运营效率良好)",
                warning: "周转率 0.5-1.0 (运营效率一般)",
                critical: "周转率 < 0.5 (运营效率低下)"
            }
        },
        '7.51': {
            core_interpretation: "分析结构性净资产收益能力。",
            thresholds: {
                excellent: "结构性ROE > 15% (股东回报优秀)",
                good: "结构性ROE 10%-15% (股东回报良好)",
                warning: "结构性ROE 5%-10% (股东回报一般)",
                critical: "结构性ROE < 5% (股东回报不足)"
            }
        }
    };
    
    const interpretation = interpretations[indicatorCode] || {
        core_interpretation: `指标 ${indicatorCode} ${indicatorName ? `(${indicatorName})` : ''}的分析框架`,
        thresholds: {
            excellent: "优秀",
            good: "良好",
            warning: "警告",
            critical: "危险"
        }
    };
    
    return {
        code: indicatorCode,
        name: indicatorName || `指标 ${indicatorCode}`,
        interpretation: interpretation
    };
}

/**
 * 获取所有维度7指标的硬编码interpretation
 * 用于批量扩展其他指标
 */
export function getAllDimension7Interpretations() {
    const interpretations = {};
    
    // 盈利能力指标 (7.1x)
    for (let i = 11; i <= 15; i++) {
        const code = `7.${i}`;
        if (!interpretations[code]) {
            interpretations[code] = {
                core_interpretation: `盈利能力指标 ${code} 分析框架`,
                thresholds: {
                    excellent: "优秀水平",
                    good: "良好水平",
                    warning: "警告水平",
                    critical: "危险水平"
                }
            };
        }
    }
    
    // 成长能力指标 (7.2x)
    for (let i = 21; i <= 25; i++) {
        const code = `7.${i}`;
        if (!interpretations[code]) {
            interpretations[code] = {
                core_interpretation: `成长能力指标 ${code} 分析框架`,
                thresholds: {
                    excellent: "高速成长",
                    good: "稳定成长",
                    warning: "成长放缓",
                    critical: "成长停滞"
                }
            };
        }
    }
    
    // 运营效率指标 (7.3x)
    for (let i = 31; i <= 33; i++) {
        const code = `7.${i}`;
        if (!interpretations[code]) {
            interpretations[code] = {
                core_interpretation: `运营效率指标 ${code} 分析框架`,
                thresholds: {
                    excellent: "效率优秀",
                    good: "效率良好",
                    warning: "效率一般",
                    critical: "效率低下"
                }
            };
        }
    }
    
    // 财务稳健指标 (7.4x)
    for (let i = 41; i <= 44; i++) {
        const code = `7.${i}`;
        if (!interpretations[code]) {
            interpretations[code] = {
                core_interpretation: `财务稳健指标 ${code} 分析框架`,
                thresholds: {
                    excellent: "非常稳健",
                    good: "较为稳健",
                    warning: "存在风险",
                    critical: "风险较高"
                }
            };
        }
    }
    
    // 估值水平指标 (7.5x)
    for (let i = 51; i <= 53; i++) {
        const code = `7.${i}`;
        if (!interpretations[code]) {
            interpretations[code] = {
                core_interpretation: `估值水平指标 ${code} 分析框架`,
                thresholds: {
                    excellent: "估值合理",
                    good: "估值适中",
                    warning: "估值偏高",
                    critical: "估值过高"
                }
            };
        }
    }
    
    return interpretations;
}

/**
 * 格式化AI分析数据用于显示
 */
export function formatAnalysisData(analysisData, indicatorData) {
    console.log('格式化分析数据:', { analysisData, indicatorData });
    
    if (!analysisData || !analysisData.found) {
        return {
            html: `
                <div style="padding: 15px; background: #fff3cd; border-radius: 6px; border: 1px solid #ffeaa7;">
                    <h4 style="color: #856404; margin-top: 0;">⚠️ AI分析暂不可用</h4>
                    <p>AI分析服务暂时无法提供详细分析。</p>
                    <p><small>基于指标 ${indicatorData?.code || 'N/A'} 的硬编码分析框架</small></p>
                </div>
            `
        };
    }
    
    const interpretation = indicatorData?.interpretation || {};
    const thresholds = interpretation.thresholds || {};
    
    return {
        html: `
            <div style="margin-bottom: 15px;">
                <h4 style="color: #2c5282; margin-top: 0;">📈 分析结果</h4>
                <p><strong>AI分析摘要:</strong> ${analysisData.analysis || '暂无详细分析'}</p>
                <p><strong>总结:</strong> ${analysisData.summary || '基于财务指标分析'}</p>
                ${analysisData.timestamp ? `<p><small>分析时间: ${analysisData.timestamp}</small></p>` : ''}
            </div>
            
            <div style="padding: 15px; background: #e8f6ef; border-radius: 6px; border: 1px solid #a3e9c4; margin-bottom: 15px;">
                <h5 style="color: #27ae60; margin-top: 0;">📋 指标解读框架</h5>
                <p><strong>核心解读:</strong> ${interpretation.core_interpretation || '基于财务指标的标准分析框架'}</p>
                
                ${Object.keys(thresholds).length > 0 ? `
                <div style="margin-top: 10px;">
                    <h6 style="color: #2c5282; margin-bottom: 5px;">阈值参考:</h6>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${Object.entries(thresholds).map(([level, desc]) => `
                            <li><strong>${level}:</strong> ${desc}</li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            
            ${analysisData.recommendations && analysisData.recommendations.length > 0 ? `
            <div style="padding: 15px; background: #fff8e1; border-radius: 6px; border: 1px solid #ffd54f;">
                <h5 style="color: #ff9800; margin-top: 0;">💡 建议</h5>
                <ul style="margin: 0; padding-left: 20px;">
                    ${analysisData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                </ul>
            </div>
            ` : ''}
        `
    };
}