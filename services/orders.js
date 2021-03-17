const moment = require("moment");
const mysql = require("mysql2/promise");

const db = require("./db");
const config = require("../config");

async function getMultiple() {
    const result = await db.query(
        `SELECT ut.id, ut.user_id, date, JSON_ARRAYAGG(game_id) as games FROM users_transactions ut, games_transactions gt 
            WHERE ut.id=gt.user_transaction_id GROUP BY ut.id ORDER BY ut.id DESC;`,
        []
    );

    let orders = [];

    await Promise.all(
        result.map(async (order) => {
            const games = await db.query(
                `SELECT g.id, name, price, is_digital, IF(key_id IS NOT NULL,(SELECT gkey FROM games_keys gk WHERE gk.id=key_id),NULL) AS "key"
            FROM games g, games_transactions gt WHERE g.id IN(${order.games.map((g) =>
                mysql.escape(g)
            )}) AND g.id=gt.game_id AND gt.user_transaction_id=?;`,
                [order.id]
            );

            order.games = games;
            orders = [...orders, order];
        })
    );

    return orders;
}

async function getOne(userId) {
    const result = await db.query(
        `SELECT ut.id, date, JSON_ARRAYAGG(game_id) as games FROM users_transactions ut, games_transactions gt 
            WHERE ut.id=gt.user_transaction_id AND ut.user_id=? GROUP BY ut.id ORDER BY ut.id DESC;`,
        [userId]
    );

    let orders = [];

    await Promise.all(
        result.map(async (order) => {
            const games = await db.query(
                `SELECT g.id, name, price, is_digital, IF(key_id IS NOT NULL,(SELECT gkey FROM games_keys gk WHERE gk.id=key_id),NULL) AS "key"
            FROM games g, games_transactions gt WHERE g.id IN(${order.games.map((g) =>
                mysql.escape(g)
            )}) AND g.id=gt.game_id AND gt.user_transaction_id=?;`,
                [order.id]
            );

            order.games = games;
            orders = [...orders, order];
        })
    );

    return orders;
}

async function create(userId, order) {
    const mysqlTimestamp = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    let queries = [`INSERT INTO users_transactions (user_id,date) VALUES (?,?)`];
    let queryValues = [[userId, mysqlTimestamp]];

    await Promise.all(
        order.map(async (ord) => {
            const { game_id, quantity } = ord;

            const res = await db.query(`SELECT is_digital, quantity FROM games WHERE id=?`, [
                game_id,
            ]);

            if (res[0].is_digital === 0 && res[0].quantity < quantity) {
                const error = new Error("Not enough box games");
                throw error;
            }

            let keys = [];
            if (res[0].is_digital) {
                keys = await db.query("SELECT id FROM games_keys WHERE game_id=? AND used=0;", [
                    game_id,
                ]);
                if (keys.length < quantity) {
                    const error = new Error("Not enough keys");
                    throw error;
                }
            }

            for (i = 0; i < ord.quantity; i++) {
                queries = [
                    ...queries,
                    `INSERT INTO games_transactions (user_transaction_id, game_id, key_id) VALUES
            ((SELECT MAX(ut.id) FROM users_transactions ut),?,?)`,
                ];
                queryValues = [...queryValues, [game_id, res[0].is_digital ? keys[i].id : null]];
            }
        })
    );

    const result = await db.transaction(queries, queryValues);

    let message = "Order was created succesfully";

    return { message };
}

module.exports = {
    getMultiple,
    getOne,
    create,
};
