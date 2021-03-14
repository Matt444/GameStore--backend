const express = require("express");
const router = express.Router();

const schemas = require("../middleware/schemas");
const validateReq = require("../middleware/validateReq");
const auth = require("../middleware/auth");
const games = require("../services/games");

/**
 *  @swagger
 *   components:
 *     schemas:
 *       Game:
 *         type: object
 *         required:
 *           - name
 *           - price
 *           - quantity
 *           - description
 *           - release_date
 *           - is_digital
 *           - age_category
 *           - platform_id
 *           - categories_id
 *         properties:
 *           id:
 *             type: integer
 *             description: The auto-generated id of the game.
 *           name:
 *             type: string
 *             description: The name of the game.
 *           price:
 *             type: integer
 *             description: The price of the game.
 *           quantity:
 *             type: integer
 *             description: The quantity of box type games.
 *           description:
 *             type: string
 *             description: The description of the game.
 *           release_date:
 *             type: string
 *             description: The release date of the game.
 *           is_digital:
 *             type: integer
 *             description: The type of the game - 0 box type, 1 digital type.
 *           age_category:
 *             type: string
 *             description: The age category of the game i PEGI rating system - PEGI(3,7,12,16,18).
 *           platform_id:
 *             type: integer
 *             description: The id of the category
 *           categories_id:
 *              type: array
 *              description: The array of categories id.
 *         example:
 *            name: Cyberpunk 2077
 *            price: 200
 *            quantity: 10
 *            description: The RPG game of the polish game studio CD PROJECT RED.
 *            release_date: 2021-03-11T23:06:06.000Z
 *            is_digital: 0
 *            age_category: PEGI18
 *            platform_id: 5
 *            categories_id: [1, 4, 8]
 */

/**
 * @swagger
 *  tags:
 *      name: Games
 *      description: Games managing API
 */

/**
 * @swagger
 * /games:
 *  get:
 *      tags: [Games]
 *      summary: Returns the list of all the games
 *      parameters:
 *         - in: query
 *           name: offset
 *           type: integer
 *           description: The number of games to skip before starting to collect the result set, can not by used without limit specified.
 *         - in: query
 *           name: limit
 *           type: integer
 *           description: The numbers of games to return.
 *         - in: query
 *           name: q
 *           type: string
 *           description: The search query according to name of the game.
 *      responses:
 *          200:
 *              description: The list of the games
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Game'
 *          500:
 *              description: Some server error.
 */

router.get("/", async function (req, res, next) {
    try {
        res.json(await games.getMultiple(req.query));
    } catch (err) {
        console.error(`Error while getting games `, err.message);
        next(err);
    }
});

/**
 * @swagger
 * /games:
 *  post:
 *      security:
 *          - bearerAuth: []
 *      tags: [Games]
 *      summary: Creates a game - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Game'
 *      responses:
 *          "201":
 *              description: Game was successfully created.
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Game'
 *          "400":
 *              description: Incorrect request body
 *
 *          "401":
 *              description: Access token is missing or invalid
 *
 *          "409":
 *              description: Game already exists
 *
 *          "500":
 *              description: Some server error
 */

router.post(
    "/",
    auth.passIfAdmin(),
    validateReq(schemas.gamePOST, "body"),
    async function (req, res, next) {
        try {
            res.status(201).json(await games.create(req.body));
        } catch (err) {
            console.log(err.code);
            if (err.code === "ER_NO_REFERENCED_ROW_2") {
                res.status(400).send({
                    message: "Incorrect id of platform/category.",
                    mysql_message: err.message,
                });
            } else {
                console.error(`Error while creating game`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /games/search:
 *  post:
 *      tags: [Games]
 *      summary: Returns the list of games related to search params
 *      parameters:
 *         - in: query
 *           name: offset
 *           type: integer
 *           description: The number of games to skip before starting to collect the result set, can not by used without limit specified.
 *         - in: query
 *           name: limit
 *           type: integer
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: Searching query for name param - empty string means allow all.
 *                     is_digital:
 *                       type: array
 *                       description: The type of the games - 0 box type, 1 digital type - empty array means allow all.
 *                     age_categories:
 *                       type: array
 *                       description: The age category of the game in PEGI rating system - PEGI(3,7,12,16,18) - empty array means allow all.
 *                     platforms_id:
 *                       type: array
 *                       description: The ids of the platforms - empty array means allow all.
 *                     categories_id:
 *                        type: array
 *                        description: The array of categories id - empty array means allow all.
 *                   example:
 *                      name: Cyber
 *                      is_digital: [0,1]
 *                      age_categories: ["PEGI18"]
 *                      platforms_id: [5]
 *                      categories_id: [1, 4]
 *      responses:
 *          "200":
 *              description: Games were successfully searched
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Game'
 *          "400":
 *              description: Incorrect request body
 *
 *          "401":
 *              description: Access token is missing or invalid
 *
 *          "500":
 *              description: Some server error
 */

router.post("/search", validateReq(schemas.gamePOST_SEARCH, "body"), async (req, res, next) => {
    try {
        res.status(200).json(await games.getMultipleSearch(req.query, req.body));
    } catch (err) {
        console.error(`Error while getting games `, err.message);
        next(err);
    }
});

/**
 * @swagger
 * /games/{id}:
 *  patch:
 *      security:
 *          - bearerAuth: []
 *      tags: [Games]
 *      summary: Updates an game by id - requires admin authorization
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Game'
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: Game id
 *      responses:
 *          200:
 *              description: Game was successfully updated
 *          400:
 *              description: Incorrect request body
 *          401:
 *              description: Access token is missing or invalid
 *          404:
 *              description: Game was not found
 *          500:
 *              description: Some server error
 */

router.patch(
    "/:id",
    auth.passIfAdmin(),
    validateReq(schemas.gamePATCH, "body"),
    async (req, res, next) => {
        try {
            res.json(await games.updateChosen(req.params.id, req.body));
        } catch (err) {
            if (err.code === "ER_NO_REFERENCED_ROW_2") {
                res.status(400).send({
                    message: "Incorrect id of platform/category.",
                    mysql_message: err.message,
                });
            } else if (err.code === "NOT_FOUND") {
                res.status(404).send({ message: err.message });
            } else {
                console.error(`Error while updating game`, err.message);
                next(err);
            }
        }
    }
);

/**
 * @swagger
 * /games/{id}:
 *  delete:
 *      security:
 *          - bearerAuth: []
 *      tags: [Games]
 *      summary: Deletes a game by id - requires admin authorization
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: integer
 *            required: true
 *            description: Game id
 *      responses:
 *          "200":
 *              description: Game was successfully deleted
 *          "400":
 *              description: Game which was bought can not be deleted.
 *          "401":
 *              description: Access token is missing or invalid
 *          "404":
 *              description: Game was not found
 *          "500":
 *              description: "Some server error"
 */

router.delete("/:id", auth.passIfAdmin(), async function (req, res, next) {
    try {
        res.json(await games.remove(req.params.id));
    } catch (err) {
        if (err.code === "ER_ROW_IS_REFERENCED_2") {
            res.status(400).send({ message: "Game which was bought can not be deleted" });
        } else if (err.code === "NOT_FOUND") {
            res.status(404).send({ message: err.message });
        } else {
            console.error(`Error while deleting game`, err.message);
            next(err);
        }
    }
});

module.exports = router;
