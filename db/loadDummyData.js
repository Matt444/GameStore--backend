const readline = require("readline");
const { GoogleSpreadsheet } = require("google-spreadsheet");

const creds = require("./client_secret");
const categories = require("../services/categories");
const platforms = require("../services/platforms");
const games = require("../services/games");
const users = require("../services/users");
const { exit } = require("process");

// Identifying which document we'll be accessing/reading from
// https://docs.google.com/spreadsheets/d/1_a0rRgdxeGWwZIQGD0vFMpWhC6bkeEJyLPkr_EJJPuw/edit?usp=sharing
const doc = new GoogleSpreadsheet("1_a0rRgdxeGWwZIQGD0vFMpWhC6bkeEJyLPkr_EJJPuw");

(async () => {
    await doc.useServiceAccountAuth(creds);

    await doc.loadInfo(); // loads document properties and worksheets
    console.log(doc.title);

    const gamesSheet = doc.sheetsByTitle["Games"]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
    const categoriesSheet = doc.sheetsByTitle["Categories"];
    const platformsSheet = doc.sheetsByTitle["Platforms"];

    console.log("-----ADDING CATEGORIES-----");
    let rows = await categoriesSheet.getRows();
    for (i = 0; ; i++) {
        const category = rows[i] ? rows[i]["Category"] : undefined;
        if (!category) break;
        console.log("Adding category: ", category);

        try {
            await categories.create({ name: category });
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                console.log("Category already exists");
            } else {
                console.log("Error while adding category: ", err);
            }
        }
    }

    console.log("-----ADDING PLATFORMS-----");
    rows = await platformsSheet.getRows();
    for (i = 0; ; i++) {
        const platform = rows[i] ? rows[i]["Platform"] : undefined;
        if (!platform) break;
        console.log("Adding platform: ", platform);

        try {
            await platforms.create({ name: platform });
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                console.log("Platform already exists");
            } else {
                console.log("Error while adding platform: ", err);
            }
        }
    }

    console.log("-----ADDING GAMES-----");
    rows = await gamesSheet.getRows();
    for (i = 0; ; i++) {
        const title = rows[i] ? rows[i]["Title"] : undefined;
        if (!title) break;
        const price = rows[i]["Price_num"];
        const platform = rows[i]["Platform_id"];
        const is_digital = rows[i]["is_digital"];
        const categories = rows[i]["Categories_id"];
        const age_category = rows[i]["age_category"];
        const imageURL = rows[i]["Image"];
        console.log("Adding game: ", title, price, platform, is_digital, categories, age_category);

        try {
            await games.create({
                name: title,
                price: price,
                quantity: Math.floor(Math.random() * 100),
                description:
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin aliquam ligula eu eros faucibus gravida.",
                release_date: "2021-03-11",
                is_digital: is_digital,
                age_category: age_category,
                platform_id: platform,
                categories_id: categories.split(","),
                image_url: imageURL,
            });
        } catch (err) {
            if (err.code === "ER_DUP_ENTRY") {
                console.log("Game already exists");
            } else {
                console.log("Error while adding game: ", err);
            }
        }
    }

    // Adding admin account
    console.log("-----ADDING USERS-----");
    console.log("Adding user: login: admin1, password: admin1");
    try {
        await users.create({
            username: "admin1",
            email: "admin@gmail.com",
            password: "admin1",
            role: "admin",
        });
    } catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            console.log("User already exists");
        } else {
            console.log("Error while adding user: ", err);
        }
    }

    exit();
})();
