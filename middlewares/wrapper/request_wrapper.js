export function a(handler) {
    return (req, res, next) => {
        Promise.resolve(handler(req, res, next)).catch((err) => {
            if (err.name === 'SequelizeUniqueConstraintError' || err.name === 'SequelizeValidationError') {
                res.status(422);
                res.setStatus(res.GAGAL);
                res.setMessage({ errors: extractMessage(err) });
                res.go();
            } else {
                res.status(500);
                res.setStatus(res.GAGAL);
                res.setMessage(err.toString());
                res.go();
            }
        });
    }
}

function extractMessage(err) {
    return err.errors.map((errItem) => ({
        field: errItem.path,
        value: errItem.value,
        message: errItem.message
    }));
}