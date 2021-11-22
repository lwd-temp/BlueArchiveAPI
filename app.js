(async function () {
    "use strict";

    await require("./modules");
    const subroutes = [
        "equipment",
        "stage",
    ];

    const port = 6556;
    const bodyParser = require("body-parser");

    const Express = require("express");
    require("express-async-errors");

    const app = Express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // robots.txt - disallow all
    app.get("/robots.txt", (req, res) => {
        res.type("text/plain");
        res.send("User-agent: *\nDisallow: /");
    });

    app.get("/", async (req, res) => {
        res.set("Content-Type", "application/json");
        res.status(200);
        res.send({
            status: 200,
            endpoints: subroutes
        })
    });

    for (const route of subroutes) {
        app.use(`/${route}`, require(`./routes/${route}`));
    }

    app.use(async (err, req, res, next) => {
        if (err instanceof URIError) {
            res.set("Content-Type", "application/json");
            res.status(400);
            res.send({
                status: 400,
                message: "Invalid URI"
            });
        }

        console.error("API Error", { err, req, res });
    });

    app.get("*", (req, res) => {
        res.status(404);
        res.send({
            status: 404,
            message: "Endpoint Does Not Exists"
        });
    });

    app.listen(port, () => console.log(`BlueArchive API Running on ${port}`));
})();