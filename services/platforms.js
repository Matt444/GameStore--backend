const db = require("./db");
const config = require("../config");

async function getMultiple() {
    const data = await db.query(`SELECT id, name FROM platforms`, []);

    return data;
}

async function create(platform) {
    const result = await db.query(`INSERT INTO platforms (name) VALUES (?)`, [platform.name]);

    let message = "Error in creating platform";

    if (result.affectedRows) {
        message = "Platform was successfully created";
    }

    return { message };
}

async function update(id, platform) {
    const result = await db.query(`UPDATE platforms SET name=? WHERE id=?`, [platform.name, id]);

    if (result.affectedRows) {
        return { message: "Platform was successfully updated" };
    } else {
        const error = Error("Platform was not found");
        error.code = "NOT_FOUND";
        throw error;
    }
}

async function remove(id) {
    const result = await db.query(`DELETE FROM platforms WHERE id=?`, [id]);

    if (result.affectedRows) {
        return { message: "Platform deleted successfully" };
    } else {
        const error = Error("Platform was not found");
        error.code = "NOT_FOUND";
        throw error;
    }
}

module.exports = {
    getMultiple,
    create,
    update,
    remove,
};
