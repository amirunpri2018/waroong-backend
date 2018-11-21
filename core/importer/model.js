import Sequelize from "sequelize";
import path from "path";
import fs from "fs";
import _ from "lodash";
import { database, environment, folders, time } from "../../config.json";

let db = process.env.NODE_ENV === 'development' ? database : ({
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
});

const sequelize = new Sequelize(
    db.database,
    db.user,
    db.password,
    {
        host: db.host,
        dialect: db.dialect,
        logging: environment === "development" ? console.log : false,
        dialectOptions: {
            useUTC: true
        },
        timezone: time.zone,
        operatorsAliases: false
    }
);

const models = { }
let folder = path.join(__dirname, "..", "..", folders.models);
fs.readdirSync(folder).forEach((file) => {
    if(file.indexOf(".js") !== -1 && file !== "index.js") {
        models[_.upperFirst(_.camelCase(file.replace(".js", "")))] = sequelize.import(`${folder}/${file}`);
    }
});

Object.keys(models).forEach((model) => {
    if("associate" in models[model]) {
        models[model].associate(models);
    }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;