'use strict';

require('chai').should();
const BumoSDK = require('../index');

const sdk = new BumoSDK({
  host: 'seed1.bumotest.io:26002',
});

describe('Test bumo-sdk block service', function() {

  it('test block.getNumber()', async() => {
    let data = await sdk.block.getNumber();
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('header').be.a('object').have.property('blockNumber');
  });

  it('test block.checkBlockStatus()', async() => {
    let data = await sdk.block.checkStatus();
    data.errorCode.should.equal(0);
    data.result.should.be.a('object').have.property('isSynchronous').be.a('boolean');
  });

  it('test block.getTransactions(blockNumber)', async() => {
    let data = await sdk.block.getTransactions('100');
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('total_count');
    data.result.should.have.property('transactions');

    data = await sdk.block.getTransactions('1');
    data.errorCode.should.equal(15014);

    data = await sdk.block.getTransactions('abc');
    data.errorCode.should.equal(11060);

    data = await sdk.block.getTransactions('');
    data.errorCode.should.equal(11060);

    data = await sdk.block.getTransactions('0');
    data.errorCode.should.equal(11060);

    data = await sdk.block.getTransactions(123);
    data.errorCode.should.equal(11060);

  });

  it('test block.getInfo(blockNumber)', async() => {
    let data = await sdk.block.getInfo('100');
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('closeTime');
    data.result.should.have.property('number');
    data.result.should.have.property('txCount');
    data.result.should.have.property('version');

    data = await sdk.block.getInfo('');
    data.errorCode.should.equal(11060);

    data = await sdk.block.getInfo();
    data.errorCode.should.equal(11060);

    data = await sdk.block.getInfo(123);
    data.errorCode.should.equal(11060);

    data = await sdk.block.getInfo('-1');
    data.errorCode.should.equal(11060);
  });


  it('test block.getLatestInfo()', async() => {
    let data = await sdk.block.getLatestInfo();
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('closeTime');
    data.result.should.have.property('number');
    data.result.should.have.property('txCount');
    data.result.should.have.property('version');
  });

  it('test block.getValidators(blockNumber)', async() => {
    let data = await sdk.block.getValidators('100');
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('validators').be.a('array');

    data = await sdk.block.getValidators('');
    data.errorCode.should.equal(11060);

    data = await sdk.block.getValidators();
    data.errorCode.should.equal(11060);

    data = await sdk.block.getValidators('abc');
    data.errorCode.should.equal(11060);
  });

  it('test block.getLatestValidators()', async() => {
    let data = await sdk.block.getLatestValidators();
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('validators').be.a('array');
  });

  it('test block.getReward(blockNumber)', async() => {
    let data = await sdk.block.getReward('100');
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('validators');
    data.result.should.have.property('kols');
  });

  it('test block.getLatestReward()', async() => {
    let data = await sdk.block.getLatestReward();
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('validators');
    data.result.should.have.property('kols');
  });


  it('test getFees(blockNumber)', async() => {
    let data = await sdk.block.getFees('100');
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('fees');
    data.result.fees.should.have.property('base_reserve');
    data.result.fees.should.have.property('gas_price');

    data = await sdk.block.getFees();
    data.errorCode.should.equal(11060);

    data = await sdk.block.getFees('');
    data.errorCode.should.equal(11060);

    data = await sdk.block.getFees('abc');
    data.errorCode.should.equal(11060);

    data = await sdk.block.getFees(-1);
    data.errorCode.should.equal(11060);

    data = await sdk.block.getFees(0.1);
    data.errorCode.should.equal(11060);

  });

  it('test getLatestFees()', async() => {
    const data = await sdk.block.getLatestFees();
    data.errorCode.should.equal(0);
    data.result.should.be.a('object');
    data.result.should.have.property('fees');
    data.result.fees.should.have.property('base_reserve');
    data.result.fees.should.have.property('gas_price');
  });

});
