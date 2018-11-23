import os from "os";
import pluralize from 'pluralize';
import _ from 'lodash';
import utils from '../utils';
import { folders } from "../../config.json";

export default (config) => {

    let parent = config.parent;
    let child = config.child;

    let parentplural = _.snakeCase(_.lowerCase(pluralize.plural(parent)));
    let parentsingular = _.snakeCase(_.lowerCase(pluralize.singular(parent)));
    let parentid = parentsingular + '_id';

    let childplural = _.snakeCase(_.lowerCase(pluralize.plural(child)));
    let childsingular = _.snakeCase(_.lowerCase(pluralize.singular(child)));
    let childid = childsingular + '_id';

    let relationString = '[]';
    if (config.relations.length) {
        relationString = '[';
        config.relations.forEach((relation, i) => {
            if (i === config.relations.length - 1) {
                relationString += `{
                    model: ${_.upperFirst(relation)}
                }]`;
            } else {
                relationString += `{
                    model: ${_.upperFirst(relation)}
                },`;
            }
        });
    }

    let modelImportString = '';
    if (config.relations.length) {
        let model_list = [];
        config.relations.forEach((relation, i) => {
            if(relation !== parent && relation !== child) {
                model_list.push(relation);
            }
        });
        modelImportString = `, ${model_list.join(', ')}`;
    }

    let attribs = utils.extractModelAttrib(child);

    return `/**
    * Daftar ${child} dalam ${parent}
    */
    router.get('/:id/${childplural}', parser('${child}') a(async (req, res) => {
        // Model
        const { Sequelize, ${parent}, ${child}${modelImportString} } = models;

        // Variabel
        let { limit = ${config.limit}, offset = ${config.offset}, q = '' } = req.query;
        let { id } = req.params;

        // Data ${parent}
        let ${parentsingular} = await ${parent}.findOne({ where: { id } });

        if (${parentsingular}) {
            // Data ${child}
            let data = await ${child}.findAndCountAll({
                distinct: true,
                attributes: req.parsed.attributes,
                where: { ...req.parsed.filter },
                order: req.parsed.order,
                limit: req.parsed.limit,
                offset: req.parsed.offset,
                include: ${relationString}
            });
            // Response
            res.setStatus(res.OK);
            res.setData(data);
            res.go();
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('${parent} tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Satu ${child} dalam ${parent}
     */
    router.get('/:id/${childplural}/:${childid}', parser('${child}'), a(async (req, res) => {
        // Model
        const { ${parent}, ${child}${modelImportString} } = models;

        // Variabel
        let { id, ${childid} } = req.params;

        // Data ${parent}
        let ${parentsingular} = await ${parent}.findOne({ where: { id } });

        if (${parentsingular}) {
            // Data ${child}
            let data = await ${child}.findOne({
                attribute: req.parsed.attributes,
                where: {
                    ${parentid}: id,
                    id: ${childid}
                },
                // Relasi
                include: ${relationString}
            });
            if (data) {
                // Response
                res.setStatus(res.OK);
                res.setData(data);
                res.go();
            } else {
                // Gagal
                res.status(404);
                res.setStatus(res.GAGAL);
                res.setMessage('${child} tidak ditemukan');
                res.go();
            }
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('${parent} tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Buat ${child} dalam ${parent}
     */
    router.post('/:id/${childplural}/', requiredPost(${JSON.stringify(attribs.requiredFields)}), a(async (req, res) => {
        // Model
        const { ${parent}, ${child} } = models;

        // Variabel
        let { id } = req.params;
        let { ${attribs.requiredFields.join(', ')} } = req.body;

        // Data ${parent}
        let ${parentsingular} = await ${parent}.findOne({ where: { id } });

        if (${parentsingular}) {
            // Buat ${child}
            let data = await ${child}.create({ ${attribs.requiredFields.join(', ')}, ${parentid}: ${parentsingular}.id });
            // Response
            res.setStatus(res.OK);
            res.setData(data);
            res.go();
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('${parent} tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Update ${child} dalam ${parent}
     */
    router.put('/:id/${childplural}/:${childid}', requiredPost(${JSON.stringify(attribs.requiredFields)}), a(async (req, res) => {
        // Model
        const { ${parent}, ${child} } = models;

        // Variabel
        let { id, ${childid} } = req.params;
        let { ${attribs.requiredFields.join(', ')} } = req.body;

        // Data ${parent}
        let ${parentsingular} = await ${parent}.findOne({ where: { id } });

        if (${parentsingular}) {
            // Data ${child}
            let data = await ${child}.findOne({
                where: { 
                    id: ${childid}, 
                    ${parentid}: id 
                }
            });
            if (data) {
                data = await data.update({ ${attribs.requiredFields.join(', ')}, ${parentid}: ${parentsingular}.id });
                // Response
                res.setStatus(res.OK);
                res.setData(data);
                res.go();
            } else {
                // Gagal
                res.status(404);
                res.setStatus(res.GAGAL);
                res.setMessage('${child} tidak ditemukan');
                res.go();
            }
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('${parent} tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Hapus ${child} dalam ${parent}
     */
    router.delete('/:id/${childplural}/:${childid}', a(async (req, res) => {
        // Model
        const { ${parent}, ${child} } = models;

        // Variabel
        let { id, ${childid} } = req.params;

        // Data ${parent}
        let ${parentsingular} = await ${parent}.findOne({ where: { id } });

        if (${parentsingular}) {
            // Data ${child}
            let data = await ${child}.findOne({
                where: { 
                    id: ${childid}, 
                    ${parentid}: id 
                }
            });
            if (data) {
                data.destroy();
                // Response
                res.setStatus(res.OK);
                res.setData(data);
                res.go();
            } else {
                // Gagal
                res.status(404);
                res.setStatus(res.GAGAL);
                res.setMessage('${child} tidak ditemukan');
                res.go();
            }
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('${parent} tidak ditemukan');
            res.go();
        }
    }));

    return router;`;

};