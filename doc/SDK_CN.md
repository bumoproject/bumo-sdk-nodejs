
# bumo-sdk-nodejs

## 概述
本文档简要概述bumo-sdk-nodejs常用接口文档, 让开发者更方便地写入和查询BU区块链。

- [名词解析](#名词解析)
- [请求参数与响应数据格式](#请求参数与响应数据格式)
  - [请求参数](#请求参数)
  - [响应数据](#响应数据)
- [使用方法](#使用方法)
    - [生成SDK实例](#生成SDK实例)
    - [查询](#信息查询)
    - [提交交易](#提交交易)
    	- [获取账户nonce值](#获取账户nonce值)
    	- [构建操作](#构建操作)
    	- [构建交易Blob](#构建交易blob)
    	- [签名交易](#签名交易)
    	- [广播交易](#广播交易)
- [账户服务](#账户服务)
  - [checkValid](#checkvalid)
  - [getInfo](#getinfo-账户)
  - [getNonce](#getnonce)
  - [getBalance](#getbalance)
  - [getAssets](#getassets)
- [资产服务](#资产服务)
    - [getInfo](#getinfo-资产)
- [交易服务](#交易服务)
    - [操作说明](#操作说明)
    - [buildBlob](#buildblob)
    - [evaluateFee](#evaluateFee)
    - [sign](#sign)
    - [submit](#submit)
    - [getInfo](#getinfo-交易)
- [区块服务](#区块服务)
    - [getNumber](#getnumber)
    - [checkStatus](#checkstatus)
    - [getTransactions](#gettransactions)
    - [getInfo](#getinfo-区块)
    - [getLatestInfo](#getlatestinfo)
    - [getValidators](#getvalidators)
    - [getLatestValidators](#getlatestvalidators)
    - [getReward](#getreward)
    - [getLatestReward](#getlatestreward)
    - [getFees](#getfees)
    - [getLatestFees](#getlatestfees)
- [合约服务](#合约服务)
  - [getInfo](#getinfo-合约)
  - [checkValid](#checkvalid-合约)
  - [getAddress](#getAddress-合约)

- [工具](#工具)
  - [utfToHex](#utftohex)
  - [hexToUtf](#hextoutf)
  - [buToMo](#butomo)
  - [moToBu](#motobu)
- [错误码](#错误码)

## 名词解析

操作BU区块链： 向BU区块链写入或修改数据

广播交易： 向BU区块链写入或修改数据

查询BU区块链： 查询BU区块链中的数据

账户服务： 提供账户相关的有效性校验与查询接口

资产服务： 提供资产相关的查询接口

交易服务： 提供操写入BU区块链与查询接口

区块服务： 提供区块的查询接口

账户nonce值： 每个账户都维护一个序列号，用于用户提交交易时标识交易执行顺序的



## 请求参数与响应数据格式

### 请求参数

为了保证数字精度，请求参数中的Number类型，全都按照字符串处理，例如：
amount = 500， 那么传递参数时候就将其更改为 amount = '500' 字符串形式


### 响应数据

响应数据为JavaScript对象，数据格式如下：

```js
{
	errorCode: 0,
	errorDesc: '',
	result: {}
}
```

说明：
1. errorCode: 错误码。0表示无错误，大于0表示有错误
2. errorDesc: 错误描述。
3. result: 返回结果

> 因响应数据结构固定，方便起见，后续接口说明中的`响应数据`均指`result`对象的属性


## SDK安装
```
npm install bumo-sdk --save
```

## 使用方法

这里介绍SDK的使用流程，首先需要生成SDK实现，然后调用相应服务的接口，其中服务包括账户服务、资产服务、合约服务、交易服务、区块服务，接口按使用分类分为生成公私钥地址接口、有效性校验接口、查询接口、提交交易相关接口

### 生成SDK实例
##### 传入参数
options 是一个对象，可以包含如下属性

   参数      |     类型     |     描述      |
----------- | ------------ | ----------------- |
host|   String   | ip地址:端口

##### 实例：

```js
const BumoSDK = require('bumo-sdk');

const options = {
  host: 'seed1.bumotest.io:26002',
};

const sdk = new BumoSDK(options);

```

### 信息查询
用于查询BU区块链上的数据，直接调用相应的接口即可，比如，查询账户信息，调用如下：

```js
const address = 'buQemmMwmRQY1JkcU7w3nhruo%X5N3j6C29uo';

sdk.account.getInfo(address).then(info=> {
  console.log(info);
}).catch(err => {
  console.log(err.message);
});
```

### 提交交易
提交交易的过程包括以下几步：获取账户nonce值，构建操作，构建交易Blob，签名交易和广播交易。

#### 获取账户nonce值

开发者可自己维护各个账户nonce，在提交完一个交易后，自动递增1，这样可以在短时间内发送多笔交易，否则，必须等上一个交易执行完成后，账户的nonce值才会加1。接口调用如下：

```js

const address = 'buQemmMwmRQY1JkcU7w3nhruo%X5N3j6C29uo';

sdk.account.getNonce(address).then(info => {

  if (info.errorCode !== 0) {
    console.log(info);
    return;
  }

  const nonce = new BigNumber(info.result.nonce).plus(1).toString(10);
});

// 该例子中使用了big-number.js 将nonce的值加1，并返回字符串类型

```

#### 构建操作

这里的操作是指在交易中做的一些动作。 例如：构建发送BU的操作，调用如下:

```js
const destAddress = 'buQWESXjdgXSFFajEZfkwi5H4fuAyTGgzkje';

const info = sdk.operation.buSendOperation({
	destAddress,
	amount: '60000',
	metadata: '746573742073656e64206275',
});

```

#### 构建交易Blob

该接口用于生成交易Blob字符串，接口调用如下：
> 注意：nonce、gasPrice、feeLimit其值是只能是包含数字的字符串且不能以0开头
>

```js

  let blobInfo = sdk.transaction.buildBlob({
    sourceAddress: 'buQnc3AGCo6ycWJCce516MDbPHKjK7ywwkuo',
    gasPrice: '3000',
    feeLimit: '1000',
    nonce: '102',
    operations: [ sendBuOperation ],
    metadata: '74657374206275696c6420626c6f62',
  });

  const blob = blobInfo.result;

```

#### 签名交易

该接口用于交易发起者使用私钥对交易进行签名。接口调用如下：

```js
  const signatureInfo = sdk.transaction.sign({
    privateKeys: [ privateKey ],
    blob,
  });

  const signature = signatureInfo.result;
```

#### 广播交易

该接口用于向BU区块链发送交易，触发交易的执行。接口调用如下：

```js
  sdk.transaction.submit({
    blob,
    signature: signature,
  }).then(data => {
  	console.log(data);
  });

```

## 账户服务

账户服务主要是账户相关的接口


#### create
> 接口说明

   生成公私钥对及地址
 > 调用方法

sdk.account.create()

> 响应数据

   参数      |     类型     |        描述
----------- | ------------ | ----------------
privateKey     |   String     |  私钥
publicKey     |   String     |  公钥
address     |   String     |  地址


> 实例：

```js
sdk.account.create().then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});
```

### checkValid
> 接口说明

   该接口用于检测账户地址的有效性

> 调用方法

sdk.account.checkValid(address)

> 请求参数

   参数      |     类型     |        描述
----------- | ------------ | ----------------
address     |   String     |  待检测的账户地址

> 响应数据

   参数      |     类型     |        描述
----------- | ------------ | ----------------
isValid     |   Boolean     |  账户地址是否有效

> 错误码

   异常       |     错误码   |   描述
-----------  | ----------- | --------
SYSTEM_ERROR |   20000     |  System error

> 示例

```js
const address = 'buQemmMwmRQY1JkcU7w3nhruoX5N3j6C29uo';

sdk.account.checkValid(address).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### getInfo-账户

> 接口说明

   该接口用于获取账户信息

> 调用方法

sdk.account.getInfo(address);

> 请求参数

   参数      |     类型     |        描述
----------- | ------------ | ----------------
address     |   String     |  待检测的账户地址


> 响应数据

   参数    |     类型      |        描述
--------- | ------------- | ----------------
address	  |    String     |    账户地址
balance	  |    String      |    账户余额
nonce	  |    String      |    账户交易序列号
priv	  | [Object](#priv) |    账户权限

#### priv
   成员       |     类型     |        描述
-----------  | ------------ | ----------------
master_weight |	 String    |   账户自身权重
signers	     |[Object](#signers)|   签名者权重
thresholds	 |[Object](#thresholds)|	门限

#### signers
   成员       |     类型     |        描述
-----------  | ------------ | ----------------
address	     |   String	    |   签名账户地址
weight	     |   String    |   签名账户权重

#### thresholds
   成员       |     类型     |        描述
-----------  | ------------ | ----------------
tx_threshold	 |    String	    |   交易默认门限
type_thresholds|[Object](#type_thresholds)|不同类型交易的门限

#### type_thresholds
   成员       |     类型     |        描述
-----------  | ------------ | ----------------
type         |    String	    |    操作类型
threshold    |    String      |    门限



> 错误码

   异常       |     错误码   |   描述
-----------  | ----------- | --------
INVALID_ADDRESS_ERROR| 11006 | Invalid address
CONNECTNETWORK_ERROR| 11007| Connect network failed
SYSTEM_ERROR |   20000     |  System error

> 示例

```js
const address = 'buQemmMwmRQY1JkcU7w3nhruo%X5N3j6C29uo';

sdk.account.getInfo(address).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});
```

### getNonce

> 接口说明

   该接口用于获取账户的nonce

> 调用方法

sdk.account.getNonce(address);

> 请求参数

   参数      |     类型     |        描述
----------- | ------------ | ----------------
address     |   String     |  待检测的账户地址

> 响应数据

   参数      |     类型     |        描述
----------- | ------------ | ----------------
nonce       |   String    |  该账户的交易序列号

> 错误码

   异常       |     错误码   |   描述
-----------  | ----------- | --------
INVALID_ADDRESS_ERROR	|	11006	| Invalid address
CONNECTNETWORK_ERROR	|	11007	| Connect network failed
SYSTEM_ERROR				|	20000	|  System error

> 示例

```js

const address = 'buQswSaKDACkrFsnP1wcVsLAUzXQsemauEjf';

sdk.account.getNonce(address).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### getBalance

> 接口说明

   该接口用于查询账户BU的余额

> 调用方法

sdk.account.getBalance(address);

> 请求参数

   参数      |     类型     |        描述
----------- | ------------ | ----------------
address     |   String     |  待检测的账户地址

> 响应数据

   参数      |     类型     |        描述
----------- | ------------ | ----------------
balance     |   String    |  该账户的余额

> 错误码

   异常       |     错误码   |   描述
-----------  | ----------- | --------
INVALID_ADDRESS_ERROR| 11006 | Invalid address
CONNECTNETWORK_ERROR| 11007| Connect network failed
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

const address = 'buQswSaKDACkrFsnP1wcVsLAUzXQsemauEjf';

const info = sdk.account.getBalance(address);

```

### getAssets

> 接口说明

   该接口用于获取账户所有资产信息

> 调用方法

sdk.account.getAssets(address);

> 请求参数

   参数      |     类型     |        描述
----------- | ------------ | ----------------
address     |   String     |  待检测的账户地址

> 响应数据

   参数      |     类型     |        描述
----------- | ------------ | ----------------
assets		|	Array	|	账户资产

> assets 数组元素为Object，其中包含如下属性:

   参数      |     类型     |        描述
----------- | ------------ | ----------------
amount		|	String	|	账户资产数量
key			|	object |  包含属性: code资产编码、issuer资产发行账户地址

> 错误码

   异常       |     错误码   |   描述
-----------  | ----------- | --------
INVALID_ADDRESS_ERROR| 11006 | Invalid address
CONNECTNETWORK_ERROR| 11007| Connect network failed
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.account.getAssets(address).then(result => {
	console.log(result);
}).catch(err => {
	console.log(err.message);
});

```

## 资产服务

账户服务主要是资产相关的接口，目前有1个接口：getAsset

### getInfo-资产

> 接口说明

   该接口用于获取账户指定资产信息

> 调用方法

sdk.token.asset.getInfo(args);

> 请求参数args为Object其中包含如下属性

   参数      |     类型     |        描述
----------- | ------------ | ----------------
address     |   String    |  必填，待查询的账户地址
code        |   String    |  必填，资产编码，长度[1 1024]
issuer      |   String    |  必填，资产发行账户地址

> 响应数据

   参数      	|     类型     	|        描述
----------- 	| ------------ 	| ----------------
asset			|  Array			|	账户资产

> assets 数组元素为Object，其中包含如下属性:

   参数      |     类型     |        描述
----------- | ------------ | ----------------
amount		|	String	|	账户资产数量
key			|	object |  包含属性: code资产编码、issuer资产发行账户地址

> 错误码

   异常       					|     错误码   |   描述   |
----------------------			| ----------- | -------- |
INVALID_ADDRESS_ERROR			|	11006	| Invalid address
CONNECTNETWORK_ERROR			|	11007	| Connect network failed
INVALID_ASSET_CODE_ERROR		|	11023	| The length of asset code must between 1 and 1024
INVALID_ISSUER_ADDRESS_ERROR	|	11027	| Invalid issuer address
SYSTEM_ERROR						|	20000	| System error

> 示例

```js

const args = {
	address: 'buQnnUEBREw2hB6pWHGPzwanX7d28xk6KVcp',
	code: 'TST',
	issuer: 'buQnnUEBREw2hB6pWHGPzwanX7d28xk6KVcp',
};


sdk.token.asset.getInfo(args).then(data => {
  console.log(data);
});


```


## 交易服务

交易服务主要是交易相关的接口，目前有5个接口：buildBlob, evaluateFee, sign, submit, getInfo。

其中调用buildBlob之前需要构建一些操作，分别包括如下操作:

### 操作说明

##### 激活账户

>  调用方式: sdk.operation.accountActivateOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
sourceAddress |   String |  选填，操作源账户
metadata      |   String |  选填，备注
destAddress   |   String |  必填，目标账户地址
initBalance   |   String |  必填，初始化资产，其值只能是包含数字的字符串且不能以0开头, 值范围[1, max(int64)] (单位是MO)
> 1 BU = 10^8 MO

> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  激活账户操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR |   11002  |  Invalid sourceAddress
INVALID_DESTADDRESS_ERROR | 11003 | Invalid destAddress
INVALID_INITBALANCE_ERROR | 11004 | InitBalance must between 1 and max(int64)
SOURCEADDRESS_EQUAL_DESTADDRESS_ERROR | 11005 | SourceAddress cannot be equal to destAddress
INVALID_METADATA_ERROR | 15028 | Invalid metadata
SYSTEM_ERROR | 20000 | System error

##### 设置账户metadata消息

>  调用方式: sdk.operation.accountSetMetadataOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
sourceAddress | String | 选填，发起该操作的源账户地址
key | String | 必填，metadata的关键词，长度[1, 1024]
value | String | 必填，metadata的内容，长度[0, 256000]
version | String | 选填，metadata的版本
deleteFlag | boolean | 选填，是否删除metadata
metadata | String |选填，备注

> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR | 11002 | Invalid sourceAddress
INVALID_DATAKEY_ERROR | 11011 | The length of key must between 1 and 1024
INVALID_DATAVALUE_ERROR | 11012 | The length of value must between 0 and 256000
INVALID_DATAVERSION_ERROR | 11013 | The version must be equal to or greater than 0
SYSTEM_ERROR | 20000 | System error


##### 设置账户权限

>  调用方式: sdk.operation.accountSetPrivilegeOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
sourceAddress |String | 选填，发起该操作的源账户地址
masterWeight | String | 选填，账户自身权重，大小[0, max(uint32)]
txThreshold | String | 选填，交易门限，大小[0, max(int64)]
metadata | String | 选填，备注
Signer | Array | 选填，签名者权重列表
typeThresholds | Array | 选填，指定类型交易门限


>
> Signer 中的元素为对象
>

   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
address | String | 选填，签名账户地址
weight | String | 选填，签名账户权重，大小[0, max(uint32)]


>
> typeThresholds 中的元素为对象
>

   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
type | String | 选填，操作类型，大小[1, 100]
threshold | String | 选填，门限，大小[0, max(int64)]


> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR |11002 | Invalid sourceAddress
INVALID_MASTERWEIGHT_ERROR | 11015 | MasterWeight must between 0 and max(uint32)
INVALID_SIGNER_ADDRESS_ERROR | 11016 | Invalid signer address
INVALID_SIGNER_WEIGHT_ERROR |11017 | Signer weight must between 0 and max(uint32)
INVALID_TX_THRESHOLD_ERROR | 11018 | TxThreshold must between 0 and max(int64)
INVALID_OPERATION_TYPE_ERROR |11019 | Type of typeThreshold is invalid
INVALID_TYPE_THRESHOLD_ERROR | 11020 | TypeThreshold must between 0 and max(int64)
SYSTEM_ERROR | 20000 | System error


##### 发送BU
>  调用方式: sdk.operation.buSendOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
sourceAddress		|   String |  选填，操作源账户
metadata			|   String |  选填，备注
destAddress		|   String |  必填，目标账户地址
buAmount			|   String |  必填，初始化资产，其值只能是包含数字的字符串且不能以0开头, 值范围[1, max(int64)] (单位是MO)

> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  发送BU操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR | 11002 | Invalid sourceAddress
INVALID_DESTADDRESS_ERROR | 11003 | Invalid destAddress
SOURCEADDRESS_EQUAL_DESTADDRESS_ERROR | 11005 | SourceAddress cannot be equal to destAddress
INVALID_BU_AMOUNT_ERROR | 11026 | BuAmount must between 1 and max(int64)
INVALID_ISSUER_ADDRESS_ERROR | 11027 | Invalid issuer address
SYSTEM_ERROR | 20000 | System error


##### 发布资产
>  调用方式: sdk.operation.assetIssueOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
sourceAddress		|   String |  选填，操作源账户
metadata			|   String |  选填，备注
code				|   String |  必填，资产编码
assetAmount		|   String |  必填，资产发布数量，其值只能是包含数字的字符串且不能以0开头, 值范围[1, max(int64)] (单位是MO)

> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  发布资产操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR | 11002 | Invalid sourceAddress
INVALID_ASSET_CODE_ERROR | 11023 |The length of key must between 1 and 1024
INVALID_ASSET_AMOUNT_ERROR | 11024 | AssetAmount must between 1 and max(int64)
SYSTEM_ERROR | 20000 | System error



##### 转移资产
>  调用方式: sdk.operation.assetSendOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
sourceAddress		|   String |  选填，操作源账户
metadata			|   String |  选填，备注
destAddress		|   String |  必填，目标账户地址
code				|   String |  必填，资产编码
issuer				|   String |  必填，资产发行账户地址
assetAmount		|   String |  必填，资产转移数量，其值只能是包含数字的字符串且不能以0开头, 值范围[1, max(int64)] (单位是MO)

> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  转移资产操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR |11002 | Invalid sourceAddress
INVALID_DESTADDRESS_ERROR | 11003 | Invalid destAddress
SOURCEADDRESS_EQUAL_DESTADDRESS_ERROR | 11005 | SourceAddress cannot be equal to destAddress
INVALID_ASSET_CODE_ERROR | 11023 | The length of asset code must between 1 and 1024
INVALID_ASSET_AMOUNT_ERROR | 11024 | AssetAmount must between 1 and max(int64)
INVALID_ISSUER_ADDRESS_ERROR | 11027 | Invalid issuer address
SYSTEM_ERROR |20000 | System error


##### 创建合约
>  调用方式: sdk.operation.contractCreateOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
initBalance		|   String |  必填，给合约账户的初始化资产，大小[1, max(64)]
payload				|   String |  必填，合约代码
sourceAddress		|   String |  选填，操作源账户
metadata			|   String |  选填，备注


> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  合约创建操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR |11002  |Invalid sourceAddress
INVALID_INITBALANCE_ERROR |11004 | InitBalance  must between 1 and max(int64)
PAYLOAD_EMPTY_ERROR |11044 |Payload must be a non-empty string
SYSTEM_ERROR |20000 | System error


##### 资产转移并触发合约，或仅触发合约
>  调用方式: sdk.operation.contractInvokeByAssetOperation(args)
>
>  该方法为Promise
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
contractAddress | String | 必填，合约账户地址
sourceAddress | String | 选填，发起该操作的源账户地址
code | String |选填，资产编码，长度[0, 1024]，当为null时，仅触发合约
issuer |String | 选填，资产发行账户地址，当为null时，仅触发合约
assetAmount | String | 选填资产数量，大小[0, max(int64)]，当是0时，仅触发合约
input |String | 选填，待触发的合约的main()入参
metadata |String | 选填，备注


> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |   资产转移并触发合约操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR | 11002 |Invalid sourceAddress
INVALID_CONTRACTADDRESS_ERROR | 11037 | Invalid contract address
CONTRACTADDRESS_NOT_CONTRACTACCOUNT_ERROR |11038 | ContractAddress is not a contract account
SOURCEADDRESS_EQUAL_CONTRACTADDRESS_ERROR |11040 |SourceAddress cannot be equal to contractAddress
INVALID_ASSET_CODE_ERROR |11023 |The length of asset code must between 0 and 1024
INVALID_CONTRACT_ASSET_AMOUNT_ERROR | 15031 | AssetAmount must between 0 and max(int64)
INVALID_ISSUER_ADDRESS_ERROR |11027 | Invalid issuer address
INVALID_INPUT_ERROR | 15028 | Invalid input
SYSTEM_ERROR |20000 | System error

##### BU资产的发送和触发合约，或仅触发合约
>  调用方式: sdk.operation.contractInvokeByBUOperation(args)
>
>  该方法为Promise
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
contractAddress |String | 必填，合约账户地址
sourceAddress | String | 选填，发起该操作的源账户地址
buAmount | String | 选填，资产发行数量，大小[0, max(int64)]，当0时仅触发合约
input |String | 选填，待触发的合约的main()入参
metadata |String | 选填，备注


> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  BU资产的发送和触发合约操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR | 11002 | Invalid sourceAddress
INVALID_CONTRACTADDRESS_ERROR | 11037 | Invalid contract address
CONTRACTADDRESS_NOT_CONTRACTACCOUNT_ERROR | 11038 | ContractAddress is not a contract account
SOURCEADDRESS_EQUAL_CONTRACTADDRESS_ERROR | 11040 | SourceAddress cannot be equal to contractAddress
INVALID_CONTRACT_BU_AMOUNT_ERROR | 15030 | BuAmount must between 0 and max(int64)
INVALID_INPUT_ERROR | 15028 | Invalid input
SYSTEM_ERROR |20000 |System error

##### 在区块链上写日志信息
>  调用方式: sdk.operation.logCreateOperation(args)
>
>	参数说明: args为Object，其中包含如下属性


   成员变量    |     类型  |        描述                           |
------------- | -------- | ----------------------------------   |
sourceAddress |String |选填，发起该操作的源账户地址
topic |String |必填，日志主题，长度[1, 128]
data | String | 必填，日志内容，每个字符串长度[1, 1024]
metadata |String | 选填，备注


> 返回值

成员变量		|     类型  |        描述                           |
---------	| -------- | ----------------------------------   |
operation |   Object  |  在区块链上写日志信息的操作对象

> 错误码

异常		|     错误码 |        描述                           |
---------	| -------- | ----------------------------------   |
INVALID_SOURCEADDRESS_ERROR | 11002 | Invalid sourceAddress
INVALID_LOG_TOPIC_ERROR |11045 | The length of key must between 1 and 128
INVALID_LOG_DATA_ERROR | 11046 | The length of value must between 1 and 1024
SYSTEM_ERROR |20000 | System error


### buildBlob

> 接口说明

   该接口用于生成交易Blob字符串

> 调用方法

sdk.transaction.buildBlob(args)

> 请求参数args为Object, 其中包含如下属性:


   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
sourceAddress		|   String     |  必填，操作源账户
gasPrice			|   String     |  必填，打包费用 (单位是MO)
feeLimit			|   String     |  必填，交易费用 (单位是MO)
nonce				|   String     |  必填，交易序列号
operations		|   Array		  |  必填，操作
ceilLedgerSeq		|   String     |  选填，区块高度限制
metadata			|   String     |  选填，备注

>  gasPrice、feeLimit、nonce、ceilLedgerSeq其值只能是包含数字的字符串且不能以0开头
> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
transactionBlob |   String     |  Transaction序列化后的16进制字符串

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_SOURCEADDRESS_ERROR | 11002 | Invalid sourceAddress
INVALID_NONCE_ERROR					| 11048 | Nonce must between 1 and max(int64)
INVALID_GASPRICE_ERROR			| 11049	| GasPrice must be between 1 and max(int64)
INVALID_FEELIMIT_ERROR			| 11050	|	FeeLimit must be between 1 and max(int64)
INVALID_CEILLEDGERSEQ_ERROR			| 11052 |	CeilLedgerSeq must be equal to or greater than 0
INVALID_METADATA_ERROR | 15028 | Invalid metadata
SYSTEM_ERROR 								|   20000     |  System error
> 示例

```js
const args = {
  sourceAddress,
  gasPrice,
  feeLimit,
  nonce,
  operations: [ sendBuOperation ],
  metadata: '6f68206d79207478',
};
const blobInfo = sdk.transaction.buildBlob(args);

```

### evaluateFee

> 接口说明

   该接口实现交易的费用评估

> 调用方法

sdk.transaction.evaluateFee(args)

> 请求参数args为Object, 包含如下属性

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
sourceAddress		|   String     |  必填，发起该操作的源账户地址
nonce				|   String     |  必填，待发起的交易序列号
operations			|   Array     |  必填，待提交的操作列表
signtureNumber	|   String     |  选填，待签名者的数量，默认是1
metadata			|   String     |  选填，备注

> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
gasPrice    |   String     |  打包费用
feeLimit    |   String     |  交易费用

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_NONCE_ERROR					| 11048 | Nonce must between 1 and max(int64)
INVALID_ARGUMENTS | 15016 | Invalid arguments to the function
SYSTEM_ERROR |   20000     |  System error

> 示例

```js
const args = {
	sourceAddress: 'buQswSaKDACkrFsnP1wcVsLAUzXQsemauEjf',
	nonce: '101',
	operations: [sendBuOperation],
	signtureNumber: '1',
	metadata: '54657374206576616c756174696f6e20666565',
};

sdk.transaction.evaluateFee(args).then(data => {
  console.log(data);
});


```

###  sign

> 接口说明

   该接口实现交易的签名

> 调用方法

sdk.transaction.sign(args)

> 请求参数args为Object, 包含如下属性

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
privateKeys		|   Array     |  必填，私钥列表
blob				|   String     |  必填，待签名blob


> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
signatures    |   Array     |  签名后的数据列表

> signatures元素为object, 其中包含如下属性

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
signData    |   String     |  签名后的数据列表
publicKey    |   String     | 公钥


> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_BLOB_ERROR | 11056 | Invalid blob
PRIVATEKEY_ONE_ERROR | 11058 | One of privateKeys is invalid
SYSTEM_ERROR |   20000     |  System error

> 示例

```js
const signatureInfo = sdk.transaction.sign({
	privateKeys: [ privateKey ],
	blob,
});

console.log(signatureInfo);

```

###  submit

> 接口说明

   该接口实现交易的提交

> 调用方法

sdk.transaction.submit(args)

> 请求参数args为Object, 包含如下属性



   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
blob | String  | 必填，交易blob
signature | Array | 必填，签名列表


> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
hash    |   String     |  交易hash



> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_BLOB_ERROR | 11056 | Invalid blob
INVALID_SIGNATURE_ERROR | 15027 | Invalid signature
SYSTEM_ERROR |   20000     |  System error

> 示例

```js
  let transactionInfo = yield sdk.transaction.submit({
    blob: blob,
    signature: signature,
  });

```
## 区块服务

### getNumber

> 接口说明

  查询最新的区块高度

> 调用方法

sdk.block.getNumber()


> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
header    |   Object    |  区块头
blockNumber    |   String    |  最新的区块高度

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
SYSTEM_ERROR |   20000     |  System error

> 示例

```js
sdk.block.getNumber().then((result) => {
  console.log(result);
}).catch((err) => {
  console.log(err.message);
});

```

### checkStatus

> 接口说明

  检查本地节点区块是否同步完成

> 调用方法

sdk.block.checkStatus()


> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
isSynchronous     |   boolean     |  区块是否同步

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.checkStatus().then((result) => {
  console.log(result);
}).catch((err) => {
  console.log(err.message);
});

```

### getTransactions

> 接口说明

  查询指定区块高度下的所有交易


> 调用方法

sdk.block.getTransactions(blockNumber)


> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
blockNumber     |   String     |  待查询的区块高度


> 响应数据

参数  |    类型 |   描述  |
-----------|------------|----------------|
total_count  |   String   |   返回的总交易数
transactions    |  [Array](#transactions)    |   交易内容

### transactions
成员变量  |     类型     |        描述       |
----------- | ------------ | ---------------- |
actual_fee|String|交易实际费用
close_time|String|交易关闭时间
error_code|String|交易错误码
error_desc|String|交易描述
hash|String|交易hash
ledger_seq|String|区块序列号
transaction|[TransactionInfo Object](#transactionInfoObject)|交易内容列表
signatures|[Signature Object](#signatureObject)|签名列表
tx_size|int64|交易大小

### transactionInfoObject

   成员      |     类型     |        描述       |
----------- | ------------ | ---------------- |
source_address|String|交易发起的源账户地址
fee_limit|String|交易费用
gas_price|String|交易打包费用
nonce|String|交易序列号
operations|Object|操作列表


### signatureObject
成员变量      |     类型     |        描述       |
----------- | ------------ | ---------------- |
sign_data|String|签名后数据
public_key|String|公钥



> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_BLOCKNUMBER_ERROR | 11060 | BlockNumber must bigger than 0
QUERY_RESULT_NOT_EXIST | 15014 | Query result not exist
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getTransactions(100).then(result => {
  console.log(result);
  console.log(JSON.stringify(result));
}).catch(err => {
  console.log(err.message);
});
```


### getInfo-区块

> 接口说明

  获取区块信息

> 调用方法

sdk.block.getInfo(blockNumber)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
blockNumber     |   String     |  待查询的区块高度

> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
closeTime | String | 区块关闭时间
number | String | 区块高度
txCount | String | 交易总量
version | String | 区块版本

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_BLOCKNUMBER_ERROR | 11060 | BlockNumber must bigger than 0
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getInfo(100).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### getLatestInfo

> 接口说明

  获取最新区块信息

> 调用方法

sdk.block. getLatestInfo()


> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
closeTime | String | 区块关闭时间
number | String | 区块高度
txCount | String | 交易总量
version | String | 区块版本

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getLatestInfo().then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```


### getValidators

> 接口说明

  获取指定区块中所有验证节点数

> 调用方法

sdk.block.getValidators(blockNumber)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
blockNumber     |   String     |  待查询的区块高度

> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
validators | Array | 验证节点列表

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_BLOCKNUMBER_ERROR | 11060 | BlockNumber must bigger than 0
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getValidators(100).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});
```

### getLatestValidators

> 接口说明

   获取最新区块中所有验证节点数

> 调用方法

sdk.block.getLatestValidators()


> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
validators | Array | 验证节点列表

> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getLatestValidators().then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### getReward

> 接口说明

  获取指定区块中的区块奖励和验证节点奖励 (推荐使用 [getLatestReward](#getlatestreward) 替代)

> 调用方法

sdk.block.getReward(blockNumber)



> 请求参数

| 参数        | 类型   | 描述             |
| ----------- | ------ | ---------------- |
| blockNumber | String | 待查询的区块高度 |



> 响应数据

   参数      |     类型     |        描述       
----------- | ------------ | ---------------- 
validators | Array | 记账节点列表 
kols | Array | 生态节点列表 


> 节点列表的元素为Object，其中包含如下属性

   参数      |     类型     |        描述       
----------- | ------------ | ---------------- 
address | String| 节点地址 
 reward | Array | 节点奖励列表 

> reward列表[ value0, value1, value2 ]

| 参数   | 类型   | 描述             |
| :----- | ------ | ---------------- |
| Value0 | String | 奖励金额         |
| Value1 | String | 投票奖励分配地址 |
| Value2 | Number | 投票奖励分配比率 |

> 错误码

   异常       |     错误码   |   描述   
-----------  | ----------- | -------- 
INVALID_BLOCKNUMBER_ERROR | 11060 | BlockNumber must bigger than 0
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getReward(100).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### getLatestReward

> 接口说明

   获取最新区块中的区块奖励和验证节点奖励

> 调用方法

sdk.block.getLatestReward()

> 响应数据

| 参数       | 类型  | 描述         |
| ---------- | ----- | ------------ |
| validators | Array | 记账节点列表 |
| kols       | Array | 生态节点列表 |

> 节点列表的元素为Object，其中包含如下属性

| 参数    | 类型   | 描述         |
| ------- | ------ | ------------ |
| address | String | 节点地址     |
| reward  | Array  | 节点奖励列表 |

reward列表[ value0, value1, value2 ]

| 参数   | 类型   | 描述             |
| :----- | ------ | ---------------- |
| Value0 | String | 奖励金额         |
| Value1 | String | 投票奖励分配地址 |
| Value2 | Number | 投票奖励分配比率 |

> 错误码

   异常       |     错误码   |   描述   
-----------  | ----------- | -------- 
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getLatestReward().then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```


### getFees

> 接口说明

   获取指定区块中的账户最低资产限制和打包费用

> 调用方法

sdk.block.getFees(blockNumber)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
blockNumber     |   String     |  待查询的区块高度

> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
fees | Object | 费用



> fees包含如下属性

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
baseReserve | String| 账户最低资产限制
 gasPrice | String | 打包费用，单位MO，1 BU = 10^8 MO



> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_BLOCKNUMBER_ERROR | 11060 | BlockNumber must bigger than 0
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getFees(100).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### getLatestFees

> 接口说明

   获取最新区块中的账户最低资产限制和打包费用

> 调用方法

sdk.block.getLatestFees()

> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
fees | Object | 费用



> fees包含如下属性

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
baseReserve | String| 账户最低资产限制
 gasPrice | String | 打包费用，单位MO，1 BU = 10^8 MO



> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

sdk.block.getLatestFees().then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```


## 合约服务

### getInfo-合约

> 接口说明

  查询合约代码

> 调用方法

sdk.contract.getInfo(contractAddress)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
contractAddress     |   String     |  合约账户地址

> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
contract |Object | 合约信息
type | Number | 合约类型
payload | String | 合约代码


> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_CONTRACTADDRESS_ERROR | 11037 |Invalid contract address
CONTRACTADDRESS_NOT_CONTRACTACCOUNT_ERROR |11038 |ContractAddress is not a contract account
INVALID_CONTRACT_HASH_ERROR | 11025 | Invalid transaction hash to create contract
SYSTEM_ERROR |   20000     |  System error

> 示例

```js
const contractAddress = 'buQqbhTrfAqZtiX79zp4MWwUVfpcadvtz2TM';
sdk.contract.getInfo(contractAddress).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### checkValid-合约

> 接口说明

  检测合约账户地址的有效性

> 调用方法

sdk.contract.checkValid(contractAddress)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
contractAddress     |   String     |  合约账户地址

> 响应数据

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
isValid |boolean | 合约账户地址是否有效



> 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_CONTRACTADDRESS_ERROR | 11037 |Invalid contract address
CONTRACTADDRESS_NOT_CONTRACTACCOUNT_ERROR |11038 |ContractAddress is not a contract account
SYSTEM_ERROR |   20000     |  System error

> 示例

```js

const contractAddress = 'buQhP94E8FjWDF3zfsxjqVQDeBypvzMrB3y3';
sdk.contract.checkValid(contractAddress).then(result => {
  console.log(result);
}).catch(err => {
  console.log(err.message);
});

```

### getAddress-合约

> 接口说明

  查询合约地址

> 调用方法

sdk.contract.getAddress(hash)

> 请求参数

参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
hash     |   String     |  创建合约交易的hash   |

> 响应数据

参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
contractAddressList|List<[ContractAddressInfo](#contractaddressinfo)>|合约地址列表

#### ContractAddressInfo

成员      |     类型     |        描述       |
----------- | ------------ | ---------------- |
contract_address|String|合约地址
operation_index|Number|所在操作的下标

> 错误码

异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
INVALID_HASH_ERROR|11055|Invalid transaction hash
SYSTEM_ERROR|20000|System error

> 示例

```js

const hash = 'f298d08ec3987adc3aeef73e81cbb49cbad2316145ba190700de2d78657880c0';
sdk.contract.getAddress(hash).then(data => {
  console.log(data);
})

```


## 工具

### utfToHex

> 接口说明

  utf8字符串转换成十六进制字符串

> 调用方法

sdk.util.utfToHex(str)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
str     |   String    |  待转换的字符串

> 响应数据

  十六进制字符串 / undefined（参数不正确时）


> 示例

```js
const hexString = sdk.util.utfToHex('hello, world');
console.log(hexString);
```

### hexToUtf

> 接口说明

  十六进制字符串转换成utf8字符串

> 调用方法

sdk.util.hexToUtf(str)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
str     |   String    |  待转换的字符串

> 响应数据

  utf8字符串 / undefined（参数不正确时）


> 示例

```js
const utfString = sdk.util.hexToUtf('68656c6c6f2c20776f726c64');
console.log(utfString);
```



### buToMo

> 接口说明

  bu转换成mo

> 调用方法

sdk.util.buToMo(str)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
str     |   String    |  待转换的字符串(字符串最多支持8位小数)

> 响应数据

  字符串 / ''（参数不正确时）


> 示例

```js
const mo = sdk.util.buToMo('5');
console.log(mo);
```


### moToBu

> 接口说明

  mo转换bu

> 调用方法

sdk.util.moToBu(str)

> 请求参数

   参数      |     类型     |        描述       |
----------- | ------------ | ---------------- |
str     |   String    |  待转换的字符串

> 响应数据

  字符串 / ''（参数不正确时）


> 示例

```js
const bu = sdk.util.moToBu('500000000');
console.log(bu);
```


## 错误码

   异常       |     错误码   |   描述   |
-----------  | ----------- | -------- |
ACCOUNT_CREATE_ERROR	                      |	11001	|	Failed to create the account
INVALID_SOURCEADDRESS_ERROR									|	11002	|	Invalid sourceAddress
INVALID_DESTADDRESS_ERROR										|	11003	|	Invalid destAddress
INVALID_INITBALANCE_ERROR										|	11004	|	InitBalance must between 1 and max(int64)
SOURCEADDRESS_EQUAL_DESTADDRESS_ERROR				|	11005	|	SourceAddress cannot be equal to destAddress
INVALID_ADDRESS_ERROR												|	11006	|	Invalid address
CONNECTNETWORK_ERROR												|	11007 |	Connect network failed
METADATA_NOT_HEX_STRING_ERROR								|	11008 |	Metadata must be a hex string
NO_ASSET_ERROR															| 11009 |	The account does not have the asset
NO_METADATA_ERROR														| 11010 |	The account does not have the metadata
INVALID_DATAKEY_ERROR												| 11011 |	The length of key must between 1 and 1024
INVALID_DATAVALUE_ERROR											| 11012 |	The length of value must between 0 and 256000
INVALID_DATAVERSION_ERROR										| 11013 |	The version must be equal to or greater than 0
INVALID_MASTERWEIGHT_ERROR									| 11015 |	MasterWeight must between 0 and max(uint32)
INVALID_SIGNER_ADDRESS_ERROR								| 11016 |	Invalid signer address
INVALID_SIGNER_WEIGHT_ERROR									| 11017 |	Signer weight must between 0 and max(uint32)
INVALID_TX_THRESHOLD_ERROR									| 11018 |	TxThreshold must between 0 and max(int64)
INVALID_OPERATION_TYPE_ERROR								| 11019 |	Operation type must between 1 and 100
INVALID_TYPE_THRESHOLD_ERROR								| 11020 |	TypeThreshold must between 0 and max(int64)
INVALID_ASSET_CODE_ERROR										| 11023 |	The length of key must between 1 and 1024
INVALID_ASSET_AMOUNT_ERROR									| 11024 |	AssetAmount must between 1 and max(int64)
INVALID_BU_AMOUNT_ERROR											| 11026 |	BuAmount must between 1 and max(int64)
INVALID_ISSUER_ADDRESS_ERROR								| 11027 |	Invalid issuer address
NO_SUCH_TOKEN_ERROR													| 11030	|	No such token
INVALID_TOKEN_NAME_ERROR										| 11031	|	The length of token name must between 1 and 1024
INVALID_TOKEN_SIMBOL_ERROR									| 11032	|	The length of symbol must between 1 and 1024
INVALID_TOKEN_DECIMALS_ERROR								| 11033	|	Decimals must less than 8
INVALID_TOKEN_TOTALSUPPLY_ERROR							| 11034	|	TotalSupply must between 1 and max(int64)
INVALID_TOKENOWNER_ERRPR										| 11035	|	Invalid token owner
INVALID_CONTRACTADDRESS_ERROR								| 11037	|	Invalid contract address
CONTRACTADDRESS_NOT_CONTRACTACCOUNT_ERROR		| 11038	|	ContractAddress is not a contract account
INVALID_TOKEN_AMOUNT_ERROR									| 11039	|	Amount must between 1 and max(int64)
SOURCEADDRESS_EQUAL_CONTRACTADDRESS_ERROR		| 11040	|	SourceAddress cannot be equal to contractAddress
INVALID_FROMADDRESS_ERROR										| 11041	|	Invalid fromAddress
FROMADDRESS_EQUAL_DESTADDRESS_ERROR					| 11042	|	FromAddress cannot be equal to destAddress
INVALID_SPENDER_ERROR												| 11043	|	Invalid spender
INVALID_LOG_TOPIC_ERROR											| 11045	|	The length of log topic must between 1 and 128
INVALID_LOG_DATA_ERROR											| 11046	|	The length of one of log data must between 1 and 1024
INVALID_NONCE_ERROR													| 11048	|	Nonce must between 1 and max(int64)
INVALID_GASPRICE_ERROR											| 11049	|	Amount must between gasPrice in block and max(int64)
INVALID_FEELIMIT_ERROR											| 11050	|	FeeLimit must between 1 and max(int64)
OPERATIONS_EMPTY_ERROR											| 1105O	|	Perations cannot be empty
INVALID_CEILLEDGERSEQ_ERROR									| 11052	|	CeilLedgerSeq must be equal to or greater than 0
OPERATIONS_ONE_ERROR												| 11053	|	One of operations error
INVALID_SIGNATURENUMBER_ERROR								| 11054	|	SignagureNumber must between 1 and max(int32)
INVALID_HASH_ERROR													| 11055	|	Invalid transaction hash
INVALID_BLOB_ERROR													| 11056	|	Invalid blob
PRIVATEKEY_NULL_ERROR												|	11057	| PrivateKeys cannot be empty
PRIVATEKEY_ONE_ERROR												| 11058	|	One of privateKeys is invalid
URL_EMPTY_ERROR															| 11062	|	Url cannot be empty
CONTRACTADDRESS_CODE_BOTH_NULL_ERROR				| 11063	|	ContractAddress and code cannot be empty at the same time
INVALID_OPTTYPE_ERROR												| 11064	|	OptType must between 0 and 2
INVALID_SIGNATURE_ERROR 										| 15027 | Invalid signature
GET_ALLOWANCE_ERROR													| 11065	|	Get allowance error
GET_TOKEN_INFO_ERROR												| 11066	|	Get token info error
CONNECTN_BLOCKCHAIN_ERROR										| 19999	|	Failed to connect to the blockchain
SYSTEM_ERROR																| 20000	|	System error
ACCOUNT_NOT_EXIST                           | 15001 | Account not exist
INVALID_NUMBER_OF_ARG                       | 15006 | Invalid number of arguments to the function
QUERY_RESULT_NOT_EXIST                      | 15014 | Query result not exist
INVALID_ARGUMENTS                           | 15016 | Invalid arguments to the function',
FAIL                                        | 15017 | Fail
INVALID_FORMAT_OF_ARG                       | 15019 | Invalid format of argument to the function
INVALID_OPERATIONS                          | 15022 | Invalid operation
INVALID_SIGNATURE_ERROR                     | 15027 | Invalid signature
INVALID_METADATA_ERROR                      | 15028 | Invalid metadata
INVALID_INPUT_ERROR                         | 15028 | Invalid input
INVALID_DELETEFLAG_ERROR                    | 15029 | DeleteFlag must be a boolean
INVALID_CONTRACT_BU_AMOUNT_ERROR            | 15030 | BuAmount must between 0 and max(int64)
INVALID_CONTRACT_ASSET_AMOUNT_ERROR         | 15031 | AssetAmount must between 0 and max(int64)
