const express = require("express");
const router = express.Router();

const schemas = require("../middleware/schemas");
const validateReq = require("../middleware/validateReq");
const auth = require("../middleware/auth");
const keys = require("../services/keys");

/**
 *  @swagger
 *   components:
 *     schemas:
 *       Key:
 *         type: object
 *         required:
 *           - game_id
 *           - used
 *           - gkey
 *         properties:
 *           id:
 *             type: integer
 *             description: The auto-generated id of the platform.
 *           game_id:
 *             type: integer
 *             description: The id of the game related to this key.
 *           used:
 *             type: integer
 *             description: The information if key was sold - 0 not sold, 1 sold.
 *           gkey:
 *             type: string
 *             description: The key.
 *         example:
 *            id: 1
 *            game_id: 10
 *            used: 0
 *            gkey: 68IC5-8Q4K5-EJ853
 */

/**
 * @swagger
 *  tags:
 *      name: Keys
 *      description: Keys managing API
 */

/**
 * @swagger
 * /keys:
 *  get:
 *      security:
 *          - bearerAuth: []
 *      tags: [Keys]
 *      summary: Returns the list of all the keys - requires admin authorization
 *      responses:
 *          200:
 *              description: The list of all the keys
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Key'
 *          401:
 *              description: Access token is missing or invalid
 */

router.get("/", auth.passIfAdmin(), async (req, res, next) => {
    try {
        res.json(await keys.getMultiple());
    } catch (err) {
        console.error(`Error while getting keys `, err.message);
        next(err);
    }
});

/**
 * @swagger
 * /keys:
 *  post:
 *      security:
 *          - bearerAuth: []
 *      tags: [Keys]
 *      summary: Creates a key - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Key'
 *      responses:
 *          "201":
 *              description: Key was successfully created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Key'
 *          "400":
 *              description: Incorrect request body
 *
 *          "401":
 *              description: Access token is missing or invalid
 *
 *          "409":
 *              description: Key already exists
 *
 *          "500":
 *              description: Some server error
 */

router.post(
    "/",
    auth.passIfAdmin(),
    validateReq(schemas.keyPOST, "body"),
    async (req, res, next) => {
        try {
            res.json(await keys.create(req.body)).status(201);
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).send({ message: err.message });
            } else {
                console.error(`Error while creating category`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /keys/{id}:
 *  delete:
 *      security:
 *          - bearerAuth: []
 *      tags: [Keys]
 *      summary: Deletes a key by id - requires admin authorization
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: Key id
 *      responses:
 *          "200":
 *              description: Key was successfully deleted
 *          "401":
 *              description: Access token is missing or invalid
 *          "404":
 *              description: Key was not found
 *          "500":
 *              description: "Some server error"
 */

router.delete("/:id", auth.passIfAdmin(), async function (req, res, next) {
    try {
        res.json(await categories.remove(req.params.id));
    } catch (err) {
        if (err.code === "FORBIDDEN") {
            res.status(403).send({ message: err.message });
        } else if (err.code === "NOT_FOUND") {
            res.status(404).send({ message: err.message });
        } else {
            console.error(`Error while deleting category`, err.message);
            next(err);
        }
    }
});

module.exports = router;
