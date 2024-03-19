module.exports = (role) => {
    // validate passed argument
    if (role !== 'admin' && role !== 'qlht') {
        throw TypeError("Role must be either 'admin' or 'qlht'")
    };

    return function (req, res, next) {
        if (!req.user || req.user.role !== role) {
            return res.status(401).json({
                message: "Unauthorized"
            })
        }
        return next();
    }
}