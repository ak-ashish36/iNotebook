var jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'ashishkumarguptacse2023';

const fetchuser = (req, res, next) => {
    try {
        // Get the user from the jwt token and add id to req object
        const token = req.header('auth-token');
        if (!token) {
            res.status(401).send({ error: "Please authenticate using a valid token" })
        }
        const data = jwt.verify(token, JWT_SECRET);
        req.userId = data;
        next();
    } catch (error) {
        res.status(500).json({ "Server Error": error.message });
    }
}
module.exports = fetchuser;