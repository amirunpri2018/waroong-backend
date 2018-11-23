/**
 * Public routes
 */
import bcrypt from "bcrypt";
import nodemailer from 'nodemailer';
import _ from 'lodash';
import { requiredPost } from "../middlewares/validator/request_fields";
import { a } from "../middlewares/wrapper/request_wrapper";
import makeConfirmMail from '../core/templates/confirm_mail';
import config from '../config.json';

function route(app, models, socketListener) {
    let router = app.get("express").Router();

    /**
     * Router disini..
     */
    router.post("/login", requiredPost(["email", "password"]), a(async (req, res) => {
        const body = req.body;
        const user = await models.User.findOne({
            include: [{ model: models.Token }],
            attributes: ['id', 'name', 'email', 'password', 'phone', 'type', 'avatar', 'active', 'verify_code', 'last_login', 'created_at', 'updated_at'],
            where: { email: body.email, active: true },
        });
        if (user) {
            if (bcrypt.compareSync(body.password, user.password)) {
                /** Invalidate old tokens */
                req.invalidateAllToken(user);
                delete user.dataValues.tokens;
                delete user.password;
                delete user.dataValues.password;
                /** Generate new tokens */
                const userToken = await req.generateUserToken(user.id);
                let firstLogin = true;
                if (user.last_login) {
                    firstLogin = false;
                }
                user.update({ last_login: new Date() });
                res.setStatus(res.OK);
                res.setData({
                    user,
                    token: userToken.token,
                    refreshToken: userToken.refreshToken,
                    firstLogin
                });
                res.go();
            } else {
                res.setStatus(res.GAGAL);
                res.setMessage("Login tidak valid");
                res.go();
            }
        } else {
            res.setStatus(res.GAGAL);
            res.setMessage("Login tidak valid");
            res.go();
        }
    }));

    router.get("/check", (req, res) => {
        res.setStatus(req.user ? res.OK : res.GAGAL);
        res.setData(req.user);
        res.setMessage("Session habis");
        res.go();
    });

    router.get("/logout", (req, res) => {
        if (req.user)
            req.invalidateAllToken(req.user);
        res.set("Access-Control-Expose-Headers", "x-access-token, x-refresh-token");
        res.set("x-access-token", "");
        res.set("x-refresh-token", "");
        res.setStatus(res.OK);
        res.setData("Berhasil logout");
        res.go();
    });

    router.post('/register', requiredPost(['name', 'email', 'password', 'phone']), a(async (req, res) => {
        const { User } = models;
        let { name, email, password, phone } = req.body;
        let verify_code = _.random(111111, 999999);

        let user = await User.create({
            name, email, phone, verify_code, password,
            type: 'user',
            avatar: 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTkuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgdmlld0JveD0iMCAwIDUzIDUzIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MyA1MzsiIHhtbDpzcGFjZT0icHJlc2VydmUiIHdpZHRoPSI1MTJweCIgaGVpZ2h0PSI1MTJweCI+CjxwYXRoIHN0eWxlPSJmaWxsOiNFN0VDRUQ7IiBkPSJNMTguNjEzLDQxLjU1MmwtNy45MDcsNC4zMTNjLTAuNDY0LDAuMjUzLTAuODgxLDAuNTY0LTEuMjY5LDAuOTAzQzE0LjA0Nyw1MC42NTUsMTkuOTk4LDUzLDI2LjUsNTMgIGM2LjQ1NCwwLDEyLjM2Ny0yLjMxLDE2Ljk2NC02LjE0NGMtMC40MjQtMC4zNTgtMC44ODQtMC42OC0xLjM5NC0wLjkzNGwtOC40NjctNC4yMzNjLTEuMDk0LTAuNTQ3LTEuNzg1LTEuNjY1LTEuNzg1LTIuODg4di0zLjMyMiAgYzAuMjM4LTAuMjcxLDAuNTEtMC42MTksMC44MDEtMS4wM2MxLjE1NC0xLjYzLDIuMDI3LTMuNDIzLDIuNjMyLTUuMzA0YzEuMDg2LTAuMzM1LDEuODg2LTEuMzM4LDEuODg2LTIuNTN2LTMuNTQ2ICBjMC0wLjc4LTAuMzQ3LTEuNDc3LTAuODg2LTEuOTY1di01LjEyNmMwLDAsMS4wNTMtNy45NzctOS43NS03Ljk3N3MtOS43NSw3Ljk3Ny05Ljc1LDcuOTc3djUuMTI2ICBjLTAuNTQsMC40ODgtMC44ODYsMS4xODUtMC44ODYsMS45NjV2My41NDZjMCwwLjkzNCwwLjQ5MSwxLjc1NiwxLjIyNiwyLjIzMWMwLjg4NiwzLjg1NywzLjIwNiw2LjYzMywzLjIwNiw2LjYzM3YzLjI0ICBDMjAuMjk2LDM5Ljg5OSwxOS42NSw0MC45ODYsMTguNjEzLDQxLjU1MnoiLz4KPGc+Cgk8cGF0aCBzdHlsZT0iZmlsbDojNTU2MDgwOyIgZD0iTTI2Ljk1MywwLjAwNEMxMi4zMi0wLjI0NiwwLjI1NCwxMS40MTQsMC4wMDQsMjYuMDQ3Qy0wLjEzOCwzNC4zNDQsMy41Niw0MS44MDEsOS40NDgsNDYuNzYgICBjMC4zODUtMC4zMzYsMC43OTgtMC42NDQsMS4yNTctMC44OTRsNy45MDctNC4zMTNjMS4wMzctMC41NjYsMS42ODMtMS42NTMsMS42ODMtMi44MzV2LTMuMjRjMCwwLTIuMzIxLTIuNzc2LTMuMjA2LTYuNjMzICAgYy0wLjczNC0wLjQ3NS0xLjIyNi0xLjI5Ni0xLjIyNi0yLjIzMXYtMy41NDZjMC0wLjc4LDAuMzQ3LTEuNDc3LDAuODg2LTEuOTY1di01LjEyNmMwLDAtMS4wNTMtNy45NzcsOS43NS03Ljk3NyAgIHM5Ljc1LDcuOTc3LDkuNzUsNy45Nzd2NS4xMjZjMC41NCwwLjQ4OCwwLjg4NiwxLjE4NSwwLjg4NiwxLjk2NXYzLjU0NmMwLDEuMTkyLTAuOCwyLjE5NS0xLjg4NiwyLjUzICAgYy0wLjYwNSwxLjg4MS0xLjQ3OCwzLjY3NC0yLjYzMiw1LjMwNGMtMC4yOTEsMC40MTEtMC41NjMsMC43NTktMC44MDEsMS4wM1YzOC44YzAsMS4yMjMsMC42OTEsMi4zNDIsMS43ODUsMi44ODhsOC40NjcsNC4yMzMgICBjMC41MDgsMC4yNTQsMC45NjcsMC41NzUsMS4zOSwwLjkzMmM1LjcxLTQuNzYyLDkuMzk5LTExLjg4Miw5LjUzNi0xOS45QzUzLjI0NiwxMi4zMiw0MS41ODcsMC4yNTQsMjYuOTUzLDAuMDA0eiIvPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=',
            active: false,
        });

        let transporter = nodemailer.createTransport(config.mail);

        let result = await transporter.sendMail({
            from: 'Tagconn Development Team <tagconndev@gmail.com>',
            to: email,
            subject: 'Konfirmasi Bergabung | Waroong',
            html: makeConfirmMail({
                name: name,
                code: verify_code
            })
        });

        res.setStatus(res.OK);
        res.setData({ message: 'Berhasil' });
        res.go();
    }));

    router.post('/verify', requiredPost(['email', 'code']), a(async (req, res) => {
        const { User } = models;
        let { email, code } = req.body;
        
        let user = await User.findOne({ where: { email, verify_code: code } });
        if (user) {
            await user.update({ active: true });

            res.setStatus(res.OK);
            res.setData(user);
            res.go();
        } else {
            res.status(422);
            res.setStatus(res.GAGAL);
            res.setMessage('Informasi verifikasi tidak valid. Cek apakah email sudah terdaftar dan kode sudah benar');
            res.go();
        }
    }));

    return router;
}

module.exports = route;
