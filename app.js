import express from "express";
import session from "express-session";
import path from "path";
import http from "http";
import cookieParser from "cookie-parser";
import { loginRouter } from "./backend/routes/login.js";
import { pageRouter } from "./backend/routes/pageRoutes.js";

export const app = express();
const port = 3000;
const server = http.createServer(app);

app.use(cookieParser());
app.use(session({
    secret: "NyHeMEliGhet!",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

app.use("/style", express.static(path.join(process.cwd(), "pages/style")));
app.use("/script", express.static(path.join(process.cwd(), "pages/script")));
app.use("/icon", express.static(path.join(process.cwd(), "pages/icon")));
app.use("/image", express.static(path.join(process.cwd(), "pages/image")));
app.use(express.urlencoded({ extended: true }));

app.use(loginRouter);
app.use(pageRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).send("Internal server error");
});

server.listen(port, () => {
    console.log(`Server kjører på http://localhost:${port}`);
});
