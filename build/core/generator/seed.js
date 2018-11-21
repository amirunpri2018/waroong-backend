"use strict";

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _model = require("../importer/model");

var _model2 = _interopRequireDefault(_model);

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _seedconfig = require("../../seedconfig");

var _seedconfig2 = _interopRequireDefault(_seedconfig);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var args = process.argv[2];

if (args) {
    var entity = args.split(":")[0];
    var times = args.split(":")[1] ? args.split(":")[1] : _seedconfig2.default.default_times;

    if (_seedconfig2.default.entities[entity]) {

        _model2.default.sequelize.sync().then(_asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
            var target, bulk, i;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            target = _seedconfig2.default.entities[entity];
                            bulk = [];

                            if (!_model2.default[entity]) {
                                _context.next = 16;
                                break;
                            }

                            i = 0;

                        case 4:
                            if (!(i < times)) {
                                _context.next = 13;
                                break;
                            }

                            _context.t0 = bulk;
                            _context.next = 8;
                            return _utils2.default.craft_seed_data(target);

                        case 8:
                            _context.t1 = _context.sent;

                            _context.t0.push.call(_context.t0, _context.t1);

                        case 10:
                            i++;
                            _context.next = 4;
                            break;

                        case 13:
                            _model2.default[entity].bulkCreate(bulk).then(function (ret) {
                                _utils2.default.log(times + " data " + entity + " tersimpan", "success");
                                process.exit(0);
                            }).catch(function (err) {
                                _utils2.default.log(err, "error");
                                process.exit(0);
                            });
                            _context.next = 18;
                            break;

                        case 16:
                            _utils2.default.log("Model untuk entity " + entity + " tidak ditemukan", "error");
                            process.exit(0);

                        case 18:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        })));
    } else {
        _utils2.default.log("Entity " + entity + " tidak ditemukan. Sertakan konfigurasi seed untuk entity " + entity + " di ./seed/seedconfig.js", "error");
        process.exit(0);
    }
} else {
    _utils2.default.log("Sertakan target entity dan jumlah seed {entity:n}", "error");
    process.exit(0);
}