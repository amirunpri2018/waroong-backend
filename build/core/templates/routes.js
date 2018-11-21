"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _os = require("os");

var _os2 = _interopRequireDefault(_os);

var _config = require("../../config.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (route) {

    return "/**\n* File : ./" + _config.folders.routes + "/" + route + ".js \n* Tanggal Dibuat : " + new Date().toLocaleString() + "\n* Penulis : " + _os2.default.userInfo().username + "\n*/\n\nimport { a } from '../middlewares/wrapper/request_wrapper';\nimport { requiredPost, requiredGet } from '../middlewares/validator/request_fields';\nimport { onlyAuth } from '../middlewares/validator/auth';\n\nfunction " + route + "(app, models, socketListener) {\n    let router = app.get(\"express\").Router();\n\n    return router;\n}\n\nmodule.exports = " + route + ";";
};