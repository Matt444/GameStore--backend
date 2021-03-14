const mysql = require("mysql2/promise");

const setIfExists = (paramName, paramValue) => {
    return paramValue ? `${paramName}=${mysql.escape(paramValue)} ` : undefined;
};

const setExisting = (paramsTable, paramsValues) => {
    let arr = [];
    paramsValues.map((v, index) => {
        const res = setIfExists(paramsTable[index], v);
        if (res) arr = [...arr, res];
    });
    return arr;
};

module.exports = {
    setExisting,
};
