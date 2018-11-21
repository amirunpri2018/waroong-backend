"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _config = require("../../config.json");

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (model) {

    return "/**\n* File : ./" + _config.folders.models + "/" + model + ".js\n* Tanggal Dibuat : " + new Date().toLocaleString() + "\n* Penulis : " + _os2.default.userInfo().username + "\n*/\n\nexport default (sequelize, DataTypes) => {\n\n    const " + _lodash2.default.upperFirst(_lodash2.default.camelCase(model)) + " = sequelize.define(\"" + model.toLowerCase() + "\", {\n        /**\n         * Kolom tabel disini..\n         */\n    }, {\n        underscored: true\n    });\n\n    " + _lodash2.default.upperFirst(_lodash2.default.camelCase(model)) + ".associate = (models) => {\n        /**\n         * Definisi relasi tabel disini\n         */\n    }\n\n    return " + _lodash2.default.upperFirst(_lodash2.default.camelCase(model)) + ";\n\n}";
};