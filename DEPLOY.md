# Midas Win95 Homepage - 部署说明

## 项目概述
完整的Windows 95风格个人主页，集成了股价百分位查看器(Caifu)和交易老黄历功能。

## 核心功能
- ✅ Win95风格桌面界面
- ✅ 实时股票数据 (Perplexity AI驱动)  
- ✅ Token消耗追踪显示
- ✅ 多窗口管理系统
- ✅ 响应式设计支持

## 快速部署方案

### 方案1: GitHub Pages (推荐)
```bash
# 1. 创建GitHub仓库 midas-homepage
# 2. 推送代码
git remote add origin https://github.com/ssslumdunk-star/midas-homepage.git
git push -u origin master

# 3. 在GitHub仓库设置中启用Pages
# 访问: https://ssslumdunk-star.github.io/midas-homepage
```

### 方案2: 服务器部署
```bash
# 复制到web服务器
scp -r . user@yourserver.com:/var/www/html/midas-homepage/

# 或者上传到现有服务器
rsync -av --exclude='.git' . /path/to/web/directory/
```

### 方案3: 本地测试
```bash
# 启动本地服务器
python3 -m http.server 8004
# 访问: http://localhost:8004
```

## 重要配置

### API Keys 配置
- **Perplexity AI**: 已配置（密钥已在代码中设置）
- **Token追踪**: 集成在主页任务栏显示

### 文件结构
```
midas-homepage/
├── index.html          # 主页面 (Win95桌面)
├── caifu/             # 股价百分位查看器
│   ├── index.html
│   ├── style.css
│   └── app.js         # Perplexity AI集成
├── laohuangli/        # 交易老黄历 (子项目)
└── server.js          # Node.js服务器 (可选)
```

## 验证部署
1. 🖥️ 主页显示Win95桌面
2. 🏦 双击"股价百分位"图标打开Caifu应用
3. 📊 输入股票代码(如COIN)获取实时数据
4. 🔢 任务栏显示token消耗情况

## 故障排除
- 确保所有静态文件正确上传
- 检查CORS设置（如果API调用失败）
- 验证Perplexity API key有效性

## 当前状态
✅ 所有功能已测试完成
✅ COIN股价验证通过 ($315.34)
✅ Token追踪正常工作
✅ 窗口大小已优化 (90vw x 80vh)

**部署包已准备完毕，可直接上传到任何web服务器！**