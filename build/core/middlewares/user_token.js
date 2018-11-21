"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var generateTokens = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(userId, userModel, tokenModel, tokenSecret, refreshTokenSecret, tokenExpire, refreshTokenExpire) {
        var user, userToken, storedToken;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return userModel.findOne({ where: { id: userId } }, { raw: true });

                    case 2:
                        user = _context.sent;

                        if (!user) {
                            _context.next = 9;
                            break;
                        }

                        userToken = {
                            token: _jsonwebtoken2.default.sign({ id: userId }, tokenSecret, { expiresIn: tokenExpire }),
                            refreshToken: _jsonwebtoken2.default.sign({ id: userId }, refreshTokenSecret + user.password, { expiresIn: refreshTokenExpire })
                        };
                        storedToken = tokenModel.create({
                            user_id: userId,
                            refresh_token: userToken.refreshToken
                        });
                        return _context.abrupt("return", userToken);

                    case 9:
                        return _context.abrupt("return", {});

                    case 10:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function generateTokens(_x, _x2, _x3, _x4, _x5, _x6, _x7) {
        return _ref.apply(this, arguments);
    };
}();

var getNewTokens = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(refreshToken, userModel, tokenModel, tokenSecret, refreshTokenSecret, tokenExpire, refreshTokenExpire) {
        var userId, _jwt$decode, id, user, refreshKey, newTokens;

        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        userId = -1;
                        _context2.prev = 1;
                        _jwt$decode = _jsonwebtoken2.default.decode(refreshToken), id = _jwt$decode.id;

                        userId = id;
                        _context2.next = 9;
                        break;

                    case 6:
                        _context2.prev = 6;
                        _context2.t0 = _context2["catch"](1);
                        return _context2.abrupt("return", {});

                    case 9:
                        if (userId) {
                            _context2.next = 11;
                            break;
                        }

                        return _context2.abrupt("return", {});

                    case 11:
                        _context2.next = 13;
                        return userModel.findOne({ where: { id: userId } });

                    case 13:
                        user = _context2.sent;

                        if (user) {
                            _context2.next = 16;
                            break;
                        }

                        return _context2.abrupt("return", {});

                    case 16:
                        refreshKey = refreshTokenSecret + user.password;
                        _context2.prev = 17;

                        _jsonwebtoken2.default.verify(refreshToken, refreshKey);
                        _context2.next = 24;
                        break;

                    case 21:
                        _context2.prev = 21;
                        _context2.t1 = _context2["catch"](17);
                        return _context2.abrupt("return", {});

                    case 24:
                        _context2.next = 26;
                        return generateTokens(userId, userModel, tokenModel, tokenSecret, refreshTokenSecret, tokenExpire, refreshTokenExpire);

                    case 26:
                        newTokens = _context2.sent;

                        newTokens.user = user;
                        return _context2.abrupt("return", newTokens);

                    case 29:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[1, 6], [17, 21]]);
    }));

    return function getNewTokens(_x8, _x9, _x10, _x11, _x12, _x13, _x14) {
        return _ref2.apply(this, arguments);
    };
}();

var _jsonwebtoken = require("jsonwebtoken");

var _jsonwebtoken2 = _interopRequireDefault(_jsonwebtoken);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Token decoder
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            */


exports.default = function (opts) {
    var tokenSecret = opts.tokenSecret,
        refreshTokenSecret = opts.refreshTokenSecret,
        userModel = opts.userModel,
        tokenModel = opts.tokenModel,
        tokenExpire = opts.tokenExpire,
        refreshTokenExpire = opts.refreshTokenExpire;


    return function () {
        var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(req, res, next) {
            var token, refreshToken, _jwt$verify, id, user, dbToken, newTokens;

            return regeneratorRuntime.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:

                            /**
                             * Attach helper function to req object
                             */
                            req.generateUserToken = function () {
                                var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(userId) {
                                    var userToken;
                                    return regeneratorRuntime.wrap(function _callee3$(_context3) {
                                        while (1) {
                                            switch (_context3.prev = _context3.next) {
                                                case 0:
                                                    _context3.next = 2;
                                                    return generateTokens(userId, userModel, tokenModel, tokenSecret, refreshTokenSecret, tokenExpire, refreshTokenExpire);

                                                case 2:
                                                    userToken = _context3.sent;
                                                    return _context3.abrupt("return", userToken);

                                                case 4:
                                                case "end":
                                                    return _context3.stop();
                                            }
                                        }
                                    }, _callee3, undefined);
                                }));

                                return function (_x18) {
                                    return _ref4.apply(this, arguments);
                                };
                            }();

                            req.invalidateAllToken = function () {
                                var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(me) {
                                    var oldTokenPromises, tokens;
                                    return regeneratorRuntime.wrap(function _callee4$(_context4) {
                                        while (1) {
                                            switch (_context4.prev = _context4.next) {
                                                case 0:
                                                    oldTokenPromises = [];
                                                    _context4.next = 3;
                                                    return me.getTokens();

                                                case 3:
                                                    tokens = _context4.sent;

                                                    if (tokens) {
                                                        tokens.forEach(function (tk) {
                                                            oldTokenPromises.push(tk.update({ used: 1 }));
                                                        });
                                                    }
                                                    _context4.next = 7;
                                                    return Promise.all(oldTokenPromises);

                                                case 7:
                                                    return _context4.abrupt("return", _context4.sent);

                                                case 8:
                                                case "end":
                                                    return _context4.stop();
                                            }
                                        }
                                    }, _callee4, undefined);
                                }));

                                return function (_x19) {
                                    return _ref5.apply(this, arguments);
                                };
                            }();

                            /**
                             * Get headers data
                             */
                            token = req.headers["x-access-token"];
                            refreshToken = req.headers["x-refresh-token"];

                            if (!token) {
                                _context5.next = 26;
                                break;
                            }

                            _context5.prev = 5;
                            _jwt$verify = _jsonwebtoken2.default.verify(token, tokenSecret), id = _jwt$verify.id;
                            _context5.next = 9;
                            return userModel.findOne({ where: { id: id } });

                        case 9:
                            user = _context5.sent;

                            user.password = undefined;
                            req.user = user;
                            _context5.next = 26;
                            break;

                        case 14:
                            _context5.prev = 14;
                            _context5.t0 = _context5["catch"](5);

                            if (!(_context5.t0.name === "TokenExpiredError")) {
                                _context5.next = 26;
                                break;
                            }

                            _context5.next = 19;
                            return tokenModel.findOne({ where: { refresh_token: refreshToken } }, { raw: true });

                        case 19:
                            dbToken = _context5.sent;

                            if (!dbToken) {
                                _context5.next = 26;
                                break;
                            }

                            if (dbToken.used) {
                                _context5.next = 26;
                                break;
                            }

                            _context5.next = 24;
                            return getNewTokens(refreshToken, userModel, tokenModel, tokenSecret, refreshTokenSecret, tokenExpire, refreshTokenExpire);

                        case 24:
                            newTokens = _context5.sent;

                            if (newTokens.token && newTokens.refreshToken) {
                                res.set("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
                                res.set("x-access-token", newTokens.token);
                                res.set("x-refresh-token", newTokens.refreshToken);
                                newTokens.user.password = undefined;
                                req.user = newTokens.user;
                                dbToken.update({ used: 1 });
                            }

                        case 26:
                            next();

                        case 27:
                        case "end":
                            return _context5.stop();
                    }
                }
            }, _callee5, undefined, [[5, 14]]);
        }));

        return function (_x15, _x16, _x17) {
            return _ref3.apply(this, arguments);
        };
    }();
};