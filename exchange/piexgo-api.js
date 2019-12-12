const fetch = require('node-fetch');
const crypto = require('crypto');
const ENDPOINT = 'https://api.piexgo.com';

function sign(secret, msg) {
  const signer = crypto.createHmac('sha512', secret);
  return signer.update(msg).digest('hex');
}

function signObj(secret, obj) {
  const signer = crypto.createHmac('sha512', secret);
  obj.sort();
  const qstring =obj.toString();
  return signer.update(qstring).digest('hex');
}

function qs(obj) {
  return Object.keys(obj).reduce((ret, key) => {
    ret += `${key}=${obj[key]}&`;
    return ret;
  }, '').replace(/&$/, '');
}

class ExchangeApi {
  constructor({
                key,
                secret,
                timeout = 15000,
                recvWindow = 5000,
                disableBeautification = false,
                handleDrift = true,
              }) {
    this.key = key;
    this.secret = secret;
    this.recvWindow = recvWindow;
    this.disableBeautification = disableBeautification;
    this.handleDrift = handleDrift;
  }

  async symbols() {
    const options = {
      method: 'GET',
    };
    return await fetch(`${ENDPOINT}/api/v1/symbols`, options).then(response => {
      return response.json();
    });
  }

  async time() {
    const options = {
      method: 'GET',
    };
    return await fetch(`${ENDPOINT}/api/v1/time`, options).then(response => {
      return response.json();
    });
  }

  async getTrades(req) {
    const options = {
      method: 'GET',
    };
    return await fetch(`${ENDPOINT}/api/v1/trades?${qs(req)}`, options).then(response => {
      return response.json();
    });
  }

  async account() {
    const signature = sign(this.secret, '');
    const headers = {
      KEY: this.key,
      signature,
    };
    const options = {
      method: 'POST',
      headers: headers,
    };
    console.log("account req");
    console.table(options);
    return await fetch(`${ENDPOINT}/api/v1/account`, options).then(response => {
      return response.json();
    });
  }

  async orderBook(req) {
    const options = {
      method: 'GET',
    };
    return await fetch(`${ENDPOINT}/api/v1/orderBook?${qs(req)}`, options).then(response => {
      return response.json();
    });

  }

  async order(req) {
    const params=new URLSearchParams(req);
    const signature = signObj(this.secret, params);
    const headers = {
      KEY: this.key,
      signature,
    };
    const options = {
      method: 'POST',
      body: params,
      headers: headers,
    };
    console.log("order req");
    console.table(options);
    return await fetch(`${ENDPOINT}/api/v1/order`, options).then(response => {
      return response.json();
    });
  }

  async orderInfo(req) {
    const params=new URLSearchParams(req);
    const signature = signObj(this.secret, params);
    const headers = {
      KEY: this.key,
      signature,
    };
    const options = {
      method: 'POST',
      body: params,
      headers: headers,
    };
    return await fetch(`${ENDPOINT}/api/v1/orderInfo`, options).then(response => {
      return response.json();
    });
  }

  async cancelOrder(req) {
    const params=new URLSearchParams(req);
    const signature = signObj(this.secret, params);
    const headers = {
      KEY: this.key,
      signature,
    };
    const options = {
      method: 'POST',
      body: params,
      headers: headers,
    };
    return await fetch(`${ENDPOINT}/api/v1/cancelOrder`, options).then(response => {
      return response.json();
    });
  }

  async openOrders(req) {
    const params=new URLSearchParams(req);
    const signature = signObj(this.secret, params);
    const headers = {
      KEY: this.key,
      signature,
    };
    const options = {
      method: 'POST',
      body: params,
      headers: headers,
    };
    return await fetch(`${ENDPOINT}/api/v1/openOrders`, options).then(response => {
      return response.json();
    });
  }
  async tradeOrderHistory(req) {
    const params=new URLSearchParams(req);
    const signature = signObj(this.secret, params);
    const headers = {
      KEY: this.key,
      signature,
    };
    const options = {
      method: 'POST',
      body: params,
      headers: headers,
    };
    return await fetch(`${ENDPOINT}/api/v1/tradeOrderHistory`, options).then(response => {
      return response.json();
    });
  }
}

module.exports = {
  ExchangeApi,
  sign,
  signObj,
  qs,
};
