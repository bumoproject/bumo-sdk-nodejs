'use strict';

require('chai').should();
const BumoSDK = require('../index');


const sdk = new BumoSDK({
  host: 'seed1.bumotest.io:26002',
});

describe('Test util', function() {

  it('test utfToHex(string)', function() {
    let data = sdk.util.utfToHex('hello, world');
    data.should.equal('68656c6c6f2c20776f726c64');

    data = sdk.util.utfToHex('');
    data.should.equal('');

    data = sdk.util.utfToHex();
    let result = (data === undefined);
    result.should.equal(true);
  });

  it('test hexToUtf(string)', function() {
    let data = sdk.util.hexToUtf('68656c6c6f2c20776f726c64');
    data.should.equal('hello, world');

    let result;
    data = sdk.util.hexToUtf('');
    result = (data === undefined);
    result.should.equal(true);

    data = sdk.util.hexToUtf();
    result = (data === undefined);
    result.should.equal(true);

    data = sdk.util.hexToUtf('hello, world');
    result = (data === undefined);
    result.should.equal(true);
  });

  it('test buToMo(string)', function() {
    let data = sdk.util.buToMo('5');
    data.should.equal('500000000');

    data = sdk.util.buToMo(5);
    data.should.equal('');

    data = sdk.util.buToMo();
    data.should.equal('');

    data = sdk.util.buToMo('');
    data.should.equal('');

    data = sdk.util.buToMo('abc');
    data.should.equal('');

    data = sdk.util.buToMo('0.1');
    data.should.equal('10000000');

    data = sdk.util.buToMo('-1');
    data.should.equal('');
  });

  it('test moToBu(string)', function() {
    let data = sdk.util.moToBu('500000000');
    data.should.equal('5');

    data = sdk.util.moToBu('0');
    data.should.equal('0');

    data = sdk.util.moToBu('');
    data.should.equal('');

    data = sdk.util.moToBu();
    data.should.equal('');

    data = sdk.util.moToBu('abc');
    data.should.equal('');

    data = sdk.util.moToBu('-1');
    data.should.equal('');

    data = sdk.util.moToBu(-1);
    data.should.equal('');

    data = sdk.util.moToBu('0.1');
    data.should.equal('');
  });


});
