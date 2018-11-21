"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _config = require("../../config.json");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var folder = _path2.default.join(__dirname, "..", "..", _config.folders.routes);
var routes = {};

_fs2.default.readdirSync(folder).forEach(function (file) {
    if (file.indexOf(".js") !== -1) {
        var name = file.split(".")[0];
        var route = require(folder + "/" + file);
        if (typeof route === "function") routes[name] = require(folder + "/" + file);
    }
});

exports.default = routes;