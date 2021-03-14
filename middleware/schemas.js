const Joi = require("joi");

const schemas = {
    categoryPOST: Joi.object().keys({
        name: Joi.string().min(1).max(45).required(),
    }),
    platformPOST: Joi.object().keys({
        name: Joi.string().min(1).max(45).required(),
    }),
    userPOST: Joi.object().keys({
        name: Joi.string().min(1).max(15).required(),
        email: Joi.string().email().required(),
        role: Joi.string().min(1).max(10).required(),
        password: Joi.string().min(6).max(20).required(),
    }),
    userPATCH: Joi.object().keys({
        name: Joi.string().min(1).max(15),
        email: Joi.string().email(),
        role: Joi.string().min(1).max(10),
        password: Joi.string().min(6).max(20),
    }),
    userLoggedUserPATCH: Joi.object().keys({
        name: Joi.string().min(1).max(15),
        email: Joi.string().email(),
        password: Joi.string().min(6).max(20),
    }),
    keyPOST: Joi.object().keys({
        game_id: Joi.number().required(),
        used: Joi.string().valid("0"),
        gkey: Joi.string().required(),
    }),
    gamePOST: Joi.object().keys({
        name: Joi.string().min(2).max(45).required(),
        price: Joi.number().required(),
        quantity: Joi.number().required(),
        description: Joi.string().max(500).required(),
        release_date: Joi.string().required(),
        is_digital: Joi.number().required(),
        age_category: Joi.string().required(),
        platform_id: Joi.number().required(),
        categories_id: Joi.array().required(),
    }),
    gamePOST_SEARCH: Joi.object().keys({
        name: Joi.string().allow("").max(45),
        is_digital: Joi.array(),
        age_categories: Joi.array(),
        platforms_id: Joi.array(),
        categories_id: Joi.array(),
    }),
    gamePATCH: Joi.object().keys({
        name: Joi.string().min(2).max(45),
        price: Joi.number(),
        quantity: Joi.number(),
        description: Joi.string().max(500),
        release_date: Joi.string(),
        is_digital: Joi.number(),
        age_category: Joi.string(),
        platform_id: Joi.number(),
        categories_id: Joi.array(),
    }),
    authRegisterPOST: Joi.object().keys({
        username: Joi.string().min(1).max(15).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).max(20).required(),
    }),
    authLoginPOST: Joi.object().keys({
        username: Joi.string().min(1).max(15).required(),
        password: Joi.string().min(6).max(20).required(),
    }),
    ordersPOST: Joi.array().items(
        Joi.object().keys({
            game_id: Joi.number().required(),
            quantity: Joi.number().min(1).required(),
        })
    ),
};
module.exports = schemas;
