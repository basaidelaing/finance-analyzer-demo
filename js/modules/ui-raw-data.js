/**
 * 原始数据显示模块 - 处理原始数据显示
 * 文件大小: <8KB
 */

class UIRawData {
    constructor() {}

    /**
     * 显示原始数据
     */
    showRawData(data) {
        const container = document.getElementById('dataTableContent');
        if (!container) return;
        
        // 处理API返回的数据格式
        let displayData = data;
        
        // 如果data是API响应对象，提取data字段
        if (data && typeof data === 'object' && data.data) {
            displayData = data.data;
        }
        
        if (!displayData || displayData.length === 0) {
            container.innerHTML = `
                <p style="color: var(--text-light); text-align: center; padding: var(--space-xl);">
                    暂无原始数据
                </p>
            `;
            return;
        }
        
        // 创建表格
        let html = '<table style="width: 100%; border-collapse: collapse; font-size: 0.9em;">';
        html += '<thead><tr style="background: var(--bg-gray);">';
        
        // 表头 - 使用固定的列名，避免数据字段不一致
        const headers = ['年份', '期间', '指标代码', '字段', '数值', '单位'];
        
        headers.forEach(header => {
            html += `<th style="padding: var(--space-sm); text-align: left; border-bottom: 2px solid var(--border-color);">${header}</th>`;
        });
        
        html += '</tr></thead><tbody>';
        
        // 数据行
        displayData.forEach(row => {
            html += '<tr style="border-bottom: 1px solid var(--border-color);">';
            
            // 按照固定列顺序显示
            html += `<td style="padding: var(--space-sm);">${row.year || ''}</td>`;
            html += `<td style="padding: var(--space-sm);">${row.period || ''}</td>`;
            html += `<td style="padding: var(--space-sm);">${row.indicator_code || ''}</td>`;
            html += `<td style="padding: var(--space-sm);">${row.field || ''}</td>`;
            
            // 数值格式化
            let value = row.value;
            if (typeof value === 'number') {
                if (value > 10000) {
                    value = (value / 10000).toFixed(2) + ' 亿';
                } else if (value > 1000) {
                    value = (value / 1000).toFixed(2) + ' 千';
                } else {
                    value = value.toFixed(2);
                }
            }
            html += `<td style="padding: var(--space-sm); text-align: right;">${value}</td>`;
            
            html += `<td style="padding: var(--space-sm);">${row.unit || ''}</td>`;
            html += '</tr>';
        });
        
        html += '</tbody></table>';
        
        // 添加数据统计信息
        const stats = `
            <div style="margin-top: var(--space-md); padding: var(--space-sm); background: var(--bg-gray); border-radius: var(--border-radius);">
                <small style="color: var(--text-light);">
                    共 ${displayData.length} 条记录 | 
                    数据来源: 本地数据库 | 
                    最后更新: ${new Date().toLocaleDateString()}
                </small>
            </div>
        `;
        
        container.innerHTML = html + stats;
    }

    /**
     * 显示原始数据错误
     */
    showRawDataError(error) {
        const container = document.getElementById('dataTableContent');
        if (container) {
            container.innerHTML = `
                <p style="color: var(--error-red); text-align: center; padding: var(--space-xl);">
                    加载原始数据失败: ${error}
                </p>
            `;
        }
    }

    /**
     * 更新原始数据（兼容旧API）
     */
    updateRawData(rawData) {
        const container = document.getElementById('rawDataContent');
        if (!container) {
            console.error('未找到原始数据容器');
            return;
        }
        
        console.log('更新原始数据:', rawData);
        
        // 检查数据是否有效
        if (!rawData || !rawData.success) {
            container.innerHTML = `
                <div class="raw-data-section">
                    <h4>原始数据</h4>
                    <p style="color: var(--text-light); text-align: center; padding: var(--space-xl);">
                        数据加载失败: ${rawData?.error || '未知错误'}
                    </p>
                </div>
            `;
            return;
        }
        
        // 构建HTML
        let html = `
            <div class="raw-data-section">
                <h4>原始数据表格</h4>
                <div style="color: var(--text-light); font-size: 13px; margin-bottom: 16px;">
                    数据记录: ${rawData.data?.length || 0} 条 | 
                    表格行数: ${rawData.raw_data_table?.length || 0} 行
                </div>
        `;
        
        // 如果有原始表格数据，显示表格
        if (rawData.raw_data_table && rawData.raw_data_table.length > 0) {
            // 获取表头
            const headers = Object.keys(rawData.raw_data_table[0] || {});
            
            html += `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                ${headers.map(header => `<th>${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${rawData.raw_data_table.map(row => `
                                <tr>
                                    ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        } 
        // 如果有普通数据，显示列表
        else if (rawData.data && rawData.data.length > 0) {
            html += `
                <div class="data-list">
                    <ul>
                        ${rawData.data.map(item => `
                            <li>
                                <strong>${item.field || '数据'}:</strong> 
                                ${item.value || ''} ${item.unit || ''}
                                <span style="color: var(--text-light); font-size: 12px;">
                                    (${item.period || ''})
                                </span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }
        // 没有数据
        else {
            html += `
                <div style="color: var(--text-light); text-align: center; padding: var(--space-xl);">
                    暂无原始数据
                </div>
            `;
        }
        
        html += '</div>';
        container.innerHTML = html;
    }
}

export default UIRawData;