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

    var model = config.model;

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
        modelImportString = ', ' + config.relations.join(', ');
    }

    var attribs = _utils2.default.extractModelAttrib(model);

    return '/**\n    * Daftar ' + model + '\n    */\n    router.get(\'/\', a(async (req, res) => {\n        // Ambil model\n        const { Sequelize, ' + model + modelImportString + ' } = models;\n\n        // Variabel\n        let { limit = ' + config.limit + ', offset = ' + config.offset + ', q = \'\' } = req.query;\n\n        // Data ' + model + '\n        let data = await ' + model + '.findAndCountAll({\n            distinct: true,\n            // Pagination\n            limit, offset,\n            // Search & Filter\n            where: { ' + config.search + ': { [Sequelize.Op.iLike]: \'%\' + q + \'%\' } },\n            // Relasi\n            include: ' + relationString + '\n        });\n\n        // Response\n        res.setStatus(res.OK);\n        res.setData(data);\n        res.go();\n    }));\n\n    /**\n     * Satu ' + model + '\n     */\n    router.get(\'/:id\', a(async (req, res) => {\n        // Ambil model\n        const { ' + model + modelImportString + ' } = models;\n\n        // Variabel\n        let { id } = req.params;\n\n        // Data ' + model + '\n        let data = await ' + model + '.findOne({ \n            where: { id }, \n            include: ' + relationString + ' \n        });\n\n        if (data) {\n            // Response\n            res.setStatus(res.OK);\n            res.setData(data);\n            res.go();\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + model + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    /**\n     * Buat ' + model + '\n     */\n    router.post(\'/\', requiredPost(' + JSON.stringify(attribs.requiredFields) + '), a(async (req, res) => {\n        // Ambil model\n        const { ' + model + ' } = models;\n\n        // Variabel\n        let { ' + attribs.originalFields.join(', ') + ' } = req.body;\n\n        // Buat ' + model + '\n        let data = await ' + model + '.create({ ' + attribs.originalFields.join(', ') + ' });\n\n        // Response\n        res.setStatus(res.OK);\n        res.setData(data);\n        res.go();\n    }));\n\n    /**\n     * Update ' + model + '\n     */\n    router.put(\'/:id\', requiredPost(' + JSON.stringify(attribs.requiredFields) + '), a(async (req, res) => {\n        // Ambil model\n        const { ' + model + ' } = models;\n\n        // Variabel\n        let { id } = req.params;\n        let { ' + attribs.originalFields.join(', ') + ' } = req.body;\n\n        // Ambil ' + model + '\n        let data = await ' + model + '.findOne({ where: { id } });\n\n        if (data) {\n            // Update ' + model + '\n            data = await data.update({ ' + attribs.originalFields.join(', ') + ' });\n            // Response\n            res.setStatus(res.OK);\n            res.setData(data);\n            res.go();\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + model + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    /**\n     * Hapus ' + model + '\n     */\n    router.delete(\'/:id\', a(async (req, res) => {\n        // Ambil model\n        const { ' + model + ' } = models;\n\n        // Variabel\n        let { id } = req.params;\n\n        // Ambil ' + model + '\n        let data = await ' + model + '.findOne({ where: { id } });\n\n        if (data) {\n            // Hapus ' + model + '\n            data.destroy();\n            // Response\n            res.setStatus(res.OK);\n            res.setData(data);\n            res.go();\n        } else {\n            // Gagal\n            res.status(404);\n            res.setStatus(res.GAGAL);\n            res.setMessage(\'' + model + ' tidak ditemukan\');\n            res.go();\n        }\n    }));\n\n    return router;';
};