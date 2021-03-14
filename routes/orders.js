const express = require("express");
const router = express.Router();

const schemas = require("../middleware/schemas");
const validateReq = require("../middleware/validateReq");
const auth = require("../middleware/auth");
const orders = require("../services/orders");

/**
 *  @swagger
 *   components:
 *     schemas:
 *       Order:
 *         type: object
 *         required:
 *           - user_id
 *           - date
 *           - games
 *         properties:
 *           id:
 *             type: integer
 *             description: The auto-generated id of the order.
 *           user_id:
 *             type: integer
 *             description: The id of the user.
 *           date:
 *              type: string
 *              description: The data of the order.
 *           games:
 *              type: array
 *              description: Array of the games that were bought in this order.
 *         example:
 *            id: 1
 *            user_id: 2
 *            date: '2021-03-11T23:06:06.000Z'
 *            games: [{game_id: 1, name: Cyberpunk2077, price: 200, is_digital: 1, key: 5FJG-JEF8-JGKE}]
 */

/**
 * @swagger
 *  tags:
 *      name: Orders
 *      description: Orders managing API
 */

/**
 * @swagger
 * /orders:
 *  get:
 *      security:
 *          - bearerAuth: []
 *      tags: [Orders]
 *      summary: Returns all the orders
 *      responses:
 *          200:
 *              description: The list of all the orders
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Order'
 *          401:
 *              description: Access token is missing or invalid
 *          500:
 *              description: Some server error
 */

router.get("/", auth.passIfAdmin(), async function (req, res, next) {
    try {
        res.status(200).send(await orders.getMultiple());
    } catch (err) {
        console.error(`Error while getting orders`, err.message);
        next();
    }
});

/**
 * @swagger
 * /orders/loggeduser:
 *  get:
 *      security:
 *          - bearerAuth: []
 *      tags: [Orders]
 *      summary: Returns the orders of the logged user
 *      responses:
 *          200:
 *              description: The list of the orders of the logged user
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: array
 *                          items:
 *                              $ref: '#/components/schemas/Order'
 *          401:
 *              description: Access token is missing or invalid
 *          500:
 *              description: Some server error
 */

router.get("/loggeduser", auth.passIfUserOrAdmin(), async function (req, res, next) {
    try {
        res.status(200).send(await orders.getOne(req.userIdFromJWT));
    } catch (err) {
        console.error(`Error while getting orders`, err.message);
        next();
    }
});

/**
 * @swagger
 * /orders/loggeduser:
 *  post:
 *      security:
 *          - bearerAuth: []
 *      tags: [Orders]
 *      summary: Creates an order for logged user
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: array
 *                      items:
 *                          type: object
 *                          required:
 *                              - game_id
 *                              - quantity
 *                          properties:
 *                              game_id:
 *                                  type: integer
 *                                  description: Id of the game.
 *                              quantity:
 *                                  type: integer
 *                                  description: Quantity to order.
 *                          example:
 *                              game_id: 1
 *                              quantity: 2
 *
 *      responses:
 *          201:
 *              description: Order was successfully created
 *          400:
 *              description: Ivalid request body
 *          401:
 *              description: Access token is missing or invalid
 *          500:
 *              description: Some server error
 */

router.post(
    "/loggeduser",
    auth.passIfUserOrAdmin(),
    validateReq(schemas.ordersPOST, "body"),
    async function (req, res, next) {
        try {
            res.status(201).send(await orders.create(req.userIdFromJWT, req.body));
        } catch (err) {
            console.error(`Error while creating orders`, err.message);
            next();
        }
    }
);

module.exports = router;
