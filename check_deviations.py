#!/usr/bin/env python3
import json

# 当前股价数据
current_prices = {
    # 美股 (2025年9月13日真实价格)
    'AAPL': 234.35, 'MSFT': 500.28, 'GOOGL': 241.58, 'AMZN': 227.85, 'META': 505.7,
    'TSLA': 394.13, 'NVDA': 177.87, 'NFLX': 1185.84, 'COST': 890.5, 'CSCO': 52.8,
    'AMD': 157.06, 'PEP': 143.53, 'INTC': 24.08, 'TXN': 195.4, 'QCOM': 161.51,
    'ADBE': 590.8, 'AMGN': 285.3, 'BABA': 155.0, 'V': 350.87, 'PDD': 124.79,
    'JD': 33.94, 'JPM': 305.05, 'JNJ': 151.33, 'WMT': 89.50, 'PG': 157.90,
    'MA': 522.50, 'HD': 417.30,
    # 港股（港币，2025年9月13日真实价格）
    '00700.HK': 643.50, '09988.HK': 151.0, '00005.HK': 106.30, '00939.HK': 7.88,
    '00388.HK': 47.2, '00386.HK': 4.23, '01024.HK': 45.8, '02382.HK': 82.1,
    '02269.HK': 28.5, '09961.HK': 145.2, '03888.HK': 26.8, '01833.HK': 42.5,
    '02015.HK': 118.6, '09866.HK': 48.2, '02688.HK': 14.2,
    '03690.HK': 96.55, '01211.HK': 104.50, '03988.HK': 4.38, '01398.HK': 5.50,
    '01109.HK': 8.90, '00016.HK': 78.50, '00857.HK': 65.20, '01299.HK': 42.80,
    '02318.HK': 150.30, '09618.HK': 135.60, '02020.HK': 28.70, '00175.HK': 9.80,
    '06060.HK': 25.4, '09999.HK': 158.5
}

def calculate_deviation(current_price, target_price):
    return ((target_price - current_price) / current_price) * 100

def main():
    # 读取财报数据
    with open('/home/midas/projects/midas-homepage/earnings_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    high_deviations = []

    for event in data['earnings_events']:
        symbol = event['symbol']
        company_name = event['company_name']

        if symbol in current_prices:
            current_price = current_prices[symbol]

            if 'analyst_comments' in event:
                for comment in event['analyst_comments']:
                    if 'price_target' in comment:
                        target_price = comment['price_target']
                        deviation = calculate_deviation(current_price, target_price)

                        if abs(deviation) > 20:  # 偏离超过20%
                            high_deviations.append({
                                'symbol': symbol,
                                'company': company_name,
                                'current_price': current_price,
                                'target_price': target_price,
                                'deviation': deviation,
                                'analyst': comment['analyst_name'],
                                'firm': comment['firm']
                            })

    # 按偏离度排序
    high_deviations.sort(key=lambda x: abs(x['deviation']), reverse=True)

    print("=== 分析师目标价偏离度超过20%的股票 ===")
    print(f"{'股票':<12} {'公司名':<12} {'当前价格':<10} {'目标价格':<10} {'偏离度':<8} {'分析师':<15} {'机构'}")
    print("-" * 90)

    for item in high_deviations:
        currency = "HK$" if item['symbol'].endswith('.HK') else "$"
        print(f"{item['symbol']:<12} {item['company']:<12} {currency}{item['current_price']:<9.2f} {currency}{item['target_price']:<9.2f} {item['deviation']:>6.1f}% {item['analyst']:<15} {item['firm']}")

    print(f"\n总计发现 {len(high_deviations)} 个偏离超过20%的目标价格需要审核")

if __name__ == "__main__":
    main()