'use strict';

/* eslint-env mocha */
var assert = require('assert');
var Fcbuffer = require('fcbuffer');

var Eos = require('.');

describe('shorthand', function () {

  it('asset', function () {
    var eos = Eos.Localnet();
    var types = eos.fc.types;

    var AssetType = types.asset();

    assertSerializer(AssetType, '1.0000 EOS');

    var obj = AssetType.fromObject('1 EOS');
    assert.equal(obj, '1.0000 EOS');

    var obj2 = AssetType.fromObject({ amount: 10000, symbol: 'EOS' });
    assert.equal(obj, '1.0000 EOS');
  });

  it('authority', function () {
    var eos = Eos.Localnet();
    var authority = eos.fc.structs.authority;


    var pubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
    var auth = { threshold: 1, keys: [{ key: pubkey, weight: 1 }], accounts: [] };

    assert.deepEqual(authority.fromObject(pubkey), auth);
    assert.deepEqual(authority.fromObject(auth), auth);
  });

  it('PublicKey sorting', function () {
    var eos = Eos.Localnet();
    var authority = eos.fc.structs.authority;


    var pubkeys = ['EOS7wBGPvBgRVa4wQN2zm5CjgBF6S7tP7R3JavtSa2unHUoVQGhey', 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV'];

    var authSorted = { threshold: 1, keys: [{ key: pubkeys[1], weight: 1 }, { key: pubkeys[0], weight: 1 }], accounts: [] };

    var authUnsorted = { threshold: 1, keys: [{ key: pubkeys[0], weight: 1 }, { key: pubkeys[1], weight: 1 }], accounts: []

      // assert.deepEqual(authority.fromObject(pubkey), auth)
    };assert.deepEqual(authority.fromObject(authUnsorted), authSorted);
  });

  it('public_key', function () {
    var eos = Eos.Localnet();
    var _eos$fc = eos.fc,
        structs = _eos$fc.structs,
        types = _eos$fc.types;

    var PublicKeyType = types.public_key();
    var pubkey = 'EOS6MRyAjQq8ud7hVNYcfnVPJqcVpscN5So8BhtHuGYqET5GDW5CV';
    // 02c0ded2bc1f1305fb0faac5e6c03ee3a1924234985427b6167ca569d13df435cf
    assertSerializer(PublicKeyType, pubkey);
  });

  it('extended_asset', function () {
    var eos = Eos.Localnet({ defaults: true });
    var eaType = eos.fc.types.extended_asset();
    var eaString = eaType.toObject();
    assertSerializer(eaType, eaString);
    assert.equal(eaType.toObject('1 SBL'), '1.0000 SBL@eosio');
  });

  it('symbol', function () {
    var eos = Eos.Localnet();
    var types = eos.fc.types;

    var AssetSymbolType = types.symbol();

    assertSerializer(AssetSymbolType, 'EOS');

    var obj = AssetSymbolType.fromObject('EOS');
    var buf = Fcbuffer.toBuffer(AssetSymbolType, obj);
    assert.equal(buf.toString('hex'), '04454f5300000000');
  });

  it('signature', function () {
    var eos = Eos.Localnet();
    var types = eos.fc.types;

    var SignatureType = types.signature();
    var signatureString = 'EOSKVm5YYck2DXHnUUKPinUFzVuxFngi7MAasbKCnvT1wP6sKwzRX9dngXV89gbwXM5HdGJzFtSwjGaP3SFMaQFFDGtStpeAN';
    assertSerializer(SignatureType, signatureString);
  });
});

if (process.env['NODE_ENV'] === 'development') {

  describe('Eosio Abi', function () {

    it('Eosio contract parses', function (done) {
      var eos = Eos.Localnet();

      eos.contract('eosio', function (error, eosio) {
        assert(!error, error);
        assert(eosio.transfer, 'eosio contract');
        assert(eosio.issue, 'eosio contract');
        done();
      });
    });
  });
}

describe('Message.data', function () {
  it('json', function () {
    var eos = Eos.Localnet({ forceActionDataHex: false });
    var _eos$fc2 = eos.fc,
        structs = _eos$fc2.structs,
        types = _eos$fc2.types;

    var value = {
      account: 'eosio',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1.0000 EOS',
        memo: ''
      },
      authorization: []
    };
    assertSerializer(structs.action, value);
  });

  it('hex', function () {
    var eos = Eos.Localnet({ forceActionDataHex: false, debug: false });
    var _eos$fc3 = eos.fc,
        structs = _eos$fc3.structs,
        types = _eos$fc3.types;


    var tr = { from: 'inita', to: 'initb', quantity: '1.0000 EOS', memo: '' };
    var hex = Fcbuffer.toBuffer(structs.transfer, tr).toString('hex');
    // const lenPrefixHex = Number(hex.length / 2).toString(16) + hex.toString('hex')

    var value = {
      account: 'eosio',
      name: 'transfer',
      data: hex,
      authorization: []
    };

    var type = structs.action;
    var obj = type.fromObject(value); // tests fromObject
    var buf = Fcbuffer.toBuffer(type, obj); // tests appendByteBuffer
    var obj2 = Fcbuffer.fromBuffer(type, buf); // tests fromByteBuffer
    var obj3 = type.toObject(obj); // tests toObject

    assert.deepEqual(Object.assign({}, value, { data: tr }), obj3, 'serialize object');
    assert.deepEqual(obj3, obj2, 'serialize buffer');
  });

  it('force hex', function () {
    var eos = Eos.Localnet({ forceActionDataHex: true });
    var _eos$fc4 = eos.fc,
        structs = _eos$fc4.structs,
        types = _eos$fc4.types;

    var value = {
      account: 'eosio',
      name: 'transfer',
      data: {
        from: 'inita',
        to: 'initb',
        quantity: '1 EOS',
        memo: ''
      },
      authorization: []
    };
    var type = structs.action;
    var obj = type.fromObject(value); // tests fromObject
    var buf = Fcbuffer.toBuffer(type, obj); // tests appendByteBuffer
    var obj2 = Fcbuffer.fromBuffer(type, buf); // tests fromByteBuffer
    var obj3 = type.toObject(obj); // tests toObject

    var data = Fcbuffer.toBuffer(structs.transfer, value.data);
    var dataHex = //Number(data.length).toString(16) + 
    data.toString('hex');

    assert.deepEqual(Object.assign({}, value, { data: dataHex }), obj3, 'serialize object');
    assert.deepEqual(obj3, obj2, 'serialize buffer');
  });

  it('unknown type', function () {
    var eos = Eos.Localnet({ forceActionDataHex: false });
    var _eos$fc5 = eos.fc,
        structs = _eos$fc5.structs,
        types = _eos$fc5.types;

    var value = {
      account: 'eosio',
      name: 'mytype',
      data: '030a0b0c',
      authorization: []
    };
    assertSerializer(structs.action, value);
  });
});

function assertSerializer(type, value) {
  var obj = type.fromObject(value); // tests fromObject
  var buf = Fcbuffer.toBuffer(type, obj); // tests appendByteBuffer
  var obj2 = Fcbuffer.fromBuffer(type, buf); // tests fromByteBuffer
  var obj3 = type.toObject(obj); // tests toObject

  assert.deepEqual(value, obj3, 'serialize object');
  assert.deepEqual(obj3, obj2, 'serialize buffer');
}