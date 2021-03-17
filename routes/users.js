const express = require("express");
const router = express.Router();

const schemas = require("../middleware/schemas");
const validateReq = require("../middleware/validateReq");
const auth = require("../middleware/auth");
const users = require("../services/users");

/**
 *  @swagger
 *   components:
 *     schemas:
 *       User:
 *         type: object
 *         required:
 *           - name
 *           - email
 *           - role
 *           - password
 *         properties:
 *           id:
 *             type: integer
 *             description: The auto-generated id of the user.
 *           username:
 *             type: string
 *             description: The login of the user.
 *           email:
 *              type: string
 *              description: The email of the user.
 *           role:
 *              type: string
 *              description: The string that identifies authority of the user - admin or user.
 *           password:
 *              type: string
 *              description: The password of the user
 *         example:
 *            username: admin
 *            email: admin@gmail.com
 *            role: admin
 *            password: "12345678"
 */

/**
 * @swagger
 *  tags:
 *      name: Users
 *      description: Users managing API
 */

/**
 * @swagger
 * /users:
 *  get:
 *      security:
 *          - bearerAuth: []
 *      tags: [Users]
 *      summary: Returns the list of all the users - requires admin authorization
 *      responses:
 *          200:
 *              description: The list of the users
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/User'
 *          401:
 *              description: Access token is missing or invalid
 */

router.get("/", auth.passIfAdmin(), async (req, res, next) => {
    try {
        res.json(await users.getMultiple());
    } catch (err) {
        console.error(`Error while getting users `, err.message);
        next(err);
    }
});

/**
 * @swagger
 * /users:
 *  post:
 *      security:
 *          - bearerAuth: []
 *      tags: [Users]
 *      summary: Creates an user - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/User'
 *      responses:
 *          "201":
 *              description: User was successfully created.
 *
 *          "400":
 *              description: Incorrect request body
 *
 *          "401":
 *              description: Access token is missing or invalid
 *
 *          "409":
 *              description: User already exists
 *
 *          "500":
 *              description: Some server error
 */

router.post(
    "/",
    auth.passIfAdmin(),
    validateReq(schemas.userPOST, "body"),
    async function (req, res, next) {
        try {
            res.status(201).json(await users.create(req.body));
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).send({ message: err.message });
            } else {
                console.error(`Error while creating user`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /users:
 *  patch:
 *      security:
 *          - bearerAuth: []
 *      tags: [Users]
 *      summary: Updates logged in user - requires user or admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                        name:
 *                            type: string
 *                            description: The login of the user.
 *                        email:
 *                            type: string
 *                            description: The email of the user.
 *                        password:
 *                            type: string
 *                            description: The password of the user.
 *                  example:
 *                    name: admin
 *                    email: admin@gmail.com
 *                    password: secretpassword
 *      responses:
 *          200:
 *              description: User was successfully updated
 *          400:
 *              description: Incorrect request body
 *          401:
 *              description: Access token is missing or invalid
 *          409:
 *              description: User with this name or email already exists
 *          500:
 *              description: Some server error
 */

router.patch(
    "/",
    auth.passIfUserOrAdmin(),
    validateReq(schemas.userLoggedUserPATCH, "body"),
    async (req, res, next) => {
        try {
            res.json(await users.updateChosen(req.userIdFromJWT, req.body));
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).send({ message: err.message });
            } else {
                console.error(`Error while updating user`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /users/{id}:
 *  patch:
 *      security:
 *          - bearerAuth: []
 *      tags: [Users]
 *      summary: Updates an user by id - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                    type: object
 *                    properties:
 *                        name:
 *                            type: string
 *                            description: The login of the user.
 *                        email:
 *                            type: string
 *                            description: The email of the user.
 *                        role:
 *                            type: string
 *                            description: The role of the user - admin or user.
 *                        password:
 *                            type: string
 *                            description: The password of the user.
 *                  example:
 *                    name: admin
 *                    email: admin@gmail.com
 *                    role: admin
 *                    password: secretpassword
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: User id
 *      responses:
 *          200:
 *              description: User was successfully updated
 *          400:
 *              description: Incorrect request body
 *          401:
 *              description: Access token is missing or invalid
 *          404:
 *              description: User was not found
 *          409:
 *              description: User with this name or email already exists
 *          500:
 *              description: Some server error
 */

router.patch(
    "/:id",
    auth.passIfAdmin(),
    validateReq(schemas.userPATCH, "body"),
    async (req, res, next) => {
        try {
            res.json(await users.updateChosen(req.params.id, req.body));
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).send({ message: err.message });
            } else if (err.code === "NOT_FOUND") {
                res.status(404).send({ message: err.message });
            } else {
                console.error(`Error while updating user`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /users/{id}:
 *  delete:
 *      security:
 *          - bearerAuth: []
 *      tags: [Users]
 *      summary: Deletes an user by id - requires admin authorization
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: User id
 *      responses:
 *          "200":
 *              description: User was successfully deleted
 *          "400":
 *              description: You cannot delete your own account
 *          "401":
 *              description: Access token is missing or invalid
 *          "404":
 *              description: User was not found
 *          "500":
 *              description: "Some server error"
 */

router.delete("/:id", auth.passIfAdmin(), async (req, res, next) => {
    if (req.params.id === req.userIdFromJWT) {
        res.status(400).send({ message: "You cannot delete your own account" });
    }

    try {
        res.json(await users.remove(req.params.id));
    } catch (err) {
        if (err.code === "NOT_FOUND") {
            res.status(404).send({ message: err.message });
        } else {
            console.error(`Error while deleting user`, err.message);
            next(err);
        }
    }
});

module.exports = router;
