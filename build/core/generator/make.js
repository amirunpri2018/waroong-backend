"use strict";

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _pluralize = require("pluralize");

var _pluralize2 = _interopRequireDefault(_pluralize);

var _prompt = require("prompt");

var _prompt2 = _interopRequireDefault(_prompt);

var _routes = require("../templates/routes");

var _routes2 = _interopRequireDefault(_routes);

var _models = require("../templates/models");

var _models2 = _interopRequireDefault(_models);

var _resource = require("../templates/resource");

var _resource2 = _interopRequireDefault(_resource);

var _resource_child = require("../templates/resource_child");

var _resource_child2 = _interopRequireDefault(_resource_child);

var _model = require("../importer/model");

var _model2 = _interopRequireDefault(_model);

var _utils = require("../utils");

var _utils2 = _interopRequireDefault(_utils);

var _config = require("../../config.json");

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var argv = process.argv[2];
var action = argv.split(":")[0];
var name = argv.split(":")[1];

if (action === "route") {
    /**
     * Make route
     */
    var folder = _path2.default.join(__dirname, "..", "..", _config2.default.folders.routes);
    _fs2.default.writeFile(folder + "/" + name.toLowerCase() + ".js", (0, _routes2.default)(name), function (err) {
        if (err) {
            _utils2.default.log(err, "error");
        } else {
            _utils2.default.log("Route '" + name + "' berhasil dibuat", "success");
        }
    });
} else if (action === "model") {
    /**
     * Make model
     */
    var _folder = _path2.default.join(__dirname, "..", "..", _config2.default.folders.models);
    _fs2.default.writeFile(_folder + "/" + name.toLowerCase() + ".js", (0, _models2.default)(name), function (err) {
        if (err) {
            _utils2.default.log(err, "error");
            process.exit(0);
        } else {
            _utils2.default.log("Model '" + name + "' berhasil dibuat", "success");
            process.exit(0);
        }
    });
} else if (action === 'resource') {
    /**
     * Make resource
     */
    var _folder2 = _path2.default.join(__dirname, '..', '..', _config2.default.folders.routes);
    var names = name.split('-');

    var fileName = _pluralize2.default.plural(names[0]);
    _fs2.default.readFile(_folder2 + "/" + fileName.toLowerCase() + ".js", 'utf-8', function (err, data) {
        if (err) {
            _utils2.default.log(err, 'error');
            process.exit(0);
        } else {
            console.log('Isi beberapa data yang diperlukan untuk membuat kode resource untuk route ini');
            _prompt2.default.message = '';
            _prompt2.default.start();
            _prompt2.default.get([{
                name: 'Kolom Search',
                message: 'Field yang digunakan SQL untuk mencari berdasarkan q (query string)',
                default: 'name'
            }, {
                name: 'Limit',
                message: 'Default limit untuk collection model',
                default: 20
            }, {
                name: 'Offset',
                message: 'Default offset untuk collection model',
                default: 0
            }, {
                name: 'Relasi',
                message: 'Daftar relasi entitas'
            }], function (err, result) {
                var search = result['Kolom Search'];
                var limit = result.Limit;
                var offset = result.Offset;
                var relations = result.Relasi;

                _pluralize2.default.addSingularRule(/data$/i, 'data');

                if (names.length === 1) {
                    data = data.replace('return router;', (0, _resource2.default)({
                        model: _lodash2.default.upperFirst(_lodash2.default.camelCase(_pluralize2.default.singular(name))),
                        limit: limit, offset: offset, search: search, relations: relations.length ? relations.split(',') : []
                    }));
                } else {
                    data = data.replace('return router;', (0, _resource_child2.default)({
                        parent: names[0],
                        child: names[1],
                        limit: limit, offset: offset, search: search, relations: relations.length ? relations.split(',') : []
                    }));
                }

                _fs2.default.writeFile(_folder2 + "/" + fileName.toLowerCase() + ".js", data, function (err) {
                    if (err) {
                        _utils2.default.log(err, "error");
                        process.exit(0);
                    } else {
                        _utils2.default.log("Kode resource untuk entitas '" + name + "' berhasil dibuat", "success");
                        process.exit(0);
                    }
                });
            });
        }
    });
} else {
    var model = _model2.default[action];
    if (model) {
        var attributes = _utils2.default.extractModelAttrib(action);

        _prompt2.default.start();

        _prompt2.default.get(attributes.generateFields, function (err, result) {

            Object.keys(result).forEach(function (columnName) {
                if (columnName === 'password') {
                    result[columnName] = _utils2.default.hash(result[columnName]);
                }
                if (columnName.indexOf('_id') !== -1) {
                    if (result[columnName] === '') {
                        delete result[columnName];
                    } else {
                        result[columnName] = parseInt(result[columnName]);
                        if (isNaN(result[columnName])) {
                            delete result[columnName];
                        }
                    }
                }
            });
            console.log(result);
            model.create(result).then(function (data) {
                console.log(data.dataValues);
                _utils2.default.log("Data " + action + " berhasil disimpan", 'success');
                process.exit(0);
            }).catch(function (err) {
                _utils2.default.log(err, "error");
                process.exit(0);
            });
        });
    } else {
        _utils2.default.log('Model tidak ditemukan', "error");
        process.exit(0);
    }
}