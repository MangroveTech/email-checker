var dns = require('dns');
var async = require('async');

var RegexToValidateEmail = /^([a-z0-9][a-z0-9\-\._]*[a-z0-9]+)@([a-z0-9]+[a-z0-9\-\._]*[a-z0-9]+)$/i;

function GmailChecker(emails) {
  this.emails = emails;
  this.items = {};
  this.resutls = {};
  this.recorder = {'gmail.com': true, 'google.com': true};
  this.init();
}

GmailChecker.prototype.init = function init() {
  var self = this;
  self.emails.forEach(function (email) {
    if (typeof email === 'string') {
      var matchs = email.match(RegexToValidateEmail);
      if (Array.isArray(matchs) && matchs.length >= 3) {
        var domain = matchs[2];
        self.items[email] = {};
        self.items[email].username = matchs[1];
        self.items[email].domain = domain;
        self.items[email].isGmail = !!(self.recorder[domain]);
        if (!self.recorder[domain]) {
          self.recorder[domain] = false;
        }
      }
    }
  });
};

GmailChecker.prototype.check = function check(cb) {
  var self =  this;
  var items = self.items;
  var emails = self.emails;

  var domains = Object.keys(self.recorder);
  async.eachLimit(domains, 50, function (domain, callback) {
    if (self.recorder[domain]) {
      callback();
    } else {
      dns.resolve(domain, 'MX', function (err, mx) {
        // console.log(domain, err, mx);
        if (err) {
          return callback();
        }
        self.isRightMx(mx, function (right) {
          self.recorder[domain] = right;
          callback();
        });
      });
    }
  }, function () {
    var results = {};
    emails.forEach(function (email) {
      var item = items[email];
      if (!item) {
        return;
      }
      item.isGmail = self.recorder[item.domain];
      results[email] = item.isGmail;
    });
    cb(results);
  });

};

var mxGmRegex = /(\.l)?\.(google|googlemail)\.com$/i;
GmailChecker.prototype.isRightMx = function isRightMx(mx, cb) {
  //FIXME: should use better logic to device it's gmail mx.
  var right = false;
  var i = 0;
  if (Array.isArray(mx) && mx.length > 0) {
    for (i = 0; i < mx.length; i++) {
      if (mxGmRegex.test(mx[i].exchange)) {
        right = true;
        break;
      }
    }
  }
  setImmediate(function () {
    cb(right);
  });
};

exports.GmailChecker = GmailChecker;