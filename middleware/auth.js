const jwt = require("jsonwebtoken");
const config = require("../config");

const passIfAdmin = () => {
    return (req, res, next) => {
        const bearerHeader = req.headers["authorization"];
        if (!bearerHeader) return res.status(401).send({ message: "No token provided." });

        const token = bearerHeader.split(" ")[1];

        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) return res.status(500).send({ message: "Failed to authenticate token." });

            // if everything good, save to request for use in other routes

            if (decoded.role === "admin") {
                req.userIdFromJWT = decoded.id;
                next();
            } else {
                return res.status(401).send({ message: "Insufficient permissions." });
            }
        });
    };
};

const passIfUserOrAdmin = () => {
    return (req, res, next) => {
        const bearerHeader = req.headers["authorization"];
        if (!bearerHeader) return res.status(401).send({ message: "No token provided." });

        const token = bearerHeader.split(" ")[1];

        jwt.verify(token, config.secret, function (err, decoded) {
            if (err) return res.status(500).send({ message: "Failed to authenticate token." });

            // if everything good, save to request for use in other routes

            if (decoded.role === "admin" || decoded.role === "user") {
                req.userIdFromJWT = decoded.id;
                next();
            } else {
                return res.status(401).send({ message: "Insufficient permissions." });
            }
        });
    };
};

module.exports = {
    passIfAdmin,
    passIfUserOrAdmin,
};
