#!/usr/bin/env python3
"""
测试所有公司的数据文件是否存在
"""

import os
import json
from pathlib import Path

def test_company_files():
    """测试公司数据文件"""
    data_dir = Path("data/calculation_results/companies")
    
    if not data_dir.exists():
        print(f"❌ 数据目录不存在: {data_dir}")
        return
    
    # 读取公司列表
    companies_file = Path("data/companies.json")
    if not companies_file.exists():
        print(f"❌ 公司列表文件不存在: {companies_file}")
        return
    
    with open(companies_file, 'r', encoding='utf-8') as f:
        companies = json.load(f)
    
    print(f"测试 {len(companies)} 家公司的数据文件...")
    
    # 预期的指标组
    expected_groups = [
        '7.11', '7.12', '7.13', '7.14',
        '7.21', '7.22', '7.23', '7.24', '7.25',
        '7.31', '7.32', '7.33',
        '7.41', '7.42', '7.43', '7.44',
        '7.51', '7.52', '7.53'
    ]
    
    all_pass = True
    
    for company in companies:
        ts_code = company['ts_code']
        name = company['name']
        
        print(f"\n测试公司: {name} ({ts_code})")
        
        missing_files = []
        
        for group in expected_groups:
            # 查找该公司的指标组文件
            pattern = f"{ts_code}_indicators_{group.replace('.', '_')}*.json"
            files = list(data_dir.glob(pattern))
            
            if not files:
                missing_files.append(group)
            else:
                # 检查文件是否可读
                try:
                    with open(files[0], 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    if group in data:
                        print(f"  通过 {group}: 找到 {len(files)} 个文件, 数据有效")
                    else:
                        print(f"  警告 {group}: 文件存在但数据结构异常")
                        missing_files.append(group)
                except Exception as e:
                    print(f"  ❌ {group}: 文件读取失败: {e}")
                    missing_files.append(group)
        
        if missing_files:
            print(f"  ❌ 缺失 {len(missing_files)} 个指标组: {missing_files}")
            all_pass = False
        else:
            print(f"  ✅ 所有指标组文件完整")
    
    if all_pass:
        print(f"\n🎉 所有公司的数据文件测试通过!")
    else:
        print(f"\n⚠️  部分公司的数据文件缺失，请检查计算脚本")

if __name__ == "__main__":
    # 切换到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    test_company_files()