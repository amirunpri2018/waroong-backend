/**
* File : ./routes/stores.js 
* Tanggal Dibuat : 11/22/2018, 2:16:01 PM
* Penulis : edgarjeremy
*/

import { a } from '../middlewares/wrapper/request_wrapper';
import { requiredPost, requiredGet } from '../middlewares/validator/request_fields';
import { onlyAuth } from '../middlewares/validator/auth';
import { parser } from '../middlewares/query/parser';

function stores(app, models, socketListener) {
    let router = app.get("express").Router();

    /**
    * Daftar Store
    */
    router.get('/', parser('Store'), a(async (req, res) => {
        // Ambil model
        const { Store, User } = models;

        // Data Store
        let data = await Store.findAndCountAll({
            distinct: true,
            attributes: req.parsed.attributes,
            where: { ...req.parsed.filter },
            order: req.parsed.order,
            limit: req.parsed.limit,
            offset: req.parsed.offset,
            include: [{
                    model: User
                }]
        });

        // Response
        res.setStatus(res.OK);
        res.setData(data);
        res.go();
    }));

    /**
     * Satu Store
     */
    router.get('/:id', parser('Store'), a(async (req, res) => {
        // Ambil model
        const { Store, User } = models;

        // Variabel
        let { id } = req.params;

        // Data Store
        let data = await Store.findOne({
            attributes: req.parsed.attributes,
            where: { id }, 
            include: [{
                    model: User
                }] 
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
            res.setMessage('Store tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Buat Store
     */
    router.post('/', requiredPost(["name","location","location_text","description"]), a(async (req, res) => {
        // Ambil model
        const { Store } = models;

        // Variabel
        let { name, location, location_text, description } = req.body;

        // Buat Store
        let data = await Store.create({ name, location, location_text, description });

        // Response
        res.setStatus(res.OK);
        res.setData(data);
        res.go();
    }));

    /**
     * Update Store
     */
    router.put('/:id', requiredPost(["name","location","location_text","description"]), a(async (req, res) => {
        // Ambil model
        const { Store } = models;

        // Variabel
        let { id } = req.params;
        let { name, location, location_text, description } = req.body;

        // Ambil Store
        let data = await Store.findOne({ where: { id } });

        if (data) {
            // Update Store
            data = await data.update({ name, location, location_text, description });
            // Response
            res.setStatus(res.OK);
            res.setData(data);
            res.go();
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('Store tidak ditemukan');
            res.go();
        }
    }));

    /**
     * Hapus Store
     */
    router.delete('/:id', a(async (req, res) => {
        // Ambil model
        const { Store } = models;

        // Variabel
        let { id } = req.params;

        // Ambil Store
        let data = await Store.findOne({ where: { id } });

        if (data) {
            // Hapus Store
            data.destroy();
            // Response
            res.setStatus(res.OK);
            res.setData(data);
            res.go();
        } else {
            // Gagal
            res.status(404);
            res.setStatus(res.GAGAL);
            res.setMessage('Store tidak ditemukan');
            res.go();
        }
    }));

    return router;
}

module.exports = stores;