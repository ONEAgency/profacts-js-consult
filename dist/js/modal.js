(function() {
window["profactsmodaltemplates"] = window["profactsmodaltemplates"] || {};

window["profactsmodaltemplates"]["popup_1"] = function(obj) {
obj || (obj = {});
var __t, __p = '';
with (obj) {
__p += '<link rel="stylesheet" href="dist/css/template-styles.css">\n<div class="overlay"></div>\n<div class="modal-box-content">\n  <header>\n    <div class="gradient"></div>\n    <h1>Deel uw mening en win!</h1>\n  </header>\n\n  <section>\n    <p>Als bezoeker aan onze website willen wij graag uw mening weten over Acerta als potentiële werkgever.</p>\n    <p>Deelnemen neemt slecht 10-15 minuten in beslag en alle gegevens blijven volledig vertrouwelijk.</p>\n    <p>Bovendien maakt u dan kans op één van onze fantastische prijzen! </p>\n\n    <div class="buttons tac">\n      <a href="#" class="button button-accept">Ik neem deel</a>\n      <a href="#" class="button button-decline">Nu niet</a>\n    </div>\n\n    <div class="grid-2 mobile">\n      <div class="tac">\n        <img src="img/acerta.png" alt="Acerta" class="logo">\n      </div>\n\n      <div class="tac">\n        <img src="img/profacts.png" alt="Profacts" class="logo">\n      </div>\n    </div>\n  </section>\n</div>\n';

}
return __p
}})();
!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ProfactsModal=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
exports.defaults = {};

exports.set = function(name, value, options) {
  // Retrieve options and defaults
  var opts = options || {};
  var defaults = exports.defaults;

  // Apply default value for unspecified options
  var expires  = opts.expires || defaults.expires;
  var domain   = opts.domain  || defaults.domain;
  var path     = opts.path     != undefined ? opts.path     : (defaults.path != undefined ? defaults.path : '/');
  var secure   = opts.secure   != undefined ? opts.secure   : defaults.secure;
  var httponly = opts.httponly != undefined ? opts.httponly : defaults.httponly;

  // Determine cookie expiration date
  // If succesful the result will be a valid Date, otherwise it will be an invalid Date or false(ish)
  var expDate = expires ? new Date(
      // in case expires is an integer, it should specify the number of days till the cookie expires
      typeof expires == 'number' ? new Date().getTime() + (expires * 864e5) :
      // else expires should be either a Date object or in a format recognized by Date.parse()
      expires
  ) : '';

  // Set cookie
  document.cookie = name.replace(/[^+#$&^`|]/g, encodeURIComponent)                // Encode cookie name
  .replace('(', '%28')
  .replace(')', '%29') +
  '=' + value.replace(/[^+#$&/:<-\[\]-}]/g, encodeURIComponent) +                  // Encode cookie value (RFC6265)
  (expDate && expDate.getTime() >= 0 ? ';expires=' + expDate.toUTCString() : '') + // Add expiration date
  (domain   ? ';domain=' + domain : '') +                                          // Add domain
  (path     ? ';path='   + path   : '') +                                          // Add path
  (secure   ? ';secure'           : '') +                                          // Add secure option
  (httponly ? ';httponly'         : '');                                           // Add httponly option
};

exports.get = function(name) {
  var cookies = document.cookie.split(';');

  // Iterate all cookies
  for(var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var cookieLength = cookie.length;

    // Determine separator index ("name=value")
    var separatorIndex = cookie.indexOf('=');

    // IE<11 emits the equal sign when the cookie value is empty
    separatorIndex = separatorIndex < 0 ? cookieLength : separatorIndex;

    // Decode the cookie name and remove any leading/trailing spaces, then compare to the requested cookie name
    if (decodeURIComponent(cookie.substring(0, separatorIndex).replace(/^\s+|\s+$/g, '')) == name) {
      return decodeURIComponent(cookie.substring(separatorIndex + 1, cookieLength));
    }
  }

  return null;
};

exports.erase = function(name, options) {
  exports.set(name, '', {
    expires:  -1,
    domain:   options && options.domain,
    path:     options && options.path,
    secure:   0,
    httponly: 0}
  );
};

},{}],2:[function(_dereq_,module,exports){
'use strict';
var strictUriEncode = _dereq_('strict-uri-encode');

exports.extract = function (str) {
	return str.split('?')[1] || '';
};

exports.parse = function (str) {
	if (typeof str !== 'string') {
		return {};
	}

	str = str.trim().replace(/^(\?|#|&)/, '');

	if (!str) {
		return {};
	}

	return str.split('&').reduce(function (ret, param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		key = decodeURIComponent(key);

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeURIComponent(val);

		if (!ret.hasOwnProperty(key)) {
			ret[key] = val;
		} else if (Array.isArray(ret[key])) {
			ret[key].push(val);
		} else {
			ret[key] = [ret[key], val];
		}

		return ret;
	}, {});
};

exports.stringify = function (obj) {
	return obj ? Object.keys(obj).sort().map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return key;
		}

		if (Array.isArray(val)) {
			return val.sort().map(function (val2) {
				return strictUriEncode(key) + '=' + strictUriEncode(val2);
			}).join('&');
		}

		return strictUriEncode(key) + '=' + strictUriEncode(val);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

},{"strict-uri-encode":3}],3:[function(_dereq_,module,exports){
'use strict';
module.exports = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16);
	});
};

},{}],4:[function(_dereq_,module,exports){
var ProfactsModal, cookies, queryString, src;

queryString = _dereq_("query-string");

cookies = _dereq_("browser-cookies");

src = document.getElementById('profacts-modal').src.split(".js")[1];

module.exports = ProfactsModal = (function() {
  function ProfactsModal(options) {
    var ref, ref1, ref2, ref3, ref4, ref5, ref6;
    this.startdate = (ref = options.startdate) != null ? ref : "2015-01-01T0:00:01", this.enddate = (ref1 = options.enddate) != null ? ref1 : "2016-01-01T0:00:01", this.showratio = (ref2 = options.showratio) != null ? ref2 : 100, this.expireratio = (ref3 = options.expireratio) != null ? ref3 : 0, this.campaignkey = (ref4 = options.campaignkey) != null ? ref4 : "profactscampaign", this.templategroupname = (ref5 = options.templategroupname) != null ? ref5 : "profactsmodaltemplates", this.templatename = (ref6 = options.templatename) != null ? ref6 : "popup_1";
  }

  ProfactsModal.prototype.init = function() {
    this.handleRequestParams();
    this.inrange = this.checkDate(this.getRequestParram("startdate"), this.getRequestParram("enddate"));
    console.log("the range of popup show is: " + this.inrange);
    if (this.inrange) {
      this.makePopup();
      this.shouldshowbyratio = this.checkShowRatio(this.getRequestParram("showratio"));
      if (this.shouldshowbyratio) {
        if (!(cookies.get((this.getRequestParram("campaignkey")) + "_expire") || cookies.get((this.getRequestParram("campaignkey")) + "_accepted"))) {
          this.showPopup();
          return this.attachEvents();
        }
      }
    }
  };

  ProfactsModal.prototype.getTemplate = function() {
    return this.template = window[this.getRequestParram("templategroupname")][this.getRequestParram("templatename")];
  };

  ProfactsModal.prototype.makePopup = function() {
    var template;
    template = this.getTemplate();
    this.wrapper = document.createElement("div");
    this.wrapper.id = "modal-wrapper";
    this.wrapper.innerHTML = this.template();
    return document.body.appendChild(this.wrapper);
  };

  ProfactsModal.prototype.showPopup = function() {
    this.makeExpireCookie(this.getRequestParram("expireratio"));
    setTimeout(function() {
      return document.querySelector('#modal-wrapper').classList.add("added");
    }, 500);
    return setTimeout(function() {
      return document.querySelector('#modal-wrapper').classList.add("shown");
    }, 1000);
  };

  ProfactsModal.prototype.hidePopup = function() {
    setTimeout(function() {
      return document.querySelector('#modal-wrapper').classList.remove("shown");
    }, 500);
    return setTimeout(function() {
      return document.querySelector('#modal-wrapper').classList.remove("added");
    }, 1000);
  };

  ProfactsModal.prototype.attachEvents = function() {
    document.querySelector('#modal-wrapper .overlay').addEventListener('click', (function(_this) {
      return function() {
        if (document.querySelector('#modal-wrapper').classList.contains('shown')) {
          return _this.hidePopup();
        }
      };
    })(this));
    document.querySelector('#modal-wrapper .button-accept').addEventListener('click', (function(_this) {
      return function() {
        if (document.querySelector('#modal-wrapper').classList.contains('shown')) {
          cookies.set((_this.getRequestParram("campaignkey")) + "_accepted", "true", {
            expires: _this.addHours(new Date(end), _this.getTimeZone())
          });
          return _this.hidePopup();
        }
      };
    })(this));
    return document.querySelector('#modal-wrapper .button-decline').addEventListener('click', (function(_this) {
      return function() {
        if (document.querySelector('#modal-wrapper').classList.contains('shown')) {
          return _this.hidePopup();
        }
      };
    })(this));
  };

  ProfactsModal.prototype.makeExpireCookie = function(expireratio) {
    var addfunc, nowPlusRatio;
    addfunc = this.minutesOrHours(expireratio);
    nowPlusRatio = addfunc(new Date(), parseInt(expireratio, 10));
    return cookies.set((this.getRequestParram("campaignkey")) + "_expire", "true", {
      expires: nowPlusRatio
    });
  };

  ProfactsModal.prototype.checkDate = function(start, end) {
    var endDate, now, startDate;
    startDate = this.addHours(new Date(start), this.getTimeZone()).getTime();
    now = new Date().getTime();
    endDate = this.addHours(new Date(end), this.getTimeZone()).getTime();
    if ((startDate < now && now < endDate)) {
      return true;
    } else {
      return false;
    }
  };

  ProfactsModal.prototype.checkShowRatio = function(r) {
    var random;
    random = Math.round(Math.random() * 100);
    if (random <= r) {
      return true;
    } else {
      return false;
    }
  };

  ProfactsModal.prototype.minutesOrHours = function(s) {
    s = s.toString();
    if (s.indexOf("m") > -1) {
      return this.addMinutes;
    }
    if (s.indexOf("h") > -1) {
      return this.addHours;
    }
    return this.addHours;
  };

  ProfactsModal.prototype.addHours = function(d, h) {
    d.setHours(d.getHours() + h);
    return d;
  };

  ProfactsModal.prototype.addMinutes = function(d, m) {
    d.setMinutes(d.getMinutes() + m);
    return d;
  };

  ProfactsModal.prototype.getTimeZone = function() {
    return -new Date().getTimezoneOffset() / 60;
  };

  ProfactsModal.prototype.getRequestParram = function(key) {
    if (this.reqparams[key] == null) {
      console.log(this[key]);
      if (key === "campaignkey" && this[key] === "profactscampaign") {
        console.log("WARNING: every campaign should have a campaignkey. This key is used to create the modal cookies.");
      }
      return this[key];
    } else {
      console.log(this.reqparams[key]);
      return this.reqparams[key];
    }
  };

  ProfactsModal.prototype.handleRequestParams = function() {
    return this.reqparams = queryString.parse(src);
  };

  return ProfactsModal;

})();



},{"browser-cookies":1,"query-string":2}]},{},[4])
(4)
});
(function() {
  var modal;

  modal = new ProfactsModal({});

  modal.init();

}).call(this);
