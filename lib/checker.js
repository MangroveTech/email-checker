var dns = require('dns');

var RegexToValidateEmail = /^([a-z][a-z0-9\-\._]*[a-z0-9]+)@([a-z0-9]+[a-z0-9\-\._]*[a-z0-9]+)$/i;

function EmailChecker(email) {
  this.email = email;
  this.username = null;
  this.domain = null;
  this.regexPass = undefined;
  this.mx = null;
  this.mxError = null;

  this.init();
}

EmailChecker.prototype.init = function init() {
  var self = this;
  self.validateByRegex();
};

EmailChecker.prototype.validateByRegex = function validateByRegex() {
  var self =  this;
  if (self.regexPass === undefined) {
    if (typeof self.email === 'string') {
      var matchs = self.email.match(RegexToValidateEmail);
      if (Array.isArray(matchs) && matchs.length >= 3) {
        self.username = matchs[1];
        self.domain = matchs[2];
        self.regexPass = true;
      } else {
        self.regexPass = false;
      }
    } else {
      self.regexPass = false;
    }
  }

  return self.regexPass;
};

EmailChecker.prototype.lookup = function lookup(cb) {
  var self = this;
  if (!self.validateByRegex()) {
    setImmediate(function () {
      cb(new Error('format error.'));
    });
    return;
  }
  if (self.mxError && self.mxError.code === dns.NODATA) {
    setImmediate(function () {
      cb(self.mxError);
    });

  } else {
    dns.resolve(self.domain, 'MX', function (err, mx) {
      self.mxError = err;
      self.mx = mx;
      cb(err, mx);
    });
  }
};

EmailChecker.prototype.validate = function validateByMX(cb) {
  var self = this;
  self.lookup(function (err) {
    cb(err, !err);
  });
};

var mxGmRegex = /(\.l)?\.google\.com$/i;
EmailChecker.prototype.isGmail = function isGmail(cb) {
  var self = this;
  self.lookup(function (err, mx) {
    if (err) {
      return cb(err, false);
    }
    var list = mx.map(function (val) {
      return val.exchange;
    });
    //FIXME: check mx list.
    cb(null, mxGmRegex.test(list[0]));
  });
};

exports.EmailChecker = EmailChecker;