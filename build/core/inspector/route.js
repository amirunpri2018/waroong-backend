"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _cliTable = require("cli-table2");

var _cliTable2 = _interopRequireDefault(_cliTable);

var _ip = require("ip");

var _ip2 = _interopRequireDefault(_ip);

var _config = require("../../config.json");

var _route = require("../importer/route");

var _route2 = _interopRequireDefault(_route);

var _colors = require("colors");

var _colors2 = _interopRequireDefault(_colors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, models) {

    var route_data = {};

    Object.keys(_route2.default).forEach(function (basepoint) {
        var raw = _route2.default[basepoint];
        route_data["/api/" + basepoint] = { endpoints: [] };
        if (typeof raw === "function") {
            var route = raw(app, models, null);
            route.stack.forEach(function (info) {
                var route = info.route;

                if (route) {
                    var endpoint = route.path;
                    var verbs = route.methods;
                    var keys = info.keys.map(function (t) {
                        return t.name;
                    });
                    route_data["/api/" + basepoint].endpoints.push({ endpoint: endpoint, verbs: extract_verbs(verbs), keys: keys });
                }
            });
        }
    });

    var table = new _cliTable2.default({ head: ["Basepoint".cyan.bold, "Endpoint".cyan.bold, "HTTP Verb".cyan.bold, "Full URI".cyan.bold] });
    Object.keys(route_data).forEach(function (basepoint) {
        var basepoint_data = route_data[basepoint];
        basepoint_data.endpoints.forEach(function (endpoint_data, i) {
            if (i === 0) {
                table.push([{ rowSpan: basepoint_data.endpoints.length, content: basepoint, vAlign: "center" }, endpoint_data.endpoint, endpoint_data.verbs, _config.server.protocol + "://" + _ip2.default.address() + ":" + _config.server.port + basepoint + endpoint_data.endpoint]);
            } else {
                table.push([endpoint_data.endpoint, endpoint_data.verbs, _config.server.protocol + "://" + _ip2.default.address() + ":" + _config.server.port + basepoint + endpoint_data.endpoint]);
            }
        });
    });

    function extract_verbs(verbs) {
        var extracted = "GET";
        Object.keys(verbs).forEach(function (verb) {
            if (verbs[verb]) {
                extracted = verb.toUpperCase();
            }
        });
        return extracted;
    }

    return {
        data: route_data,
        string: table.toString()
    };
};