const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 3000;
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const categories = require("./routes/categories");
const platforms = require("./routes/platforms");
const users = require("./routes/users");
const keys = require("./routes/keys");
const games = require("./routes/games");
const auth = require("./routes/auth");
const orders = require("./routes/orders");

const swaggerOptions = {
    swaggerDefinition: {
        openapi: "3.0.0",
        info: {
            title: "GameStore REST API",
            version: "1.0.0",
            description: "Store API with 2 levels of authorization - user and admin.",
            contact: {
                name: "Mateusz Joniec",
                email: "mjoniec@protonmail.com",
            },
            servers: ["http://localhost:3000"],
        },
    },
    apis: ["./routes/*.js", "server.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

//Routes

app.get("/", (req, res) => {
    res.json({ message: "ok" });
});

app.use("/categories", categories);

app.use("/platforms", platforms);

app.use("/users", users);

app.use("/keys", keys);

app.use("/games", games);

app.use("/auth", auth);

app.use("/orders", orders);

/* Error handler middleware */
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    console.error(err.message, err.stack);
    res.status(statusCode).json({ message: err.message });

    return;
});

app.listen(port, () => {
    console.log(`Server app listening at http://localhost:${port}`);
    console.log("API Documentation available at: /api-docs");
});
