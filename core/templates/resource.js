import os from "os";
import pluralize from 'pluralize';
import _ from 'lodash';
import utils from '../utils';
import { folders } from "../../config.json";

export default (config) => {

    let model = config.model;

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
        modelImportString = `, ${config.relations.join(', ')}`;
    }

    let attribs = utils.extractModelAttrib(model);

    return `/**
    * Daftar ${model}
    */
    router.get('/', a(async (req, res) => {
        // Ambil model
        const { Sequelize, ${model}${modelImportString} } = models;

        // Variabel
        let { limit = ${config.limit}, offset = ${config.offset}, q = '' } = req.query;

        // Data ${model}
        let data = await ${model}.findAndCountAll({
            distinct: true,
            // Pagination
            limit, offset,
            // Search & Filter
            where: { ${config.search}: { [Sequelize.Op.iLike]: '%' + q + '%' } },
            // Relasi
            include: ${relationString}
        });

        // Response
        res.setStatus(res.OK);
        res.setData(data);
        res.go();
    }));

    /**
     * Satu ${model}
     */
    router.get('/:id', a(async (req, res) => {
        // Ambil model
        const { ${model}${modelImportString} } = models;

        // Variabel
        let { id } = req.params;

        // Data ${model}
        let data = await ${model}.findOne({ 
            where: { id }, 
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
            res.setMessage('${model} tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Buat ${model}
     */
    router.post('/', requiredPost(${JSON.stringify(attribs.requiredFields)}), a(async (req, res) => {
        // Ambil model
        const { ${model} } = models;

        // Variabel
        let { ${attribs.originalFields.join(', ')} } = req.body;

        // Buat ${model}
        let data = await ${model}.create({ ${attribs.originalFields.join(', ')} });

        // Response
        res.setStatus(res.OK);
        res.setData(data);
        res.go();
    }));

    /**
     * Update ${model}
     */
    router.put('/:id', requiredPost(${JSON.stringify(attribs.requiredFields)}), a(async (req, res) => {
        // Ambil model
        const { ${model} } = models;

        // Variabel
        let { id } = req.params;
        let { ${attribs.originalFields.join(', ')} } = req.body;

        // Ambil ${model}
        let data = await ${model}.findOne({ where: { id } });

        if (data) {
            // Update ${model}
            data = await data.update({ ${attribs.originalFields.join(', ')} });
            // Response
            res.setStatus(res.OK);
            res.setData(data);
            res.go();
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('${model} tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Hapus ${model}
     */
    router.delete('/:id', a(async (req, res) => {
        // Ambil model
        const { ${model} } = models;

        // Variabel
        let { id } = req.params;

        // Ambil ${model}
        let data = await ${model}.findOne({ where: { id } });

        if (data) {
            // Hapus ${model}
            data.destroy();
            // Response
            res.setStatus(res.OK);
            res.setData(data);
            res.go();
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('${model} tidak ditemukan');
            res.go();
        }
    }));

    return router;`;

};