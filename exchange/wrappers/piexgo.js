const moment = require('moment');
const _ = require('lodash');

// const Errors = require('../exchangeErrors');
const marketData = require('./piexgo-markets.json');
const exchangeUtils = require('../exchangeUtils');
const retry = exchangeUtils.retry;
const scientificToDecimal = exchangeUtils.scientificToDecimal;

const ExchangeApi = require('./piexgo-api');

function req(exchangeApi, method, json, callback) {
  const fetch = async cb => {
    const res = await exchangeApi[method](json);
    let error;
    if (res && res.err_code) {
      error = new Error(`${method} call error[${res.err_code}]: ${res.msg}`);
    }
    cb(error, res);
  };

  retry(undefined, fetch, callback);
}

const Trader = function(config) {
  _.bindAll(this, [
    'roundAmount',
    'roundPrice',
    'isValidPrice',
    'isValidLot'
  ]);

  if (_.isObject(config)) {
    this.key = config.key;
    this.secret = config.secret;
    this.currency = config.currency.toUpperCase();
    this.asset = config.asset.toUpperCase();
  }

  this.recvWindow = 5000;
  this.pair = `${this.asset}_${this.currency}`;
  this.name = 'piexgo';

  this.market = _.find(Trader.getCapabilities().markets, (market) => {
    return market.pair[0] === this.currency && market.pair[1] === this.asset;
  });

  this.exchangeApi = new ExchangeApi({
    key: this.key,
    secret: this.secret,
    timeout: 15000,
    recvWindow: this.recvWindow,
    disableBeautification: false,
    handleDrift: true
  });

  if (config.key && config.secret) {
    // Note non standard func:
    //
    // On binance we might pay fees in BNB
    // if we do we CANNOT calculate feePercent
    // since we don't track BNB price (when we
    // are not trading on a BNB market).
    //
    // Though we can deduce feePercent based
    // on user fee tracked through `this.getFee`.
    // Set default here, overwrite in getFee.
    this.fee = 0.001;
    // Set the proper fee asap.
    this.getFee(_.noop);

    this.oldOrder = false;
  }
};

/*
const recoverableErrors = [
  'SOCKETTIMEDOUT',
  'TIMEDOUT',
  'CONNRESET',
  'CONNREFUSED',
  'NOTFOUND',
  'Error -1021',
  'Response code 429',
  'Response code 5',
  'Response code 403',
  'ETIMEDOUT',
  'EHOSTUNREACH',
  // getaddrinfo EAI_AGAIN api.binance.com api.binance.com:443
  'EAI_AGAIN',
  'ENETUNREACH'
];

const includes = (str, list) => {
  if (!_.isString(str)) return false;

  return _.some(list, item => str.includes(item));
}

Trader.prototype.handleResponse = function(funcName, callback) {
  return (res) => {
    let error;
    if (res && res.err_code) {
      error = new Error(`${funcName} call error[${res.err_code}]: ${res.msg}`);
    }
    if (error) {
      if (includes(error.message, recoverableErrors)) {
        error.notFatal = true;
      }

      if (funcName === 'cancelOrder' && error.message.includes('UNKNOWN_ORDER')) {
        console.log(new Date(), 'cancelOrder', 'UNKNOWN_ORDER');
        // order got filled in full before it could be
        // cancelled, meaning it was NOT cancelled.
        return callback(false, {filled: true});
      }

      if(funcName === 'checkOrder' && error.message.includes('Order does not exist.')) {
        console.log(new Date, 'Binance doesnt know this order, retrying up to 10 times..');
        error.retry = 10;
      }

      if(funcName === 'addOrder' && error.message.includes('Account has insufficient balance')) {
        console.log(new Date, 'insufficientFunds');
        error.type = 'insufficientFunds';
      }
      return callback(error);
    }

    return callback(null, res);
  };
};
*/

// public apis
Trader.prototype.getTrades = function(since, callback, descending) {
  return req(
    this.exchangeApi,
    'getTrades',
    {symbol: this.pair},
    (err, res) => {
      if (err) return callback(err);
      var parsedTrades = [];
      _.each(
        res.data,
        function(trade) {
          parsedTrades.push({
            tid: trade.time, // todo, impl more stable trade id
            date: moment(trade.time).unix(),
            price: parseFloat(trade.price),
            amount: parseFloat(trade.vol)
          });
        },
        this
      );
      if (descending) callback(null, parsedTrades.reverse());
      else callback(null, parsedTrades);
    });
};

Trader.prototype.getPortfolio = function(callback) {
  return req(
    this.exchangeApi,
    'account',
    null,
    (err, res) => {
      if (err) return callback(err);

      const findAsset = item => item.market === this.asset;
      let assetAmount = parseFloat(_.find(res.data, findAsset).balance);

      const findCurrency = item => item.market === this.currency;
      let currencyAmount = parseFloat(_.find(res.data, findCurrency).balance);

      if (!_.isNumber(assetAmount) || _.isNaN(assetAmount)) {
        assetAmount = 0;
      }

      if (!_.isNumber(currencyAmount) || _.isNaN(currencyAmount)) {
        currencyAmount = 0;
      }

      const portfolio = [
        { name: this.asset, amount: assetAmount },
        { name: this.currency, amount: currencyAmount }
      ];

      return callback(null, portfolio);
    }
  );
};

Trader.prototype.getFee = function(callback) {
  this.fee = 0.0005; // marker fee
  callback(null, this.fee);
};

Trader.prototype.getTicker = function(callback) {
  return req(
    this.exchangeApi,
    'orderTicker',
    {symbol: this.pair},
    (err, res) => {
      if (err) return callback(err);
      const ticker = {
        bid: parseFloat(res.bids[0].price),
        ask: parseFloat(res.asks[0].price)
      };
      callback(null, ticker);
    }
  );
};

// Effectively counts the number of decimal places, so 0.001 or 0.234 results in 3
Trader.prototype.getPrecision = function(tickSize) {
  if (!isFinite(tickSize)) return 0;
  let e = 1;
  let p = 0;
  while (Math.round(tickSize * e) / e !== tickSize) { e *= 10; p++; }
  return p;
};

Trader.prototype.round = function(amount, tickSize) {
  let precision = 100000000;
  const t = this.getPrecision(tickSize);

  if (Number.isInteger(t)) precision = Math.pow(10, t);
  amount *= precision;
  amount = Math.floor(amount);
  amount /= precision;

  // https://gist.github.com/jiggzson/b5f489af9ad931e3d186
  amount = scientificToDecimal(amount);

  return amount;
};

Trader.prototype.roundAmount = function(amount) {
  return this.round(amount, this.market.minimalOrder.amount);
};

Trader.prototype.roundPrice = function(price) {
  return this.round(price, this.market.minimalOrder.price);
};

Trader.prototype.isValidPrice = function(price) {
  return price >= this.market.minimalOrder.price;
};

Trader.prototype.isValidLot = function(price, amount) {
  return amount * price >= this.market.minimalOrder.order;
};

Trader.prototype.outbidPrice = function(price, isUp) {
  let newPrice;

  if (isUp) {
    newPrice = price + this.market.minimalOrder.price;
  } else {
    newPrice = price - this.market.minimalOrder.price;
  }

  return this.roundPrice(newPrice);
};

Trader.prototype.addOrder = function(tradeType, amount, price, callback) {
  return req(
    this.exchangeApi,
    'order',
    {
      price,
      quantity: amount,
      side: tradeType.toUpperCase(),
      symbol: this.pair,
      type: 'LIMIT',
      timestamp: new Date().getTime(),
      recv_window: this.recvWindow
    },
    (err, res) => {
      if (err) return callback(err);
      callback(null, res.order_id);
    }
  );
};

Trader.prototype.getOrder = function(order, callback) {
  return req(
    this.exchangeApi,
    'orderInfo',
    {symbol: this.pair, order_id: order},
    (err, res) => {
      if (err) return callback(err);

      let price = 0;
      let amount = 0;
      let date = moment(0);
      if (res.data.status === 0) { // pending
        return callback(null, {price, amount, date});
      }
      const fee = parseFloat(res.data.fee);
      price = parseFloat(res.data.price);
      amount = parseFloat(res.data.filled_volume);

      const fees = {
        [this.currency]: fee
      };
      callback(err, {
        price,
        amount,
        date: moment(res.data.update_time),
        fees,
        feePercent: Math.round(fee / (price * amount) * 100)
      });
    }
  );
};

Trader.prototype.buy = function(amount, price, callback) {
  this.addOrder('buy', amount, price, callback);
};

Trader.prototype.sell = function(amount, price, callback) {
  this.addOrder('sell', amount, price, callback);
};

Trader.prototype.checkOrder = function(order, callback) {
  return req(
    this.exchangeApi,
    'orderInfo',
    {symbol: this.pair, order_id: order},
    (err, res) => {
      if (err) {
        return callback(err);
      }
      const status = res.data.status;
      const filledAmount = parseFloat(res.data.filled_volume);
      if (status === 2) { // done
        return callback(null, { executed: true, open: false });
      }
      if (
        status === 5 || // refused
        (status === 4) // cancelled
      ) {
        return callback(null, { executed: false, open: false });
      } else if (
        status === 0 || // pending
        status === -1 // stop limit pending
      ) {
        return callback(null, { executed: false, open: true, filledAmount: filledAmount });
      }
      console.log('what status?', status);
      throw status;
    }
  );
};

Trader.prototype.cancelOrder = function(order, callback) {
  return req(
    this.exchangeApi,
    'cancelOrder',
    {
      symbol: this.pair,
      order_id: order,
      recv_window: this.recvWindow,
      timestamp: new Date().getTime()
    },
    (err, res) => {
      this.oldOrder = order;
      if (err) {
        return callback(err);
      }
      if (res.msg === 'ok') {
        return callback(null, true);
      }
      return callback(null, false);
    }
  );
};

Trader.getCapabilities = function() {
  return {
    name: 'Piexgo',
    slug: 'piexgo',
    currencies: marketData.currencies,
    assets: marketData.assets,
    markets: marketData.markets,
    requires: ['key', 'secret'],
    providesHistory: 'date',
    providesFullHistory: true,
    tid: 'tid',
    tradable: true,
    gekkoBroker: 0.6,
    limitedCancelConfirmation: true
  };
};

module.exports = Trader;
