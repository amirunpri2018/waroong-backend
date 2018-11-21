/**
* File : ./routes/users.js 
* Tanggal Dibuat : 10/12/2018, 2:36:02 PM
* Penulis : edgarjeremy
*/

import { a } from '../middlewares/wrapper/request_wrapper';
import { requiredPost, requiredGet } from '../middlewares/validator/request_fields';
import { onlyAuth } from '../middlewares/validator/auth';
import { parser } from '../middlewares/query/parser';

function users(app, models, socketListener, t) {
    let router = app.get("express").Router();
    let queryParser = parser('user');

    router.get('/', queryParser, a(async (req, res) => {
        const { User } = models;
        let users = await User.findAndCountAll({
            distinct: true,
            attributes: req.parsed.attributes,
            where: { ...req.parsed.filter },
            order: req.parsed.order,
            limit: req.parsed.limit,
            offset: req.parsed.offset,
            include: []
        });
        res.setStatus(res.OK);
        res.setData(users);
        res.go();
    }));

    return router;
}

module.exports = users;