const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const schemas = require("../middleware/schemas");
const validateReq = require("../middleware/validateReq");
const users = require("../services/users");
const config = require("../config");

/**
 *  @swagger
 *   components:
 *     securitySchemes:
 *      bearerAuth:            # arbitrary name for the security scheme
 *          type: http
 *          scheme: bearer
 *          bearerFormat: JWT    # optional, arbitrary value for documentation purposes
 */

/**
 * @swagger
 *  tags:
 *      name: Authorization
 *      description: Authorization managing API
 */

/**
 * @swagger
 * /auth/register:
 *  post:
 *      tags: [Authorization]
 *      summary: Registers an user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                          email:
 *                              type: string
 *                          password:
 *                              type: string
 *                      example:
 *                          username: admin
 *                          email: admin@gmail.com
 *                          password: secretpassword
 *
 *      responses:
 *          "201":
 *              description: User was successfully created.

 *          "400":
 *              description: Incorrect request body
 *
 *          "409":
 *              description: User already exists
 *
 *          "500":
 *              description: Some server error
 */

router.post("/register", async (req, res, next) => {
    try {
        const user = {
            username: req.body.username,
            email: req.body.email,
            role: "user",
            password: req.body.password,
        };
        console.log(user);
        res.status(201).json(await users.create(user));
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(409).send({ message: err.message });
        } else {
            console.error(`Error while registering new user`, err.message);
            next(err);
        }
    }
});

/**
 * @swagger
 *  tags:
 *      name: Authorization
 *      description: Authorization managing API
 */

/**
 * @swagger
 * /auth/login:
 *  post:
 *      tags: [Authorization]
 *      summary: Login an user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                          password:
 *                              type: string
 *                      example:
 *                          username: admin
 *                          password: secretpassword
 *
 *      responses:
 *          "200":
 *              description: User was successfully loggedin.

 *          "400":
 *              description: Incorrect request body
 *
 *          "404":
 *              description: Incorrect username or password
 *
 *          "500":
 *              description: Some server error
 */

router.post("/login", validateReq(schemas.authLoginPOST, "body"), async function (req, res, next) {
    try {
        let userData = await users.getByName(req.body.username);

        if (userData) {
            userData = userData[0];

            const hash = bcrypt.hashSync(req.body.password, userData.salt);
            if (hash === userData.password_hash) {
                const token = jwt.sign({ id: userData.id, role: userData.role }, config.secret, {
                    expiresIn: 86400, // expires in 24 hours
                });

                res.status(200).send({ token, role: userData.role });
            } else {
                res.status(404).send({ message: "Incorrect username or password" });
            }
        } else {
            res.status(404).send({ message: "Incorrect username or password" });
        }
    } catch (err) {
        console.error(`Error while logging in`, err.message);
        next(err);
    }
});

module.exports = router;
