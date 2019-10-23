const PiexgoApi = require('../../piexgo-api');
const fs = require('fs');
const path = require('path');

async function getMarkets() {
  const piexgoApi = new PiexgoApi({});
  const res = await piexgoApi.symbols();
  const currencies = new Set();
  const assets = new Set();
  const markets = [];
  if (res.err_code === 0) {
    for (let i = 0; i < res.data.length; ++i) {
      const {symbol, amount_precision: amountPrecision, price_precision: pricePrecision} = res.data[i];
      const [asset, currency] = symbol.split('_');
      currencies.add(currency);
      assets.add(asset);
      markets.push({
        'pair': [currency, asset],
        'minimalOrder': {
          'amount': parseFloat(Math.pow(10, -amountPrecision).toFixed(amountPrecision)),
          'price': parseFloat(Math.pow(10, -pricePrecision).toFixed(pricePrecision))
        }
      });
    }
  }

  return {
    currencies: Array.from(currencies),
    assets: Array.from(assets),
    markets
  };
}

getMarkets().then(conf => {
  fs.writeFileSync(path.resolve(__dirname, '../../wrappers/piexgo-markets.json'), JSON.stringify(conf, null, 2));
  console.log(`${conf.markets.length > 0 ? 'done!' : 'fail!'}`);
});
