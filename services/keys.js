const db = require("./db");
const helper = require("../helper");
const config = require("../config");
const { func } = require("joi");

async function getMultiple() {
    const data = await db.query(`SELECT id, game_id, used, gkey FROM games_keys`, []);

    return data;
}

async function create(key) {
    const result = await db.query(
        `INSERT INTO games_keys (game_id, used, gkey) VALUES game_id=?, used=?, gkey=?`,
        [key.game_id, "0", key.gkey]
    );

    let message = "Error in creating key";

    if (result.affectedRows) {
        message = "Key created successfully";
    }

    return { message };
}

async function remove(id) {
    const [curr] = await db.query(`SELECT used FROM games_keys WHERE id=?`, [id]);
    if (curr.used) {
        const error = Error("You can not delete key which was sold");
        error.code = "FORBIDDEN";
        throw error;
    }

    const result = await db.query(`DELETE FROM games_keys WHER id=?`, [id]);

    if (result.affectedRows) {
        return { message: "Key was deleted successfully" };
    } else {
        const error = Error("Key was not found");
        error.code = "NOT_FOUND";
        throw error;
    }
}

module.exports = {
    getMultiple,
    create,
    remove,
};
