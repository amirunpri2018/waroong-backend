import os from "os";
import { folders } from "../../config.json";

export default (route) => {

    return `/**
* File : ./${folders.routes}/${route}.js 
* Tanggal Dibuat : ${(new Date()).toLocaleString()}
* Penulis : ${os.userInfo().username}
*/

import { a } from '../middlewares/wrapper/request_wrapper';
import { requiredPost, requiredGet } from '../middlewares/validator/request_fields';
import { onlyAuth } from '../middlewares/validator/auth';
import { parser } from '../middlewares/query/parser';

function ${route}(app, models, socketListener) {
    let router = app.get("express").Router();

    return router;
}

module.exports = ${route};`;

};