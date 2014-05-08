var test = require('tape');
var GmailChecker = require('../').GmailChecker;

test('gmail checker', function (t) {
  t.plan(10);
  var gmc = new GmailChecker(['cn.lixiaojun@gmail.com']);
  gmc.check(function (results) {
    t.ok(results['cn.lixiaojun@gmail.com'], 'should be gmail.');
  });

  var data2 = ['lixiaojun 2', '123@qq.com', 'cn.lixiaojun@seedmail-inc.com'];
  var gmc2 = new GmailChecker(data2);
  gmc2.check(function (results) {
    t.ok(results['lixiaojun 2'] === undefined, 'should be undefined.');
    t.notOk(results['123@qq.com'], 'should be not gmail.');
    t.ok(results['cn.lixiaojun@seedmail-inc.com'], 'should be gmail.');

  });

  var data3 = ['lixiaojun 2', 'alibaba@hh.waveapp.im', 'lixiaojun@google.com', '中文@qq.com', '123@qq.com', 'cn.lixiaojun@seedmail-inc.com'];
  var gmc3 = new GmailChecker(data3);
  gmc3.check(function (results) {
    t.ok(results['lixiaojun 2'] === undefined, 'should be undefined.');
    t.notOk(results['alibaba@hh.waveapp.im'], 'should be not gmail.');
    t.ok(results['lixiaojun@google.com'], 'should be gmail.');
    t.notOk(results['中文@qq.com'], 'should be not gmail.');
    t.notOk(results['123@qq.com'], 'should be not gmail.');
    t.ok(results['cn.lixiaojun@seedmail-inc.com'], 'should be gmail.');

  });
});