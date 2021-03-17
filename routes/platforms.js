const express = require("express");
const router = express.Router();

const schemas = require("../middleware/schemas");
const validateReq = require("../middleware/validateReq");
const auth = require("../middleware/auth");
const platforms = require("../services/platforms");

/**
 *  @swagger
 *   components:
 *     schemas:
 *       Platform:
 *         type: object
 *         required:
 *           - name
 *         properties:
 *           id:
 *             type: integer
 *             description: The auto-generated id of the platform.
 *           name:
 *             type: string
 *             description: The name of the platform.
 *         example:
 *            name: PC
 */

/**
 * @swagger
 *  tags:
 *      name: Platforms
 *      description: Platforms managing API
 */

/**
 * @swagger
 * /platforms:
 *  get:
 *      tags: [Platforms]
 *      summary: Returns the list of all the platforms
 *      responses:
 *          200:
 *              description: The list of the platforms
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Platform'
 *          500:
 *              description:: Some server error
 */

router.get("/", async function (req, res, next) {
    try {
        res.json(await platforms.getMultiple());
    } catch (err) {
        console.error(`Error while getting platforms `, err.message);
        next(err);
    }
});

/**
 * @swagger
 * /platforms:
 *  post:
 *      security:
 *          - bearerAuth: []
 *      tags: [Platforms]
 *      summary: Creates a platform - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Platform'
 *      responses:
 *          "201":
 *              description: Platform was successfully created.
 *
 *          "400":
 *              description: Incorrect request body
 *
 *          "401":
 *              description: Access token is missing or invalid
 *
 *          "409":
 *              description: Platform already exists
 *
 *          "500":
 *              description: Some server error
 */

router.post(
    "/",
    auth.passIfAdmin(),
    validateReq(schemas.platformPOST, "body"),
    async function (req, res, next) {
        try {
            res.status(201).json(await platforms.create(req.body));
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).send({ message: err.message });
            } else {
                console.error(`Error while creating platform`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /platforms/{id}:
 *  put:
 *      security:
 *          - bearerAuth: []
 *      tags: [Platforms]
 *      summary: Updates a platform by id - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Platform'
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: Platform id
 *      responses:
 *          200:
 *              description: Platform was successfully updated
 *          400:
 *              description: Incorrect request body
 *          401:
 *              description: Access token is missing or invalid
 *          404:
 *              description: Platform was not found
 *          409:
 *              description: Platform already exists
 *          500:
 *              description: Some server error
 */

router.put(
    "/:id",
    auth.passIfAdmin(),
    validateReq(schemas.platformPOST, "body"),
    async (req, res, next) => {
        try {
            res.json(await platforms.update(req.params.id, req.body));
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).send({ message: err.message });
            } else if (err.code === "NOT_FOUND") {
                res.status(404).send({ message: err.message });
            } else {
                console.error(`Error while updating platform`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /platforms/{id}:
 *  delete:
 *      security:
 *          - bearerAuth: []
 *      tags: [Platforms]
 *      summary: Deletes a platform by id - requires admin authorization
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: Platform id
 *      responses:
 *          "200":
 *              description: Platform was successfully deleted
 *          "401":
 *              description: Access token is missing or invalid
 *          "404":
 *              description: Platform was not found
 *          "500":
 *              description: "Some server error"
 */

router.delete("/:id", auth.passIfAdmin(), async function (req, res, next) {
    try {
        res.json(await platforms.remove(req.params.id));
    } catch (err) {
        if (err.code === "NOT_FOUND") {
            res.status(404).send({ message: err.message });
        } else {
            console.error(`Error while deleting platform`, err.message);
            next(err);
        }
    }
});

module.exports = router;
