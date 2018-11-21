"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _bcrypt = require("bcrypt");

var _bcrypt2 = _interopRequireDefault(_bcrypt);

var _config = require("../config.json");

var _config2 = _interopRequireDefault(_config);

var _model = require("./importer/model");

var _model2 = _interopRequireDefault(_model);

var _colors = require("colors");

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; } /** 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                            * Utilities
                                                                                                                                                                                                                                                                                                                                                                                                                                                                           */


exports.default = {

    table_prefix: function table_prefix(fields, prefix) {
        var newFields = {};
        Object.keys(new Object(fields)).forEach(function (field, index) {
            newFields[prefix + "." + field] = fields[field];
        });
        return newFields;
    },

    check_props: function check_props(obj) {
        var proper = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

        obj = new Object(obj);
        for (var i = 0; i < proper.length; i++) {
            if (!obj.hasOwnProperty(proper[i])) {
                return proper[i];
            }
        }
        return null;
    },

    num_pad: function num_pad(num, size) {
        var s = String(num);
        while (s.length < (size || 2)) {
            s = "0" + s;
        }
        return s;
    },

    format_date: function format_date() {
        var waktu = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : new Date();

        return waktu.getFullYear() + "-" + this.num_pad(waktu.getMonth() + 1) + "-" + this.num_pad(waktu.getDate());
    },

    hash: function hash(password) {
        var salt_rounds = _config2.default.encryption.salt_rounds;

        return _bcrypt2.default.hashSync(password, salt_rounds);
    },

    verify: function verify(hashed, plain) {
        return _bcrypt2.default.compareSync(plain, hashed);
    },

    craft_seed_data: function () {
        var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(target) {
            var data, keys, i, key, field, rel;
            return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            data = {};
                            keys = Object.keys(target);
                            i = 0;

                        case 3:
                            if (!(i < keys.length)) {
                                _context.next = 23;
                                break;
                            }

                            key = keys[i];
                            field = target[keys[i]];

                            if (!(typeof field === "function")) {
                                _context.next = 10;
                                break;
                            }

                            data[key] = field();
                            _context.next = 20;
                            break;

                        case 10:
                            if (!((typeof field === "undefined" ? "undefined" : _typeof(field)) === "object")) {
                                _context.next = 20;
                                break;
                            }

                            if (!field.wrap) {
                                _context.next = 15;
                                break;
                            }

                            data[key] = field.wrap(field.method());
                            _context.next = 20;
                            break;

                        case 15:
                            if (!field.table) {
                                _context.next = 20;
                                break;
                            }

                            _context.next = 18;
                            return _model2.default[field.table].findOne({ attributes: ["id"], order: _model2.default.Sequelize.literal(_config2.default.database.dialect === 'postgres' ? 'random()' : 'rand()') });

                        case 18:
                            rel = _context.sent;

                            if (rel) data[key] = rel.id;

                        case 20:
                            i++;
                            _context.next = 3;
                            break;

                        case 23:
                            return _context.abrupt("return", data);

                        case 24:
                        case "end":
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function craft_seed_data(_x3) {
            return _ref.apply(this, arguments);
        }

        return craft_seed_data;
    }(),

    log: function log(message, status) {
        var color = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "white";
        var nl = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : "\n\n";

        var tick = "";
        if (status === "success") {
            color = "green";
            tick = "✓";
        } else if (status === "error") {
            color = "red";
            tick = "✗";
        }
        var out = color ? (tick + " " + message)[color] : tick + " " + message;
        if (nl) console.log(nl);
        console.log(out);
    },

    extractModelAttrib: function extractModelAttrib(modelName) {
        var model = _model2.default[modelName];
        var attribs = {
            primary: [],
            fields: [],
            requiredFields: [],
            allowNullFields: [],
            originalFields: [],
            generateFields: [],
            relations: []
        };
        if (model) {
            Object.keys(model.rawAttributes).forEach(function (column) {
                var info = model.rawAttributes[column];
                if (info.primaryKey) {
                    attribs.primary.push(column);
                }
                if (info.allowNull && !info._autoGenerated) {
                    attribs.allowNullFields.push(column);
                }
                if (!info.allowNull && !info._autoGenerated) {
                    attribs.requiredFields.push(column);
                }
                if (info.references) {
                    attribs.relations.push(column);
                }
                if (!info.primaryKey && !info.references && column !== 'created_at' && column !== 'updated_at') {
                    attribs.originalFields.push(column);
                }
                if (column !== 'id' && column !== 'created_at' && column !== 'updated_at') {
                    attribs.generateFields.push(column);
                }
                attribs.fields.push(column);
            });
        }
        return attribs;
    }

};