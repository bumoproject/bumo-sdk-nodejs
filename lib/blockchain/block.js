'use strict';

const wrap = require('co-wrap-all');
const is = require('is-type-of');
const merge = require('merge-descriptors');
const humps = require('humps');
const errors = require('../exception');

module.exports = Block;

function Block(options) {
  if (!(this instanceof Block)) {
    return new Block(options);
  }

  this.options = options;
}

const proto = Block.prototype;

merge(proto, require('../common/util'));

proto.getNumber = function* () {
  try {
    return yield this._getBlockNumber();
  } catch (err) {
    throw err;
  }
};

proto.checkStatus = function* () {
  try {
    const data = yield this._request('get', 'getModulesStatus');
    const info = data.ledger_manager;

    if (info.chain_max_ledger_seq === info.ledger_sequence) {
      return this._responseData({
        isSynchronous: true,
      });
    }
    return this._responseData({
      isSynchronous: false,
    });
  } catch (err) {
    throw err;
  }
};

proto.getTransactions = function* (blockNumber) {
  try {
    if (!this._verifyValue(blockNumber)) {
      return this._responseError(errors.INVALID_BLOCKNUMBER_ERROR);
    }

    const data = yield this._request('get', 'getTransactionHistory', {
      ledger_seq: blockNumber,
    });

    if (data.error_code === 0) {
      return this._responseData(data.result);
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};

proto.getInfo = function* (blockNumber) {
  try {
    if (!this._verifyValue(blockNumber)) {
      return this._responseError(errors.INVALID_BLOCKNUMBER_ERROR);
    }

    const data = yield this._request('get', 'getLedger', {
      seq: blockNumber,
    });
    if (data.error_code === 0) {
      let info = {};

      if (data.result && data.result.header) {
        const header = data.result.header;
        const closeTime = header.close_time || '';
        const number = header.seq;
        const txCount = header.tx_count || '';
        const version = header.version || '';
        info = {
          closeTime,
          number,
          txCount,
          version,
        }
      }

      return this._responseData(info);
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};


proto.getLatestInfo = function* () {
  try {
    const data = yield this._request('get', 'getLedger');

    if (data.error_code === 0) {
      let info = {};

      if (data.result && data.result.header) {
        const header = data.result.header;
        const closeTime = header.close_time || '';
        const number = header.seq;
        const txCount = header.tx_count || '';
        const version = header.version || '';
        info = {
          closeTime,
          number,
          txCount,
          version,
        }
      }

      return this._responseData(info);
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};

proto.getValidators  = function* (blockNumber) {
  try {
    if (!this._verifyValue(blockNumber)) {
      return this._responseError(errors.INVALID_BLOCKNUMBER_ERROR);
    }

    const data = yield this._request('get', 'getLedger', {
      seq: blockNumber,
      with_validator: true,
    });

    if (data.error_code === 0) {
      let validatorsInfo = data.result.validators;
      let validators = [];

      if (is.array(validatorsInfo) && validatorsInfo.length > 0) {
        validators = validatorsInfo;
      }

      return this._responseData({
        validators,
      });
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};


proto.getLatestValidators = function* () {
  try {
    const data = yield this._request('get', 'getLedger', {
      with_validator: true,
    });

    if (data.error_code === 0) {
      let validatorsInfo = data.result.validators;
      let validators = [];

      if (is.array(validatorsInfo) && validatorsInfo.length > 0) {
        validators = validatorsInfo;
      }

      return this._responseData({
        validators,
      });
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};


proto.getReward = function* (blockNumber) {
  try {
    if (!this._verifyValue(blockNumber)) {
      return this._responseError(errors.INVALID_BLOCKNUMBER_ERROR);
    }

    const data = yield this._request('get', 'getLedger', {
      seq: blockNumber,
      with_block_reward: true,
    });

    if (data.error_code === 0) {
      // console.log(data)
      const result = data.result;
      const blockReward = result.block_reward;
      const validatorsReward = result.validators_reward;
      const validatorItems = [];
      const keys = Object.keys(validatorsReward);

      if (keys.length > 0) {
        keys.forEach(item => {
          validatorItems.push({
            validator: item,
            reward: validatorsReward[item],
          });
        })
      }

      return this._responseData({
        blockReward,
        validatorsReward: validatorItems,
      });
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};


proto.getLatestReward = function* () {
  try {
    const data = yield this._request('get', 'getLedger', {
      with_block_reward: true,
    });

    if (data.error_code === 0) {
      // console.log(data)
      const result = data.result;
      const blockReward = result.block_reward;
      const validatorsReward = result.validators_reward;
      const validatorItems = [];
      const keys = Object.keys(validatorsReward);

      if (keys.length > 0) {
        keys.forEach(item => {
          validatorItems.push({
            validator: item,
            reward: validatorsReward[item],
          });
        })
      }

      return this._responseData({
        blockReward,
        validatorsReward: validatorItems,
      });
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};


proto.getFees = function* (blockNumber) {
  try {
    if (!this._verifyValue(blockNumber)) {
      return this._responseError(errors.INVALID_BLOCKNUMBER_ERROR);
    }

    const data = yield this._request('get', 'getLedger', {
      seq: blockNumber,
      with_fee: true,
    });

    if (data.error_code === 0) {
      // console.log(data)
      const result = data.result;
      const fees = result.fees;

      return this._responseData({
        // fees: humps.camelizeKeys(fees),
        fees,
      });
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};


proto.getLatestFees = function* () {
  try {
    const data = yield this._request('get', 'getLedger', {
      with_fee: true,
    });

    if (data.error_code === 0) {
      // console.log(data)
      const result = data.result;
      const fees = result.fees;

      return this._responseData({
        // fees: humps.camelizeKeys(fees),
        fees,
      });
    }

    if (data.error_code === 4) {
      return this._responseError(errors.QUERY_RESULT_NOT_EXIST, data.result);
    }

    return this._responseError(errors.FAIL);

  } catch (err) {
    throw err;
  }
};

wrap(proto);
