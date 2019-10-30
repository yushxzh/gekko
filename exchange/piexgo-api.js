const r2 = require('r2');
const crypto = require('crypto');
const ENDPOINT = 'https://api.piexgo.com';

function sign(secret, msg) {
  const signer = crypto.createHmac('sha512', secret);
  return signer.update(msg).digest('hex');
}

function signObj(secret, obj) {
  const signer = crypto.createHmac('sha512', secret);
  const qstring = Object.keys(obj).sort().reduce((ret, key) => {
    ret += `${key}=${obj[key]}&`;
    return ret;
  }, '').replace(/&$/, '');
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
    handleDrift = true
  }) {
    this.key = key;
    this.secret = secret;
    this.recvWindow = recvWindow;
    this.disableBeautification = disableBeautification;
    this.handleDrift = handleDrift;
  }

  async symbols() {
    const res = await r2(`${ENDPOINT}/api/v1/symbols`).json;
    return res;
  }

  async getTrades(req) {
    const res = await r2(`${ENDPOINT}/api/v1/trades?${qs(req)}`).json;
    return res;
  }

  async account() {
    const signature = sign(this.secret, '');
    const headers = {
      KEY: this.key,
      signature
    };
    const res = await r2.post(`${ENDPOINT}/api/v1/account`, {headers}).json;
    return res;
  }

  async orderTicker(req) {
    const res = await r2.get(`${ENDPOINT}/api/v1/orderBook?${qs(req)}`).json;
    return res;
  }

  async cancelOrder(req) {
    const signature = signObj(this.secret, req);
    const headers = {
      KEY: this.key,
      signature
    };
    const res = await r2.post(`${ENDPOINT}/api/v1/cancelOrder`, {json: req, headers}).json;
    return res;
  }

  async orderInfo(req) {
    const signature = signObj(this.secret, req);
    const headers = {
      KEY: this.key,
      signature
    };
    const res = await r2.post(`${ENDPOINT}/api/v1/orderInfo`, {json: req, headers}).json;
    return res;
  }

  async order(req) {
    const signature = signObj(this.secret, req);
    const headers = {
      KEY: this.key,
      signature
    };
    const res = await r2.post(`${ENDPOINT}/api/v1/order`, {json: req, headers}).json;
    return res;
  }
}

module.exports = {
  ExchangeApi,
  sign,
  signObj,
  qs
};
