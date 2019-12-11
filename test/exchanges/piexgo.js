const { ExchangeApi, sign, signObj, qs } = require('../../exchange/piexgo-api');
const { should, expect } = require('chai');

const API_KEYS = {
  key: '2adf4a83-30a2-42ea-b763-bc2b9c6aa54f',
  secret: '2380fc8b84e5aba7ca1948fa53f469c7d855f4ec',
};

describe('exchange/piexgo', function() {
  let exchangeApi;
  let order_id;
  it('piexgo-api/initialize', function() {
    exchangeApi = new ExchangeApi({
      key: API_KEYS.key,
      secret: API_KEYS.secret,
    });

    expect(exchangeApi).to.have.own.property('secret');
    expect(exchangeApi).to.have.own.property('key');
  });

  // it('piexgo-api/sign should work', function() {
  //   const emptySig = sign('4ad49bd70fa3674800e10e37d3cfe4ce433a8b94', '');
  //   console.log(emptySig);
  //   expect(emptySig).to.be.equal('0866cab22aaf7a092213c68659b4ee7ac9f53640c4f1dc0cd097708f6b35cb22563ccac63d44d43d57d724c635645333a894dc64f10d893ce25a863007b58c17');
  // });
  //
  // it('piexgo-api/signObj should work', function() {
  //   const req = new URLSearchParams();
  //   req.append('price', 6830);
  //   req.append('quantity', 10);
  //   req.append('recv_window', 5000);
  //   req.append('side', 'BUY');
  //   req.append('symbol', 'BTC_USDT');
  //   req.append('timestamp', 1552356480000);
  //   req.append('type', 'LIMIT');
  //   const sig = signObj('4ad49bd70fa3674800e10e37d3cfe4ce433a8b94', req);
  //   console.log(sig);
  //   expect(sig).to.be.equal('fc3729658558e0ca42c12c46b94feb269cdf3d87c4a649896c457472b4e4ab4ec1640b0882d5de9a33ed282c33bc171c95f3315b95b578fd64f87bde4ce945cd');
  // });
  //
  // it('piexgo-api/symbols should work', function() {
  //   const res = exchangeApi.symbols();
  //   res.then(function(result) {
  //     expect(result.data).to.be.not.empty;
  //     console.log('====symbols===');
  //     console.table(result.data);
  //   });
  // });
  //
  // it('piexgo-api/time should work', function() {
  //   const res = exchangeApi.time();
  //   res.then(function(result) {
  //     expect(result.server_time).to.be.not.null;
  //     console.log('====time===');
  //     console.table(result);
  //   });
  // });
  //
  //
  // it('piexgo-api/getTrades should work', function() {
  //   const req = {
  //     symbol: 'UPX_USDT',
  //   };
  //   const res = exchangeApi.getTrades(req);
  //   res.then(function(result) {
  //     expect(result.data).to.be.not.empty;
  //     console.log('====getTrades===');
  //     console.table(result.data);
  //   });
  // });
  //
  // it('piexgo-api/account should work', function() {
  //   const res = exchangeApi.account();
  //   res.then(function(result) {
  //     expect(result.data).to.be.not.empty;
  //     console.log('====account===');
  //     console.table(result.data);
  //   });
  // });
  //
  // it('piexgo-api/orderBook should work', function() {
  //   const req = {
  //     symbol: 'UPX_USDT',
  //   };
  //   const res = exchangeApi.orderBook(req);
  //   res.then(function(result) {
  //     expect(result.err_code===0);
  //     console.log('====orderBook bids===');
  //     console.table(result.bids);
  //     console.log('====orderBook asks===');
  //     console.table(result.asks);
  //   });
  // });

  // it('piexgo-api/order should work', function() {
  //   const req = new URLSearchParams();
  //   req.append('quantity', 5000);
  //   req.append('price', 0.0002);
  //   req.append('type', 'LIMIT');
  //   req.append('recv_window', 5000);
  //   req.append('side', 'BUY');
  //   req.append('symbol', 'UPX_USDT');
  //   req.append('timestamp', new Date().getTime());
  //   const res = exchangeApi.order(req);
  //   res.then(function(data) {
  //     expect(result.err_code).to.be.eq('0');
  //
  //     order_id = data.order_id;
  //   });
  // });
  //
  // it('piexgo-api/orderInfo should work', function() {
  //   const req = new URLSearchParams();
  //   req.append('symbol', 'UPX_USDT');
  //   req.append('order_id', '1204163223927074817');
  //   const res = exchangeApi.orderInfo(req);
  //   res.then(function(data) {
  //     console.log('====orderInfo===');
  //     console.table(data);
  //   });
  // });
  //
  // it('piexgo-api/cancelOrder should work', function() {
  //   const req = new URLSearchParams();
  //   req.append('symbol', 'UPX_USDT');
  //   req.append('order_id', '1204163223927074817');
  //   req.append('recv_window', 5000);
  //   req.append('timestamp', new Date().getTime());
  //   const res = exchangeApi.cancelOrder(req);
  //   res.then(function(data) {
  //     console.log('====cancelOrder===');
  //     console.table(data);
  //   });
  // });
  //
  // it('piexgo-api/openOrders should work', function() {
  //   const req = {
  //     page: '0',
  //   };
  //   const res = exchangeApi.openOrders(req);
  //   res.then(function(data) {
  //     console.log('====openOrders===');
  //     console.table(data);
  //   });
  // });
  it('piexgo-api/tradeOrderHistory should work', function() {
    const req = {
      page: '0',
    };
    const res = exchangeApi.tradeOrderHistory(req);
    res.then(function(data) {
      console.log('====tradeOrderHistory===');
      console.table(data);
    });
  });

});
