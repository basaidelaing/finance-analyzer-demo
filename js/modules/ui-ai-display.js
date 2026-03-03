/**
 * AI分析显示模块 - 处理AI分析数据显示
 * 文件大小: <8KB
 */

class UIAIDisplay {
    constructor() {}

    /**
     * 更新AI分析内容
     */
    updateAIAnalysis(analysis) {
        const container = document.getElementById('aiAnalysisContent');
        if (!container) return;
        
        // 处理API返回的实际数据结构
        let analysisData = analysis;
        
        // 如果analysis是API响应对象，提取analysis_report_json
        if (analysis && typeof analysis === 'object') {
            // 检查是否是完整的API响应
            if (analysis.analysis && analysis.analysis.analysis_report_json) {
                analysisData = analysis.analysis.analysis_report_json;
            }
            // 检查是否直接是analysis_report_json
            else if (analysis.analysis_report_json) {
                analysisData = analysis.analysis_report_json;
            }
        }
        
        if (typeof analysisData === 'string') {
            // 如果是字符串，直接显示
            container.innerHTML = `
                <div class="ai-analysis-section">
                    <h4>📊 AI财务分析报告</h4>
                    <p>${analysisData}</p>
                </div>
            `;
        } else if (analysisData && typeof analysisData === 'object') {
            // 如果是对象，格式化显示
            const sections = [];
            
            // 标题部分
            sections.push(`
                <div class="ai-analysis-section">
                    <h4>📊 AI财务分析报告</h4>
                    <p style="color: var(--text-light); font-size: 0.9em;">
                        分析范围: ${analysis.analysis?.analysis_scope || '维度七指标'} | 
                        包含指标: ${analysis.analysis?.indicator_codes || '7.11,7.21'}
                    </p>
                </div>
            `);
            
            if (analysisData.summary) {
                sections.push(`
                    <div class="ai-analysis-section">
                        <h4>📋 分析摘要</h4>
                        <p>${analysisData.summary}</p>
                    </div>
                `);
            }
            
            // 支持key_findings字段（API实际返回的字段）
            if (analysisData.key_findings && analysisData.key_findings.length > 0) {
                sections.push(`
                    <div class="ai-analysis-section">
                        <h4>🔍 关键发现</h4>
                        <ul>
                            ${analysisData.key_findings.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                `);
            }
            // 也支持strengths字段（兼容旧格式）
            else if (analysisData.strengths && analysisData.strengths.length > 0) {
                sections.push(`
                    <div class="ai-analysis-section">
                        <h4>✅ 优势分析</h4>
                        <ul>
                            ${analysisData.strengths.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                `);
            }
            
            // 支持weaknesses字段
            if (analysisData.weaknesses && analysisData.weaknesses.length > 0) {
                sections.push(`
                    <div class="ai-analysis-section">
                        <h4>⚠️ 风险提示</h4>
                        <ul>
                            ${analysisData.weaknesses.map(w => `<li>${w}</li>`).join('')}
                        </ul>
                    </div>
                `);
            }
            
            // 投资建议卡片已移除
            
            // 如果没有找到任何分析内容
            if (sections.length <= 1) {
                sections.push(`
                    <div class="ai-analysis-section">
                        <p style="color: var(--text-light); text-align: center; padding: var(--space-xl);">
                            暂无详细分析内容
                        </p>
                    </div>
                `);
            }
            
            container.innerHTML = sections.join('');
        } else {
            // 无法解析的格式
            container.innerHTML = `
                <div class="ai-analysis-section">
                    <h4>📊 AI财务分析</h4>
                    <p style="color: var(--text-light); text-align: center; padding: var(--space-xl);">
                        分析数据格式无法解析
                    </p>
                </div>
            `;
        }
    }

    /**
     * 显示无AI分析数据
     */
    showNoAIAnalysis() {
        const container = document.getElementById('aiAnalysisContent');
        if (!container) return;
        
        container.innerHTML = `
            <div class="ai-analysis-section">
                <h4>AI财务分析</h4>
                <p style="color: var(--text-light); text-align: center; padding: var(--space-xl);">
                    暂无AI分析数据
                </p>
            </div>
        `;
    }

    /**
     * 显示AI分析错误
     */
    showAIAnalysisError(error) {
        const container = document.getElementById('aiAnalysisContent');
        if (container) {
            container.innerHTML = `
                <div class="ai-analysis-section">
                    <h4>❌ AI分析加载失败</h4>
                    <p style="color: var(--error-red);">${error}</p>
                    <p>请检查网络连接或稍后重试</p>
                </div>
            `;
        }
    }
}

export default UIAIDisplay;