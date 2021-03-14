const db = require("./db");
const config = require("../config");

async function getMultiple() {
    const data = await db.query(`SELECT id, name FROM categories`, []);

    return data;
}

async function create(category) {
    const result = await db.query(`INSERT INTO categories (name) VALUES (?)`, [category.name]);

    let message = "Error in creating category";

    if (result.affectedRows) {
        message = "Category was successfully created";
    }

    return { message };
}

async function update(id, category) {
    const result = await db.query(`UPDATE categories SET name=? WHERE id=?`, [category.name, id]);

    if (result.affectedRows) {
        return { message: "Category was successfully updated" };
    } else {
        const error = Error("Category was not found");
        error.code = "NOT_FOUND";
        throw error;
    }
}

async function remove(id) {
    const queries = [
        `DELETE FROM games_categories WHERE category_id=?`,
        `DELETE FROM categories WHERE id=?`,
    ];
    const queryValues = [[id], [id]];

    const result = await db.transaction(queries, queryValues);

    if (result[1] && result[1][0].affectedRows) {
        return { message: "Category was deleted successfully" };
    } else {
        const error = Error("Category was not found");
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
