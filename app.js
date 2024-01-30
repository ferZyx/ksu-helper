import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import db from "./db/connection.js";
import router from "./router.js";
import config from "./config.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";
import log from "./logging/logging.js";
import {setupLoggingPathUpdate} from "./cron/loggingPathUpdate.js";
import {setupKsuReAuth} from "./cron/ksuReAuth.js";

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://tolyan.me');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
    const decodedUrl = decodeURIComponent(req.url);
    log.info(`${req.method} ${decodedUrl}`);
    next();
});
app.use('/express/api', router);
app.use(errorMiddleware);

const appStart = async () => {
    try {
        await db.connect(config.DB_URI);
        app.listen(config.PORT);
    } catch (e) {
        log.error("Ошибка при запуске ksu-helper" + e);
    }
    await setupLoggingPathUpdate();
    await setupKsuReAuth();
};

appStart().then(() =>
    log.info(`App has been ran! http://localhost:${config.PORT}`)
);
