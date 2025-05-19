import React from 'react';

const resources = [
  {
    category: 'Beginner Guides',
    icon: '📘',
    items: [
      {
        title: 'Investopedia – Stock Market 101',
        url: 'https://www.investopedia.com/stock-market-4427765',
        desc: 'Clear, structured tutorials covering stocks, trading, IPOs, dividends, etc.'
      },
      {
        title: 'NSE India Learn Section',
        url: 'https://www.nseindia.com/learn',
        desc: 'From India\'s National Stock Exchange; focused on Indian markets.'
      },
      {
        title: 'Groww Learn – Stocks',
        url: 'https://groww.in/blog/category/stock-market',
        desc: 'Blogs and explainers for Indian retail investors.'
      },
      {
        title: 'Zerodha Varsity',
        url: 'https://zerodha.com/varsity/',
        desc: 'Extremely detailed, module-based learning. Covers everything from basics to technical analysis.'
      },
    ]
  },
  {
    category: 'YouTube Channels',
    icon: '📺',
    items: [
      { title: 'Pranjal Kamra', url: 'https://www.youtube.com/c/PranjalKamra' },
      { title: 'CA Rachana Phadke Ranade', url: 'https://www.youtube.com/c/CArachanaPhadkeRanade' },
      { title: 'Finology', url: 'https://www.youtube.com/c/FinologyLegal' },
      { title: 'Wall Street Survivor (for global markets)', url: 'https://www.youtube.com/user/WallStreetSurvivor' },
    ]
  },
  {
    category: 'Stock Market Simulators (Practice Without Real Money)',
    icon: '🛠️',
    items: [
      { title: 'Moneybhai (Moneycontrol)', url: 'https://www.moneybhai.moneycontrol.com' },
      { title: 'Wall Street Survivor', url: 'https://www.wallstreetsurvivor.com' },
      { title: 'TradingView (Paper Trading)', url: 'https://tradingview.com' },
    ]
  }
];

const LearnTrading = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-2 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto space-y-10">
      <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight font-sans mb-6 text-center">Learn Trading</h1>
      <p className="text-lg text-gray-600 text-center mb-10">Explore the best free resources to learn about the stock market, trading strategies, and practice tools.</p>
      <div className="space-y-10">
        {resources.map((section) => (
          <div key={section.category}>
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-2">{section.icon}</span>
              <h2 className="text-2xl font-bold text-indigo-700">{section.category}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {section.items.map((item) => (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-gray-100 p-6 h-full group"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-indigo-500 text-xl">{section.icon}</span>
                    <span className="text-lg font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{item.title}</span>
                  </div>
                  {item.desc && <p className="text-gray-600 text-sm mt-1">{item.desc}</p>}
                  <span className="inline-block mt-4 text-indigo-600 font-medium text-sm group-hover:underline">Visit &rarr;</span>
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LearnTrading;