'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _pluralize = require('pluralize');

var _pluralize2 = _interopRequireDefault(_pluralize);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _utils = require('../utils');

var _utils2 = _interopRequireDefault(_utils);

var _config = require('../../config.json');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (config) {

    var parent = config.parent;
    var child = config.child;

    var parentplural = _lodash2.default.snakeCase(_lodash2.default.lowerCase(_pluralize2.default.plural(parent)));
    var parentsingular = _lodash2.default.snakeCase(_lodash2.default.lowerCase(_pluralize2.default.singular(parent)));
    var parentid = parentsingular + '_id';

    var childplural = _lodash2.default.snakeCase(_lodash2.default.lowerCase(_pluralize2.default.plural(child)));
    var childsingular = _lodash2.default.snakeCase(_lodash2.default.lowerCase(_pluralize2.default.singular(child)));
    var childid = childsingular + '_id';

    var relationString = '[]';
    if (config.relations.length) {
        relationString = '[';
        config.relations.forEach(function (relation, i) {
            if (i === config.relations.length - 1) {
                relationString += '{\n                    model: ' + _lodash2.default.upperFirst(relation) + '\n                }]';
            } else {
                relationString += '{\n                    model: ' + _lodash2.default.upperFirst(relation) + '\n                },';
            }
        });
    }

    var modelImportString = '';
    if (config.relations.length) {
        var model_list = [];
        config.relations.forEach(function (relation, i) {
            if (relation !== parent && relation !== child) {
                model_list.push(relation);
            }
        });
        modelImportString = ', ' + model_list.join(', ');
    }

    var attribs = _utils2.default.extractModelAttrib(child);

    return '/**\n    * Daftar ' + child + ' dalam ' + parent + '\n    */\n    router.get(\'/:id/' + childplural + '\', a(async (req, res) => {\n        // Model\n        const { Sequelize, ' + parent + ', ' + child + modelImportString + ' } = models;\n\n        // Variabel\n        let { limit = ' + config.limit + ', offset = ' + config.offset + ', q = \'\' } = req.query;\n        let { id } = req.params;\n\n        // Data ' + parent + '\n        let ' + parentsingular + ' = await ' + parent + '.findOne({ where: { id } });\n\n        if (' + parentsingular + ') {\n            // Data ' + child + '\n            let data = await ' + child + '.findAndCountAll({\n                // Pagination\n                limit, offset,\n                // Search & Filter\n                where: {\n                    ' + parentid + ': id,\n                    ' + config.search + ': { [Sequelize.Op.iLike]: \'%\' + q + \'%\' }\n                },\n                // Relasi\n                include: ' + relationString + '\n            });\n            // Response\n            res.setStatus(res.OK);\n            res.setData(data);\n            res.go();\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + parent + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    /**\n     * Satu ' + child + ' dalam ' + parent + '\n     */\n    router.get(\'/:id/' + childplural + '/:' + childid + '\', a(async (req, res) => {\n        // Model\n        const { ' + parent + ', ' + child + modelImportString + ' } = models;\n\n        // Variabel\n        let { id, ' + childid + ' } = req.params;\n\n        // Data ' + parent + '\n        let ' + parentsingular + ' = await ' + parent + '.findOne({ where: { id } });\n\n        if (' + parentsingular + ') {\n            // Data ' + child + '\n            let data = await ' + child + '.findOne({\n                where: {\n                    ' + parentid + ': id,\n                    id: ' + childid + '\n                },\n                // Relasi\n                include: ' + relationString + '\n            });\n            if (data) {\n                // Response\n                res.setStatus(res.OK);\n                res.setData(data);\n                res.go();\n            } else {\n                // Gagal\n                res.status(404);\n                res.setStatus(res.GAGAL);\n                res.setMessage(\'' + child + ' tidak ditemukan\');\n                res.go();\n            }\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + parent + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    /**\n     * Buat ' + child + ' dalam ' + parent + '\n     */\n    router.post(\'/:id/' + childplural + '/\', requiredPost(' + JSON.stringify(attribs.requiredFields) + '), a(async (req, res) => {\n        // Model\n        const { ' + parent + ', ' + child + ' } = models;\n\n        // Variabel\n        let { id } = req.params;\n        let { ' + attribs.requiredFields.join(', ') + ' } = req.body;\n\n        // Data ' + parent + '\n        let ' + parentsingular + ' = await ' + parent + '.findOne({ where: { id } });\n\n        if (' + parentsingular + ') {\n            // Buat ' + child + '\n            let data = await ' + child + '.create({ ' + attribs.requiredFields.join(', ') + ', ' + parentid + ': ' + parentsingular + '.id });\n            // Response\n            res.setStatus(res.OK);\n            res.setData(data);\n            res.go();\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + parent + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    /**\n     * Update ' + child + ' dalam ' + parent + '\n     */\n    router.put(\'/:id/' + childplural + '/:' + childid + '\', requiredPost(' + JSON.stringify(attribs.requiredFields) + '), a(async (req, res) => {\n        // Model\n        const { ' + parent + ', ' + child + ' } = models;\n\n        // Variabel\n        let { id, ' + childid + ' } = req.params;\n        let { ' + attribs.requiredFields.join(', ') + ' } = req.body;\n\n        // Data ' + parent + '\n        let ' + parentsingular + ' = await ' + parent + '.findOne({ where: { id } });\n\n        if (' + parentsingular + ') {\n            // Data ' + child + '\n            let data = await ' + child + '.findOne({\n                where: { \n                    id: ' + childid + ', \n                    ' + parentid + ': id \n                }\n            });\n            if (data) {\n                data = await data.update({ ' + attribs.requiredFields.join(', ') + ', ' + parentid + ': ' + parentsingular + '.id });\n                // Response\n                res.setStatus(res.OK);\n                res.setData(data);\n                res.go();\n            } else {\n                // Gagal\n                res.status(404);\n                res.setStatus(res.GAGAL);\n                res.setMessage(\'' + child + ' tidak ditemukan\');\n                res.go();\n            }\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + parent + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    /**\n     * Hapus ' + child + ' dalam ' + parent + '\n     */\n    router.delete(\'/:id/' + childplural + '/:' + childid + '\', a(async (req, res) => {\n        // Model\n        const { ' + parent + ', ' + child + ' } = models;\n\n        // Variabel\n        let { id, ' + childid + ' } = req.params;\n\n        // Data ' + parent + '\n        let ' + parentsingular + ' = await ' + parent + '.findOne({ where: { id } });\n\n        if (' + parentsingular + ') {\n            // Data ' + child + '\n            let data = await ' + child + '.findOne({\n                where: { \n                    id: ' + childid + ', \n                    ' + parentid + ': id \n                }\n            });\n            if (data) {\n                data.destroy();\n                // Response\n                res.setStatus(res.OK);\n                res.setData(data);\n                res.go();\n            } else {\n                // Gagal\n                res.status(404);\n                res.setStatus(res.GAGAL);\n                res.setMessage(\'' + child + ' tidak ditemukan\');\n                res.go();\n            }\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + parent + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    return router;';
};