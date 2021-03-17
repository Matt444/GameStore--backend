const db = require("./db");
const config = require("../config");
const helper = require("../helper");
const mysql = require("mysql2/promise");

async function getMultiple(query) {
    const { offset, limit, q } = query;

    const games = await db.query(
        `SELECT g.id, g.name, g.price, IF(g.is_digital,(SELECT COUNT(gk.id) FROM games_keys gk WHERE gk.game_id=g.id),g.quantity) AS quantity,
         g.description, g.release_date, g.is_digital,
         g.age_category, g.image_url, (SELECT JSON_OBJECT('id',p.id,'name',p.name) FROM platforms p WHERE p.id=g.platform_id) AS platform, 
         JSON_ARRAYAGG((SELECT JSON_OBJECT('id',c.id,'name',c.name) FROM  categories c WHERE gc.category_id=c.id)) AS categories FROM games g, games_categories gc WHERE g.id=gc.game_id AND name LIKE ? GROUP BY g.id LIMIT ? OFFSET ?;`,
        [`%${q || ""}%`, limit || "1844674407370955161", offset || "0"]
    );

    const [
        total,
    ] = await db.query(`SELECT COUNT(id) AS totalGamesNumber FROM games WHERE name LIKE ?`, [
        `%${q || ""}%`,
    ]);

    return { totalGamesNumber: total.totalGamesNumber, games };
}

async function getOne(id) {
    const game = await db.query(
        `SELECT g.id, g.name, g.price, IF(g.is_digital,(SELECT COUNT(gk.id) FROM games_keys gk WHERE gk.game_id=g.id),g.quantity) AS quantity,
    g.description, g.release_date, g.is_digital,
    g.age_category, g.image_url, (SELECT JSON_OBJECT('id',p.id,'name',p.name) FROM platforms p WHERE p.id=g.platform_id) AS platform, 
    JSON_ARRAYAGG((SELECT JSON_OBJECT('id',c.id,'name',c.name) FROM  categories c WHERE gc.category_id=c.id)) AS categories FROM games g, games_categories gc WHERE g.id=? AND g.id=gc.game_id GROUP BY g.id;`,
        [id]
    );

    return game[0];
}

async function getMultipleSearch(query, params) {
    let { offset, limit } = query;

    const { name, is_digital, age_categories, platforms_id, categories_id } = params;

    const games = await db.query(
        `SELECT g.id, g.name, g.price, IF(g.is_digital,(SELECT COUNT(gk.id) FROM games_keys gk WHERE gk.game_id=g.id),g.quantity) AS quantity, g.description, g.release_date, g.is_digital,
        g.age_category, g.image_url, (SELECT JSON_OBJECT('id',p.id,'name',p.name) FROM platforms p WHERE p.id=g.platform_id) AS platform, JSON_ARRAYAGG((SELECT JSON_OBJECT('id',c.id,'name',c.name) FROM  categories c WHERE gc.category_id=c.id)) AS categories FROM games g, games_categories gc 
        WHERE g.id = gc.game_id AND g.id=ANY(SELECT DISTINCT(g.id) FROM games g, games_categories gc WHERE g.id = gc.game_id 
        AND g.name LIKE ? ${
            is_digital && is_digital.length > 0
                ? ` AND g.is_digital IN(${is_digital.map((i) => mysql.escape(i))}) `
                : ``
        } ${
            age_categories && age_categories.length > 0
                ? ` AND g.age_category IN(${age_categories.map((ag) => `${mysql.escape(ag)}`)}) `
                : ``
        } ${
            platforms_id && platforms_id.length > 0
                ? ` AND g.platform_id IN(${platforms_id.map((id) => mysql.escape(id))}) `
                : ``
        } ${
            categories_id && categories_id.length > 0
                ? ` AND gc.category_id IN(${categories_id.map((id) => mysql.escape(id))}) `
                : ``
        }) GROUP BY g.id LIMIT ? OFFSET ?;`,
        [
            name && name.length > 0 ? `%${name}%` : "%%",
            limit || "1844674407370955161",
            offset || "0",
        ]
    );

    const [total] = await db.query(
        `SELECT COUNT(DISTINCT(g.id)) AS totalGamesNumber FROM games g, games_categories gc WHERE g.id = gc.game_id 
    AND g.name LIKE ? ${
        is_digital && is_digital.length > 0
            ? ` AND g.is_digital IN(${is_digital.map((i) => mysql.escape(i))}) `
            : ``
    } ${
            age_categories && age_categories.length > 0
                ? ` AND g.age_category IN(${age_categories.map((ag) => `${mysql.escape(ag)}`)}) `
                : ``
        } ${
            platforms_id && platforms_id.length > 0
                ? ` AND g.platform_id IN(${platforms_id.map((id) => mysql.escape(id))}) `
                : ``
        } ${
            categories_id && categories_id.length > 0
                ? ` AND gc.category_id IN(${categories_id.map((id) => mysql.escape(id))}) `
                : ``
        };`,
        [name && name.length > 0 ? `%${name}%` : "%%"]
    );

    return { totalGamesNumber: total.totalGamesNumber, games };
}

async function create(game) {
    let queries = [
        `INSERT INTO games (name, price, quantity, description, release_date, is_digital, age_category, platform_id, image_url) VALUES (?,?,?,?,?,?,?,?,?)`,
    ];
    let queryValues = [
        [
            game.name,
            game.price,
            game.quantity,
            game.description,
            game.release_date,
            game.is_digital,
            game.age_category,
            game.platform_id,
            game.image_url,
        ],
    ];
    game.categories_id.map((c) => {
        queries = [
            ...queries,
            `INSERT INTO games_categories (game_id, category_id) VALUES ((SELECT MAX(id) FROM games),?)`,
        ];
        queryValues = [...queryValues, [c]];
    });
    const [result] = await db.transaction(queries, queryValues);

    let message = "Error in creating game";

    if (result[0].affectedRows) {
        message = "Game was successfully created";
    }

    return { message };
}

async function updateChosen(id, game) {
    let queries = [
        `UPDATE games SET ${helper.setExisting(
            [
                "name",
                "price",
                "quantity",
                "description",
                "release_date",
                "is_digital",
                "age_category",
                "platform_id",
                "image_url",
            ],
            [
                game.name,
                game.price,
                game.quantity,
                game.description,
                game.release_date,
                game.is_digital,
                game.age_category,
                game.platform_id,
                game.image_url,
            ]
        )} WHERE id=?`,
    ];
    let queryValues = [[id]];

    if (game.categories_id && game.categories_id.length > 0) {
        queries = [...queries, `DELETE FROM games_categories WHERE game_id=?`];
        queryValues = [...queryValues, [id]];
        game.categories_id.map((c) => {
            queries = [
                ...queries,
                `INSERT INTO games_categories (game_id, category_id) VALUES (?,?)`,
            ];
            queryValues = [...queryValues, [id, c]];
        });
    }
    const [result] = await db.transaction(queries, queryValues);

    if (result[0].affectedRows) {
        return { message: "Game was successfully updated" };
    } else {
        const error = Error("Game was not found");
        error.code = "NOT_FOUND";
        throw error;
    }
}

async function remove(id) {
    const queries = [
        `DELETE FROM games_categories WHERE game_id=?`,
        `DELETE FROM games_keys WHERE game_id=?`,
        `DELETE FROM games WHERE id=?`,
    ];
    const queryValues = [[id], [id], [id]];

    const [result] = await db.transaction(queries, queryValues);
    console.log(result);

    if (result[0].affectedRows) {
        return { message: "Game deleted successfully" };
    } else {
        const error = Error("Game was not found");
        error.code = "NOT_FOUND";
        throw error;
    }
}

module.exports = {
    getMultiple,
    getOne,
    getMultipleSearch,
    create,
    updateChosen,
    remove,
};
