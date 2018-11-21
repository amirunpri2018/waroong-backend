import sequelize from 'sequelize';
import _ from 'lodash';
import config from '../../config.json';

let ops = {
    '[eq]': sequelize.Op.eq,
    '[gt]': sequelize.Op.gt,
    '[lt]': sequelize.Op.lt,
    '[gte]': sequelize.Op.gte,
    '[lte]': sequelize.Op.lte,
    '[ne]': sequelize.Op.ne,
    '[like]': process.env.NODE_ENV !== 'production' ? (config.database.dialect === 'postgres' ? sequelize.Op.iLike : sequelize.Op.like) : (
        process.env.DB_DIALECT === 'postgres' ? sequelize.Op.iLike : sequelize.Op.like
    )
};

let filterOp = (item = '') => {
    let r = false;
    Object.keys(ops).forEach((op) => {
        if (item.indexOf(op) !== -1) {
            let [key, value] = item.split(op);
            r = { [key]: { [ops[op]]: op === '[like]' ? `%${value}%` : value } };
        }
    });
    return r;
}

export function parser(opts) {
    return (req, res, next) => {
        let query = req.query;
        let filter = query.filter || '';
        let order = query.order || '\\created_at';
        let rawAttr = query.attributes.split(',');
        rawAttr.unshift('id');
        let attributes = query.attributes ? rawAttr : ['id'];
        let limit = query.limit;
        let offset = query.offset;

        let parsed = {};

        /**
         * Filter
         */
        let andFilter = filter.split('<and>');
        let orFilter = [];
        andFilter.forEach((andItem, i) => {
            let split = andItem.split('<or>');
            if (split.length > 1) {
                let and = split[0];
                split.splice(0, 1);
                orFilter = [...orFilter, ...split];
                andFilter[i] = and;
            }
        });
        andFilter = _.compact(andFilter.map(filterOp));
        orFilter = _.compact(orFilter.map(filterOp));
        parsed.filter = {};
        if (andFilter.length) {
            if (parsed.filter[sequelize.Op.or] === undefined) {
                parsed.filter[sequelize.Op.or] = {};
            }
            parsed.filter[sequelize.Op.or][sequelize.Op.and] = andFilter;
        }
        if (orFilter.length) {
            if (parsed.filter[sequelize.Op.or] === undefined) {
                parsed.filter[sequelize.Op.or] = {};
            }
            parsed.filter[sequelize.Op.or][sequelize.Op.or] = orFilter;
        }

        /**
         * Order
         */
        let fields = order.split(',').map((item) => item.trim());
        let orderBy = fields.map((field) => {
            let type = field[0];
            return [field.replace(type, ''), type === '/' ? 'asc' : 'desc'];
        });
        parsed.order = orderBy;

        /**
         * Attributes
         */
        parsed.attributes = attributes;

        /**
         * Pagination
         */
        parsed.limit = limit ? parseInt(limit) : 20;
        parsed.offset = offset ? parseInt(offset) : 0;

        req.parsed = parsed;
        next();
    }
}