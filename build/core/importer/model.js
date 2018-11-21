"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _sequelize = require("sequelize");

var _sequelize2 = _interopRequireDefault(_sequelize);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _config = require("../../config.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var db = process.env.NODE_ENV === 'development' ? _config.database : {
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
};

var sequelize = new _sequelize2.default(db.database, db.user, db.password, {
    host: db.host,
    dialect: db.dialect,
    logging: _config.environment === "development" ? console.log : false,
    dialectOptions: {
        useUTC: true
    },
    timezone: _config.time.zone,
    operatorsAliases: false
});

var models = {};
var folder = _path2.default.join(__dirname, "..", "..", _config.folders.models);
_fs2.default.readdirSync(folder).forEach(function (file) {
    if (file.indexOf(".js") !== -1 && file !== "index.js") {
        models[_lodash2.default.upperFirst(_lodash2.default.camelCase(file.replace(".js", "")))] = sequelize.import(folder + "/" + file);
    }
});

Object.keys(models).forEach(function (model) {
    if ("associate" in models[model]) {
        models[model].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = _sequelize2.default;

exports.default = models;