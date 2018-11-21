export function requiredPost(fields = []) {
    return (req, res, next) => {
        let errors = [];
        let body = req.body;
        fields.forEach((field) => {
            if (!(field in body) || !body[field]) {
                errors.push(field);
            }
        });
        if (errors.length) {
            res.status(422);
            res.setStatus(res.GAGAL);
            res.setMessage({ errors: errors.map((field) => ({
                field: field,
                message: `Field ${field} tidak boleh kosong`
            }))});
            // res.setMessage(`Kirim field POST ${errors.join(",")} (mandatory)`);
            res.go();
        } else {
            next();
        }
    }
}

export function requiredGet(fields = []) {
    return (req, res, next) => {
        let errors = [];
        let query = req.query;
        fields.forEach((field) => {
            if(!(field in query)) {
                errors.push(field);
            }
        });
        if(errors.length) {
            res.status(400);
            res.setStatus(res.GAGAL);
            res.setMessage(`Kirim field GET ${errors.join(",")} (mandatory)`);
            res.go();
        } else {
            next();
        }
    }
}