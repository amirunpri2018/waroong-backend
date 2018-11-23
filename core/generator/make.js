import fs from "fs";
import path from "path";
import _ from 'lodash';
import pluralize from 'pluralize';
import prompt from 'prompt';

import makeRoutes from "../templates/routes";
import makeModels from "../templates/models";
import makeResource from '../templates/resource';
import makeResourceChild from '../templates/resource_child';
import models from '../importer/model';
import utils from "../utils";
import config from "../../config.json";

let argv = process.argv[2];
let action = argv.split(":")[0];
let name = argv.split(":")[1];

if (action === "route") {
    /**
     * Make route
     */
    let folder = path.join(__dirname, "..", "..", config.folders.routes);
    fs.writeFile(`${folder}/${name.toLowerCase()}.js`, makeRoutes(name), (err) => {
        if (err) {
            utils.log(err, "error");
        } else {
            utils.log(`Route '${name}' berhasil dibuat`, "success");
        }
    });
} else if (action === "model") {
    /**
     * Make model
     */
    let folder = path.join(__dirname, "..", "..", config.folders.models);
    fs.writeFile(`${folder}/${name.toLowerCase()}.js`, makeModels(name), (err) => {
        if (err) {
            utils.log(err, "error");
            process.exit(0);
        } else {
            utils.log(`Model '${name}' berhasil dibuat`, "success");
            process.exit(0);
        }
    });
} else if (action === 'resource') {
    /**
     * Make resource
     */
    let folder = path.join(__dirname, '..', '..', config.folders.routes);
    let names = name.split('-');

    let fileName = pluralize.plural(names[0]);
    fs.readFile(`${folder}/${fileName.toLowerCase()}.js`, 'utf-8', (err, data) => {
        if (err) {
            utils.log(err, 'error');
            process.exit(0);
        } else {
            console.log('Isi beberapa data yang diperlukan untuk membuat kode resource untuk route ini');
            prompt.message = '';
            prompt.start();
            prompt.get([{
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
            }], (err, result) => {
                let limit = result.Limit;
                let offset = result.Offset;
                let relations = result.Relasi;

                pluralize.addSingularRule(/data$/i, 'data');

                if (names.length === 1) {
                    data = data.replace('return router;', makeResource({
                        model: _.upperFirst(_.camelCase(pluralize.singular(name))),
                        limit, offset, relations: relations.length ? relations.split(',') : []
                    }));
                } else {
                    data = data.replace('return router;', makeResourceChild({
                        parent: names[0],
                        child: names[1],
                        limit, offset, relations: relations.length ? relations.split(',') : []
                    }));
                }

                fs.writeFile(`${folder}/${fileName.toLowerCase()}.js`, data, (err) => {
                    if (err) {
                        utils.log(err, "error");
                        process.exit(0);
                    } else {
                        utils.log(`Kode resource untuk entitas '${name}' berhasil dibuat`, "success");
                        process.exit(0);
                    }
                });
            });
        }
    });
} else {
    let model = models[action];
    if (model) {
        let attributes = utils.extractModelAttrib(action);

        prompt.start();

        prompt.get(attributes.generateFields, (err, result) => {
            
            Object.keys(result).forEach((columnName) => {
                if(columnName === 'password') {
                    result[columnName] = utils.hash(result[columnName]);
                }
                if(columnName.indexOf('_id') !== -1) {
                    if(result[columnName] === '') {
                        delete result[columnName];
                    } else {
                        result[columnName] = parseInt(result[columnName]);
                        if(isNaN(result[columnName])) {
                            delete result[columnName];
                        }
                    }
                }
            });
            console.log(result);
            model.create(result).then((data) => {
                console.log(data.dataValues);
                utils.log(`Data ${action} berhasil disimpan`, 'success');
                process.exit(0);
            }).catch((err) => {
                utils.log(err, "error");
                process.exit(0);
            });
        });
    } else {
        utils.log('Model tidak ditemukan', "error");
        process.exit(0);
    }
}