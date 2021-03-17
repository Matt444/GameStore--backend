const mysql = require("mysql2/promise");
const config = require("../config");

async function query(sql, params) {
    const connection = await mysql.createConnection(config.db);
    const [results] = await connection.execute(sql, params);

    await connection.end();
    return results;
}

async function transaction(queries, queryValues) {
    if (queries.length !== queryValues.length) {
        return Promise.reject(
            "Number of provided queries did not match the number of provided query values arrays"
        );
    }
    const connection = await mysql.createConnection(config.db);
    try {
        await connection.beginTransaction();
        const queryPromises = [];

        queries.forEach((query, index) => {
            queryPromises.push(connection.query(query, queryValues[index]));
        });
        const results = await Promise.all(queryPromises);
        await connection.commit();
        await connection.end();
        return results;
    } catch (err) {
        await connection.rollback();
        await connection.end();
        return Promise.reject(err);
    }
}

module.exports = {
    query,
    transaction,
};
