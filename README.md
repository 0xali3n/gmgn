# Aptos Trading Leaderboard

A comprehensive trading analysis platform for Aptos blockchain, similar to GMGN.ai, that tracks top traders and provides detailed PnL analysis.

## Features

### 🏆 Trading Leaderboard

- **Top Trader Rankings**: View the best performing Aptos traders ranked by estimated PnL
- **Real-time Statistics**: Track total trades, volume, win rates, and average trade sizes
- **Interactive Rankings**: Click on any trader to view detailed analysis

### 📊 Individual Trader Analysis

- **Detailed PnL Calculation**: Advanced profit/loss estimation based on buy/sell patterns
- **Token Analysis**: Breakdown of trading activity by individual tokens
- **Trade History**: Complete transaction history with timestamps and amounts
- **Performance Metrics**: Win rates, average trade sizes, and volume analysis

### 🔍 Single Address Analysis

- **Custom Address Lookup**: Analyze any Aptos wallet address
- **Transaction Parsing**: Automatic detection and parsing of swap transactions
- **Token Recognition**: Smart token name extraction from contract addresses

## Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom gradients and animations
- **Blockchain**: Aptos RPC integration
- **Data Processing**: Advanced PnL calculation algorithms

## Getting Started

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Open in Browser**
   Navigate to `http://localhost:5173`

## How It Works

### PnL Calculation Algorithm

The platform uses a sophisticated algorithm to estimate trader profits:

1. **Buy Tracking**: Records token purchases with average cost basis
2. **Sell Tracking**: Calculates realized profits when tokens are sold
3. **Volume Analysis**: Tracks total trading volume in AptosCoin equivalent
4. **Win Rate Calculation**: Determines success rate based on profitable trades

### Token Recognition

- **Comprehensive Mapping**: Supports 200+ tokens with real Aptos contract addresses
- **Smart Extraction**: Automatically identifies token names from complex contract addresses
- **Decimal Handling**: Proper conversion of token amounts based on decimal places

### Data Sources

- **Aptos Mainnet**: Real-time data from Aptos blockchain
- **Transaction Parsing**: Automatic detection of swap transactions
- **Event Analysis**: Extraction of trade details from blockchain events

## Pre-configured Traders

The platform comes with 5 pre-configured Aptos trader addresses for immediate analysis:

- `0xcd3617c24c7bf2dcc6cadf3bbe868476416c740b9d7bf030fbd64fd2f15ee34c`
- `0xef5a2f763602154eb5fa7159d34d6fa29888c8a51da543c2fa9506975563feff`
- `0xfbd76a526a7bcac96c927d94e908cfa18217536141f013f1689accc6b4904399`
- `0x07f0de53a0eb8fe125c43aaa07a87ba130c06152748dece2ce49904599b0af7e`
- `0xfe10a97ac6a868b11cb78a51432a9af7fc331ca8a5ca323a08d8f82766a97433`

## Features in Detail

### Leaderboard View

- **Rankings**: Traders sorted by estimated PnL (highest first)
- **Quick Stats**: Total trades, volume, win rate at a glance
- **Top Tokens**: Most traded tokens for each trader
- **Last Activity**: Recent trading activity timestamps

### Trader Detail View

- **Comprehensive Stats**: Complete trading performance overview
- **Token Breakdown**: Individual token performance analysis
- **Transaction History**: Chronological list of all trades
- **Performance Charts**: Visual representation of trading patterns

### Single Address Analysis

- **Custom Lookup**: Analyze any Aptos wallet address
- **Transaction Filtering**: Shows only swap-related transactions
- **Real-time Data**: Live blockchain data integration

## API Integration

The platform integrates with Aptos RPC endpoints to fetch:

- Transaction history
- Event data
- Token information
- Account details

## Future Enhancements

- **Price Charts**: Integration with price data APIs
- **More Metrics**: Additional performance indicators
- **Export Features**: Data export capabilities
- **Real-time Updates**: Live data streaming
- **Mobile Optimization**: Enhanced mobile experience

## Contributing

This is a demonstration project showcasing Aptos blockchain integration and advanced trading analysis capabilities.
