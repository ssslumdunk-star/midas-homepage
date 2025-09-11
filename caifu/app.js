// Alpha Vantage API配置
// 请在 https://www.alphavantage.co/support/#api-key 获取免费API key
const API_KEY = 'demo'; // 请替换为您的API key
const BASE_URL = 'https://www.alphavantage.co/query';

// 全局变量
let currentStockData = null;

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    // 绑定回车键搜索
    document.getElementById('stockSymbol').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchStock();
        }
    });

    // 检查API key
    if (API_KEY === 'demo') {
        showApiKeyWarning();
    }
});

// 显示API key警告
function showApiKeyWarning() {
    const warningHtml = `
        <div class="api-warning" style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
            <h4 style="color: #92400e; margin-bottom: 10px;"><i class="fas fa-key"></i> 需要API密钥</h4>
            <p style="color: #a16207; margin-bottom: 15px;">
                要使用此应用，请在 <a href="https://www.alphavantage.co/support/#api-key" target="_blank" style="color: #b45309; text-decoration: underline;">Alpha Vantage</a> 获取免费API密钥，然后在 app.js 文件中替换 API_KEY 变量。
            </p>
            <p style="color: #a16207; font-size: 0.9rem;">
                免费账户每天可调用500次API，足够个人使用。
            </p>
        </div>
    `;
    
    document.querySelector('.search-section').insertAdjacentHTML('afterbegin', warningHtml);
}

// 搜索股票
async function searchStock() {
    const symbol = document.getElementById('stockSymbol').value.trim().toUpperCase();
    
    if (!symbol) {
        showError('请输入股票代码');
        return;
    }

    if (API_KEY === 'demo') {
        // 使用演示数据
        searchStockDemo(symbol);
        return;
    }

    showLoading();
    hideError();
    hideResults();

    try {
        // 获取当前股价
        const quoteData = await fetchStockQuote(symbol);
        
        // 获取历史数据
        const historicalData = await fetchHistoricalData(symbol);
        
        if (!quoteData || !historicalData) {
            showError('无法获取股票数据，请检查股票代码是否正确');
            return;
        }

        // 计算百分位
        const percentiles = calculatePercentiles(quoteData.currentPrice, historicalData);
        
        // 显示结果
        displayResults(symbol, quoteData, percentiles, historicalData);
        
    } catch (error) {
        console.error('Error fetching stock data:', error);
        showError('获取数据时发生错误，请稍后重试');
    } finally {
        hideLoading();
    }
}

// 演示模式搜索（使用模拟数据）
function searchStockDemo(symbol) {
    showLoading();
    
    // 模拟API延迟
    setTimeout(() => {
        const demoData = generateDemoData(symbol);
        const percentiles = calculatePercentiles(demoData.currentPrice, demoData.historicalData);
        displayResults(symbol, demoData, percentiles, demoData.historicalData);
        hideLoading();
        
        // 显示演示提示
        showDemoNotice();
    }, 1500);
}

// 生成演示数据
function generateDemoData(symbol) {
    const basePrice = Math.random() * 200 + 50; // 50-250之间的基础价格
    const currentPrice = basePrice + (Math.random() - 0.5) * 20; // 当前价格
    const change = (Math.random() - 0.5) * 10; // 涨跌幅
    const changePercent = (change / (currentPrice - change)) * 100;

    // 生成5年历史数据
    const historicalData = [];
    let price = basePrice;
    const totalDays = 5 * 252; // 5年交易日

    for (let i = totalDays; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        // 添加随机波动
        price += (Math.random() - 0.5) * price * 0.03;
        price = Math.max(price, basePrice * 0.2); // 防止价格过低
        
        historicalData.push({
            date: date.toISOString().split('T')[0],
            close: parseFloat(price.toFixed(2))
        });
    }

    return {
        symbol: symbol,
        currentPrice: parseFloat(currentPrice.toFixed(2)),
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        historicalData: historicalData
    };
}

// 显示演示提示
function showDemoNotice() {
    const notice = document.createElement('div');
    notice.className = 'demo-notice';
    notice.style.cssText = `
        background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; 
        padding: 15px; margin: 20px 0; color: #1e40af; font-size: 0.9rem;
        text-align: center;
    `;
    notice.innerHTML = '<i class="fas fa-info-circle"></i> 当前显示的是演示数据，请配置API密钥获取真实股票数据';
    
    document.getElementById('resultSection').insertBefore(notice, document.getElementById('resultSection').firstChild);
}

// 获取股票报价
async function fetchStockQuote(symbol) {
    const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }
        
        const quote = data['Global Quote'];
        if (!quote) {
            throw new Error('No data found');
        }
        
        return {
            symbol: quote['01. symbol'],
            currentPrice: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', ''))
        };
    } catch (error) {
        console.error('Error fetching quote:', error);
        return null;
    }
}

// 获取历史数据
async function fetchHistoricalData(symbol) {
    const url = `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data['Error Message']) {
            throw new Error(data['Error Message']);
        }
        
        const timeSeries = data['Time Series (Daily)'];
        if (!timeSeries) {
            throw new Error('No historical data found');
        }
        
        // 转换数据格式
        const historicalData = [];
        for (const [date, values] of Object.entries(timeSeries)) {
            historicalData.push({
                date: date,
                close: parseFloat(values['4. close'])
            });
        }
        
        // 按日期排序（最新的在前）
        historicalData.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        return historicalData;
    } catch (error) {
        console.error('Error fetching historical data:', error);
        return null;
    }
}

// 计算百分位
function calculatePercentiles(currentPrice, historicalData) {
    const periods = {
        '1y': 252,   // 1年交易日
        '3y': 756,   // 3年交易日
        '5y': 1260   // 5年交易日
    };
    
    const percentiles = {};
    
    for (const [period, days] of Object.entries(periods)) {
        const periodData = historicalData.slice(0, Math.min(days, historicalData.length));
        const prices = periodData.map(d => d.close).sort((a, b) => a - b);
        
        if (prices.length === 0) {
            percentiles[period] = null;
            continue;
        }
        
        // 计算当前价格的百分位
        let lowerCount = 0;
        for (const price of prices) {
            if (price < currentPrice) {
                lowerCount++;
            }
        }
        
        const percentile = (lowerCount / prices.length) * 100;
        
        percentiles[period] = {
            percentile: Math.round(percentile * 10) / 10,
            min: Math.min(...prices),
            max: Math.max(...prices),
            avg: prices.reduce((a, b) => a + b, 0) / prices.length,
            dataPoints: prices.length
        };
    }
    
    return percentiles;
}

// 显示结果
function displayResults(symbol, stockData, percentiles, historicalData) {
    // 更新股票信息
    document.getElementById('stockName').textContent = `${symbol} - ${stockData.symbol || symbol}`;
    document.getElementById('currentPrice').textContent = `$${stockData.currentPrice}`;
    
    const changeElement = document.getElementById('priceChange');
    const changeText = `${stockData.change >= 0 ? '+' : ''}${stockData.change} (${stockData.changePercent >= 0 ? '+' : ''}${stockData.changePercent.toFixed(2)}%)`;
    changeElement.textContent = changeText;
    changeElement.className = `price-change ${stockData.change >= 0 ? 'positive' : 'negative'}`;
    
    // 更新百分位显示
    const periods = ['1y', '3y', '5y'];
    const periodNames = { '1y': '1年', '3y': '3年', '5y': '5年' };
    
    periods.forEach(period => {
        const data = percentiles[period];
        if (data) {
            document.getElementById(`percentile${period}`).textContent = `${data.percentile}%`;
            const progressBar = document.getElementById(`progress${period}`);
            setTimeout(() => {
                progressBar.style.width = `${data.percentile}%`;
            }, 300);
        }
    });
    
    // 更新统计信息
    updateStats(percentiles);
    
    // 更新解读
    updateInterpretation(percentiles);
    
    // 显示结果区域
    showResults();
}

// 更新统计信息
function updateStats(percentiles) {
    const statsGrid = document.getElementById('statsGrid');
    statsGrid.innerHTML = '';
    
    const periods = ['1y', '3y', '5y'];
    const periodNames = { '1y': '1年', '3y': '3年', '5y': '5年' };
    
    periods.forEach(period => {
        const data = percentiles[period];
        if (data) {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <div class="stat-label">${periodNames[period]}价格区间</div>
                <div class="stat-value">$${data.min.toFixed(2)} - $${data.max.toFixed(2)}</div>
            `;
            statsGrid.appendChild(statItem);
        }
    });
    
    // 添加平均价格
    periods.forEach(period => {
        const data = percentiles[period];
        if (data) {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <div class="stat-label">${periodNames[period]}平均价格</div>
                <div class="stat-value">$${data.avg.toFixed(2)}</div>
            `;
            statsGrid.appendChild(statItem);
        }
    });
}

// 更新解读
function updateInterpretation(percentiles) {
    const interpretationElement = document.getElementById('interpretationText');
    let interpretation = '';
    
    const oneYearPercentile = percentiles['1y']?.percentile;
    
    if (oneYearPercentile !== null && oneYearPercentile !== undefined) {
        if (oneYearPercentile < 25) {
            interpretation = '当前股价处于近期低位（下四分位），可能存在投资机会，但需要分析基本面。';
        } else if (oneYearPercentile < 50) {
            interpretation = '当前股价低于历史中位数，相对较为合理，可以考虑逢低买入。';
        } else if (oneYearPercentile < 75) {
            interpretation = '当前股价高于历史中位数，处于相对高位，建议谨慎投资。';
        } else {
            interpretation = '当前股价处于历史高位（上四分位），投资风险较高，建议等待回调。';
        }
        
        // 添加长期趋势分析
        const fiveYearPercentile = percentiles['5y']?.percentile;
        if (fiveYearPercentile !== null && fiveYearPercentile !== undefined) {
            if (Math.abs(oneYearPercentile - fiveYearPercentile) > 20) {
                interpretation += ` 注意：短期和长期百分位差异较大，建议综合分析市场趋势。`;
            }
        }
    } else {
        interpretation = '数据不足，无法提供投资建议。';
    }
    
    interpretationElement.textContent = interpretation;
}

// UI控制函数
function showLoading() {
    document.getElementById('loadingSection').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loadingSection').style.display = 'none';
}

function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorSection').style.display = 'block';
}

function hideError() {
    document.getElementById('errorSection').style.display = 'none';
}

function showResults() {
    document.getElementById('resultSection').style.display = 'block';
}

function hideResults() {
    document.getElementById('resultSection').style.display = 'none';
}

// 设置示例股票代码
function setExample(symbol) {
    document.getElementById('stockSymbol').value = symbol;
}

// 键盘快捷键支持
document.addEventListener('keydown', function(e) {
    // Ctrl + Enter 快速搜索
    if (e.ctrlKey && e.key === 'Enter') {
        searchStock();
    }
});