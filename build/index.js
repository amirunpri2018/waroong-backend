"use strict";

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _http = require("http");

var _http2 = _interopRequireDefault(_http);

var _socket = require("socket.io");

var _socket2 = _interopRequireDefault(_socket);

var _siriusExpress = require("sirius-express");

var _siriusExpress2 = _interopRequireDefault(_siriusExpress);

var _cors = require("cors");

var _cors2 = _interopRequireDefault(_cors);

var _expressSession = require("express-session");

var _expressSession2 = _interopRequireDefault(_expressSession);

var _bodyParser = require("body-parser");

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _cliTable = require("cli-table");

var _cliTable2 = _interopRequireDefault(_cliTable);

var _ip = require("ip");

var _ip2 = _interopRequireDefault(_ip);

var _config = require("./config.json");

var _config2 = _interopRequireDefault(_config);

var _package = require("./package.json");

var _package2 = _interopRequireDefault(_package);

var _listener = require("./websocket/listener");

var _listener2 = _interopRequireDefault(_listener);

var _model = require("./core/importer/model");

var _model2 = _interopRequireDefault(_model);

var _route = require("./core/importer/route");

var _route2 = _interopRequireDefault(_route);

var _route3 = require("./core/inspector/route");

var _route4 = _interopRequireDefault(_route3);

var _utils = require("./core/utils");

var _utils2 = _interopRequireDefault(_utils);

var _user_token = require("./core/middlewares/user_token");

var _user_token2 = _interopRequireDefault(_user_token);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                   * Packages & modules
                                                                                                                                                                                                                   */


var app = (0, _express2.default)();
var server = _http2.default.Server(app);
var io = (0, _socket2.default)(server);

/**
 * App constants
 */
app.set("express", _express2.default);

/**
 * Middlewares
 */
app.use(_bodyParser2.default.json({ limit: _config2.default.request.limit }));
app.use(_bodyParser2.default.urlencoded({ limit: _config2.default.request.limit, extended: true }));
app.use((0, _cors2.default)({
    origin: _config2.default.cors,
    credentials: true
}));
app.use((0, _expressSession2.default)({
    secret: _config2.default.session.secret,
    cookie: {
        maxAge: _config2.default.session.maxAge
    },
    resave: true,
    saveUninitialized: false
}));
app.use((0, _siriusExpress2.default)({
    showPost: _config2.default.request.show_post,
    showGet: _config2.default.request.show_get,
    secret: _config2.default.session.secret
}));
if (_config2.default.user_token.use) {
    var _config$user_token = _config2.default.user_token,
        tokenSecret = _config$user_token.tokenSecret,
        refreshTokenSecret = _config$user_token.refreshTokenSecret,
        userModel = _config$user_token.userModel,
        tokenModel = _config$user_token.tokenModel,
        tokenExpire = _config$user_token.tokenExpire,
        refreshTokenExpire = _config$user_token.refreshTokenExpire;

    if (tokenSecret && refreshTokenSecret && _model2.default[userModel] && tokenExpire && refreshTokenExpire) {
        app.use((0, _user_token2.default)({
            tokenSecret: tokenSecret,
            refreshTokenSecret: refreshTokenSecret,
            userModel: _model2.default[userModel],
            tokenModel: _model2.default[tokenModel],
            tokenExpire: tokenExpire,
            refreshTokenExpire: refreshTokenExpire
        }));
    }
}

app.use(_express2.default.static(process.env.NODE_ENV === 'production' ? './frontend' : './inspector'));

/**
 * Load semua routes
 */
Object.keys(_route2.default).forEach(function (route) {
    var router = _route2.default[route](app, _model2.default, _listener2.default, 'test');
    app.use("/api/" + route, router);
});

/**
 * Root routes
 */
app.get("/", function (req, res) {
    res.setStatus(res.OK);
    res.setData({
        app: _package2.default.name,
        version: _package2.default.version
    });
    res.go();
});

/**
 * Inspector API
 */
app.get('/app_meta', function (req, res) {
    var data = {};
    var routes = (0, _route4.default)(app, _model2.default, _listener2.default);
    data.routes = [];
    Object.keys(routes.data).forEach(function (route) {
        data.routes.push({
            basepoint: route,
            endpoints: routes.data[route].endpoints
        });
    });
    data.models = [];
    Object.keys(_model2.default).forEach(function (model) {
        if (model !== 'sequelize' && model !== 'Sequelize') {
            data.models.push({
                name: model,
                attributes: _model2.default[model].rawAttributes
            });
        }
    });
    res.json(data);
});

/**
 * Synchronize & motd 
 */
_model2.default.sequelize.sync({
    alter: _config2.default.migration.watch,
    force: _config2.default.migration.renew
}).then(function () {
    server.listen(process.env.PORT || _config2.default.server.port);
    _listener2.default.listen(io);
    console.log('\x1Bc');
    var motd = new _cliTable2.default();
    motd.push(_defineProperty({}, "Nama App".blue.bold, _package2.default.name), _defineProperty({}, "Versi".blue.bold, _package2.default.version), _defineProperty({}, "Running Port".blue.bold, _config2.default.server.port), _defineProperty({}, "Entrypoint".blue.bold, _config2.default.server.protocol + "://" + _ip2.default.address() + ":" + _config2.default.server.port + "/"));
    _utils2.default.log("Server berhasil dijalankan!\nAkses semua endpoint yang terdaftar melalui entrypoint yang tertera dibawah.\nGunakan Postman (https://www.getpostman.com/) untuk mendebug API.\nSelamat bekerja :)", "success", "", "");
    _utils2.default.log("Info Aplikasi : ", "", "", " ");
    console.log(motd.toString());

    _utils2.default.log("\bGunakan perintah:\n`npm run inspect routes` untuk melihat daftar endpoint yang terdaftar,\n`npm start inspect` untuk langsung menampilkan dafar endpoint pada saat server berjalan", "", "yellow", "");
});