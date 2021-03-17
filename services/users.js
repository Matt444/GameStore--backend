const db = require("./db");
const helper = require("../helper");
const config = require("../config");
const bcrypt = require("bcryptjs");

async function getMultiple() {
    const data = await db.query("SELECT id, name AS username, email, role FROM users", []);

    return data;
}

async function getByName(name) {
    const data = await db.query("SELECT id, role, password_hash, salt FROM users WHERE name=?", [
        name,
    ]);

    return data;
}

async function getById(id) {
    const data = await db.query("SELECT role FROM users WHERE id=?", [id]);

    return data;
}

async function create(user) {
    user.salt = bcrypt.genSaltSync(10);
    user.password_hash = bcrypt.hashSync(user.password, user.salt);

    const result = await db.query(
        `INSERT INTO users (name, email, role, password_hash, salt) VALUES (?,?,?,?,?)`,
        [user.username, user.email, user.role, user.password_hash, user.salt]
    );

    let message = "Error in creating user";

    if (result.affectedRows) {
        message = "User was successfully created";
    }

    return { message };
}

async function updateChosen(id, user) {
    user.salt = user.password ? bcrypt.genSaltSync(10) : undefined;
    user.password_hash = user.password ? bcrypt.hashSync(user.password, user.salt) : undefined;

    console.log(user.salt);
    const result = await db.query(
        `UPDATE users SET ${helper.setExisting(
            ["name", "email", "role", "password_hash", "salt"],
            [user.username, user.email, user.role, user.password_hash, user.salt]
        )} WHERE id=?`,
        [id]
    );

    if (result.affectedRows) {
        message = "User was successfully updated";
    } else {
        const error = Error("User was not found");
        error.code = "NOT_FOUND";
        return error;
    }

    return { message };
}

async function remove(id) {
    const result = await db.query(`DELETE FROM users WHERE id=?`, [id]);

    let message = "Error in deleting user";

    if (result.affectedRows) {
        message = "User deleted successfully";
    } else {
        const error = Error("User was not found");
        error.code = "NOT_FOUND";
        throw error;
    }

    return { message };
}

module.exports = {
    getMultiple,
    getByName,
    getById,
    create,
    updateChosen,
    remove,
};
