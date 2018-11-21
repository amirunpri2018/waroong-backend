'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _sqlFormatter = require('sql-formatter');

var _sqlFormatter2 = _interopRequireDefault(_sqlFormatter);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function () {
    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";
    var fields = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var dataRows = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var opts = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};


    var typesMap = {
        string: "VARCHAR(255)",
        number: "INT(10)"
    };

    var safe = function safe(s) {
        return s ? s : '';
    };
    var transformStyle = opts.style === 'camelCase' ? _lodash2.default.camelCase : opts.style === 'snakeCase' ? _lodash2.default.snakeCase : opts.style === 'upperCase' ? _lodash2.default.upperCase : opts.style === 'lowerCase' ? _lodash2.default.lowerCase : function (s) {
        return s;
    };
    var transformFields = {};
    Object.keys(fields).forEach(function (field) {
        if (opts.attributes.indexOf(field) !== -1) {
            transformFields[field] = fields[field];
        }
    });
    var transformDataRows = [];
    dataRows.forEach(function (row) {
        var newRow = {};
        Object.keys(row.dataValues).forEach(function (field) {
            if (opts.attributes.indexOf(field) !== -1 || field === 'field_data') {
                newRow[field] = row.dataValues[field];
            }
        });
        Object.keys(newRow.field_data).forEach(function (field) {
            if (opts.attributes.indexOf(field) === -1) {
                delete newRow.field_data[field];
            }
        });
        transformDataRows.push(newRow);
    });

    console.log(transformDataRows);

    name = transformStyle(name);

    return '-- Buat table\n' + _sqlFormatter2.default.format('CREATE TABLE IF NOT EXISTS ' + name + ' (\n    -- Atribut sistem\n    ' + safe(opts.attributes.indexOf('id') !== -1 && '`' + transformStyle('id') + '` INT NOT NULL PRIMARY KEY AUTO_INCREMENT,') + '\n    ' + safe(opts.attributes.indexOf('latitude') !== -1 && '`' + transformStyle('latitude') + '` DOUBLE,') + '\n    ' + safe(opts.attributes.indexOf('longitude') !== -1 && '`' + transformStyle('longitude') + '` DOUBLE,') + '\n    ' + safe(opts.attributes.indexOf('image') !== -1 && '`' + transformStyle('image') + '` TEXT,') + '\n    ' + safe(opts.attributes.indexOf('created_at') !== -1 && '`' + transformStyle('created_at') + '` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,') + '\n    ' + safe(opts.attributes.indexOf('updated_at') !== -1 && '`' + transformStyle('updated_at') + '` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,') + '\n\n    -- Atribut terdefinisi\n    ' + Object.keys(transformFields).map(function (field) {
        var column = field;
        var rawType = fields[field];
        var type = typesMap[rawType] ? typesMap[rawType] : rawType;
        return '`' + transformStyle(column) + '` ' + type;
    }).join(',\n    ') + '\n);') + '\n\n\n-- Data\n' + _sqlFormatter2.default.format(transformDataRows.map(function (row) {
        return 'INSERT INTO `' + name + '` (\n        -- Atribut sistem\n        ' + safe(opts.attributes.indexOf('id') !== -1 && '`' + transformStyle('id') + '`,') + '\n        ' + safe(opts.attributes.indexOf('latitude') !== -1 && '`' + transformStyle('latitude') + '`,') + '\n        ' + safe(opts.attributes.indexOf('longitude') !== -1 && '`' + transformStyle('longitude') + '`,') + '\n        ' + safe(opts.attributes.indexOf('image') !== -1 && '`' + transformStyle('image') + '`,') + '\n        ' + safe(opts.attributes.indexOf('created_at') !== -1 && '`' + transformStyle('created_at') + '`,') + '\n        ' + safe(opts.attributes.indexOf('updated_at') !== -1 && '`' + transformStyle('updated_at') + '`,') + '\n\n        -- Atribut terdefinisi\n        ' + Object.keys(transformFields).map(function (field) {
            return '`' + transformStyle(field) + '`';
        }).join(',\n    ') + '\n    ) VALUES (\n        -- Atribut sistem\n        ' + safe(opts.attributes.indexOf('id') !== -1 && row.id + ', ') + '\n        ' + safe(opts.attributes.indexOf('latitude') !== -1 && row.latitude + ', ') + '\n        ' + safe(opts.attributes.indexOf('longitude') !== -1 && row.longitude + ', ') + '\n        ' + safe(opts.attributes.indexOf('image') !== -1 && '"' + row.image + '", ') + '\n        ' + safe(opts.attributes.indexOf('created_at') !== -1 && '"' + (0, _moment2.default)(row.created_at).format('YYYY-MM-DD h:mm:ss') + '", ') + '\n        ' + safe(opts.attributes.indexOf('updated_at') !== -1 && '"' + (0, _moment2.default)(row.updated_at).format('YYYY-MM-DD h:mm:ss') + '", ') + '\n\n        -- Atribut terdefinisi\n        ' + Object.keys(row.field_data).map(function (field) {
            return '"' + row.field_data[field] + '"';
        }).join(',\n    ') + '\n    )';
    }).join(';\n'));
};