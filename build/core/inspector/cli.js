"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _route = require("./route");

var _route2 = _interopRequireDefault(_route);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var action = process.argv[2];

if (action === "routes") {
  /**
   * Inspect routes
   */
  var fake_app = (0, _express2.default)();
  fake_app.set("express", _express2.default);
  var info = (0, _route2.default)(fake_app);
  console.log(info.string);
} else if (action === "models") {
  /**
   * Inspect models
   */
}