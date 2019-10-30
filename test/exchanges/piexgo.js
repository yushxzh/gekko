const {ExchangeApi, sign, signObj, qs} = require('../../exchange/piexgo-api');
const {should, expect} = require('chai');

const API_KEYS = {
  key: '7a6a2c1b-a872-4907-996e-28d7a4633d55',
  secret: 'eb94655f2e4aee56964c1342d331035ac2af8f60'
};

describe('exchange/piexgo', function (){
  let exchangeApi;
  it('piexgo-api/initialize', function (){
    exchangeApi = new ExchangeApi({
      key: API_KEYS.key,
      secret: API_KEYS.secret
    });

    expect(exchangeApi).to.have.own.property('secret');
  });

  it('piexgo-api/sign should work', function (){
    const emptySig = sign(exchangeApi.secret, '');
    expect(emptySig).to.be.equal('1bc5e323b84b745c15f68846a33599935b7188c03769c79d8c771d9a0bd98b46677eca12aaf6df1b2bb21bc19729763ff0151bd49f0d9ae2ff5e0a99872197d0');
  });

  it('piexgo-api/signObj should work', function (){
    const sig = signObj(exchangeApi.secret, {page: 0});
    expect(sig).to.be.equal('c625dda5993fda1d1dcb92bf99f7ab84087ca121c8091e4186c27892cd41b70b03a0d2cc30a082274102ad50f10919007e35e059f829dcbef59fcb88c7db259d');
  });
});
