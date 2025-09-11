# 🖥️ Midas Win95 Homepage

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://ssslumdunk-star.github.io/midas-homepage/)

一个怀旧的Windows 95风格个人主页，集成了股价百分位查看器和交易老黄历功能。

## 🌟 在线访问

**主页地址**: [https://ssslumdunk-star.github.io/midas-homepage/](https://ssslumdunk-star.github.io/midas-homepage/)

## 🔧 本地部署配置

### 1. API配置
为了使股价功能正常工作，需要创建API配置文件：

```bash
# 创建 caifu/config.js 文件
echo "window.PERPLEXITY_API_KEY = 'your-api-key-here';" > caifu/config.js
```

### 2. 启动本地服务器
```bash
# Python 3
python3 -m http.server 8004

# Node.js (可选)
npm install
npm start
```

## ✨ 功能特色

- 🖥️ **Win95风格界面**: 完美复刻经典Windows 95桌面体验
- 📊 **实时股价数据**: 通过Perplexity AI获取准确的股票信息
- 🔢 **Token消耗追踪**: 实时显示API使用情况
- 📈 **股价百分位分析**: 1年、3年、5年历史数据对比
- 📅 **交易老黄历**: 集成交易日历功能
- 💻 **响应式设计**: 支持多种屏幕尺寸

## 🎯 使用方法

1. 访问主页后看到Win95桌面界面
2. 双击"股价百分位"图标打开Caifu应用
3. 输入美股代码（如 AAPL, MSFT, COIN）
4. 查看实时股价和历史百分位数据
5. 观察任务栏的token使用统计

## 📁 项目结构

```
midas-homepage/
├── index.html          # Win95主页面
├── caifu/             # 股价百分位查看器
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   └── config.js      # API配置（需手动创建）
├── laohuangli/        # 交易老黄历
└── DEPLOY.md          # 详细部署说明
```

## 🔒 安全说明

- API密钥通过独立配置文件管理
- 配置文件已添加到`.gitignore`以保护敏感信息
- 支持环境变量和配置文件两种方式

## 🤖 AI集成

- **Perplexity AI**: 获取实时股票数据
- **智能解析**: 自动处理JSON响应格式
- **容错机制**: 多重API备选方案
- **成本追踪**: 实时显示token消耗

---

*🤖 本项目由 [Claude Code](https://claude.ai/code) 协助开发*