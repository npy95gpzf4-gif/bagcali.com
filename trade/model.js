export const exchanges = [
  { id: 'binance', name: 'Binance', mark: 'B', passphrase: false },
  { id: 'okx', name: 'OKX', mark: 'O', passphrase: true },
  { id: 'coinbase', name: 'Coinbase', mark: 'C', passphrase: false },
  { id: 'upbit', name: 'Upbit', mark: 'U', passphrase: false },
  { id: 'bybit', name: 'Bybit', mark: 'B', passphrase: false },
  { id: 'bitget', name: 'Bitget', mark: 'B', passphrase: true },
  { id: 'gate', name: 'Gate', mark: 'G', passphrase: false },
  { id: 'kucoin', name: 'KuCoin', mark: 'K', passphrase: true }
];
export const prices = { 'BTC/USDT': 65000, 'ETH/USDT': 3200, 'SOL/USDT': 145 };
export function validateConnection(exchange, checks) {
  if (!exchanges.some(x => x.id === exchange)) return 'Choose an exchange.';
  if (!checks.read || !checks.trade || !checks.withdrawalOff || !checks.ip) return 'Confirm all four permission settings to continue.';
  return '';
}
export function simulateOrder(account, symbol, side, input) {
  const quantity = Number(input), price = prices[symbol];
  if (!Number.isFinite(quantity) || quantity <= 0 || !price || !['buy', 'sell'].includes(side)) throw new Error('Enter a valid quantity and order.');
  const cost = Math.round(quantity * price * 100) / 100;
  if (cost < 0.01) throw new Error('Order value must be at least 0.01 demo USDT.');
  const held = account.holdings[symbol] || 0;
  if (side === 'buy' && cost > account.balance) throw new Error('Insufficient demo balance.');
  if (side === 'sell' && quantity > held) throw new Error('Insufficient demo holdings.');
  return { balance: Math.round((account.balance + (side === 'buy' ? -cost : cost)) * 100) / 100,
    holdings: { ...account.holdings, [symbol]: Number((held + (side === 'buy' ? quantity : -quantity)).toFixed(8)) } };
}
