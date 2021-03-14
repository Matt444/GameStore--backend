const express = require("express");
const router = express.Router();

const schemas = require("../middleware/schemas");
const validateReq = require("../middleware/validateReq");
const auth = require("../middleware/auth");
const categories = require("../services/categories");

/**
 *  @swagger
 *   components:
 *     schemas:
 *       Category:
 *         type: object
 *         required:
 *           - name
 *         properties:
 *           id:
 *             type: integer
 *             description: The auto-generated id of the category.
 *           name:
 *             type: string
 *             description: The name of the category.
 *         example:
 *            name: RPG
 */

/**
 * @swagger
 *  tags:
 *      name: Categories
 *      description: Categories managing API
 */

/**
 * @swagger
 * /categories:
 *  get:
 *      tags: [Categories]
 *      summary: Returns the list of all the categories
 *      responses:
 *          200:
 *              description: The list of the categories
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Category'
 *          500:
 *              description:: Some server error
 */

router.get("/", async function (req, res, next) {
    try {
        res.json(await categories.getMultiple());
    } catch (err) {
        console.error(`Error while getting categories `, err.message);
        next(err);
    }
});

/**
 * @swagger
 * /categories:
 *  post:
 *      security:
 *          - bearerAuth: []
 *      tags: [Categories]
 *      summary: Creates a category - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Category'
 *      responses:
 *          "201":
 *              description: Category was successfully created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Category'
 *          "400":
 *              description: Incorrect request body
 *
 *          "401":
 *              description: Access token is missing or invalid
 *
 *          "409":
 *              description: Category already exists
 *
 *          "500":
 *              description: Some server error
 */

router.post(
    "/",
    auth.passIfAdmin(),
    validateReq(schemas.categoryPOST, "body"),
    async function (req, res, next) {
        try {
            res.status(201).json(await categories.create(req.body));
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
 * /categories/{id}:
 *  put:
 *      security:
 *          - bearerAuth: []
 *      tags: [Categories]
 *      summary: Updates a category by id - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Category'
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: Category id
 *      responses:
 *          200:
 *              description: Category was successfully updated
 *          400:
 *              description: Incorrect request body
 *          401:
 *              description: Access token is missing or invalid
 *          404:
 *              description: Category was not found
 *          409:
 *              description: Category already exists
 *          500:
 *              description: Some server error
 */

router.put(
    "/:id",
    auth.passIfAdmin(),
    validateReq(schemas.categoryPOST, "body"),
    async (req, res, next) => {
        try {
            res.json(await categories.update(req.params.id, req.body));
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                res.status(409).send({ message: err.message });
            } else if (err.code === "NOT_FOUND") {
                res.status(404).send({ message: err.message });
            } else {
                console.error(`Error while updating category`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /categories/{id}:
 *  delete:
 *      security:
 *          - bearerAuth: []
 *      tags: [Categories]
 *      summary: Deletes a category by id - requires admin authorization
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: Category id
 *      responses:
 *          "200":
 *              description: Category was successfully deleted
 *          "401":
 *              description: Access token is missing or invalid
 *          "404":
 *              description: Category was not found
 *          "500":
 *              description: "Some server error"
 */

router.delete("/:id", auth.passIfAdmin(), async function (req, res, next) {
    try {
        res.json(await categories.remove(req.params.id));
    } catch (err) {
        if (err.code === "NOT_FOUND") {
            res.status(404).send({ message: err.message });
        } else {
            console.error(`Error while deleting category`, err.message);
            next(err);
        }
    }
});

module.exports = router;
