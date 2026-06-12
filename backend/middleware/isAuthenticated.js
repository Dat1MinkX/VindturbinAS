import crypto from "crypto";
import { db } from "../db/database.js";

export function isAuthenticated(req, res, next) {
    if (req.session?.user) {
        return next();
    }

    // If no session user, try remember cookie. If neither, handle AJAX vs regular browser.
    const rawToken = req.cookies?.["remember"];
    if (!rawToken) {
        req.session.returnTo = req.originalUrl;
        // Detect AJAX/fetch by header and respond with JSON status instead of redirect
        const acceptsJson = req.headers["x-requested-with"] === "XMLHttpRequest" || (req.headers.accept || "").includes("application/json");
        if (acceptsJson) return res.status(401).json({ error: "Unauthorized" });
        return res.redirect("/login");
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const sql = `
        SELECT Bruker.idUser, Bruker.Navn, Bruker.Rolle, LoginToken.ExpirationDate
        FROM LoginToken
        JOIN Bruker ON LoginToken.idUser = Bruker.idUser
        WHERE LoginToken.Token = ?`;

    db.get(sql, [tokenHash], (err, row) => {
        if (err) {
            console.log("[isAuthenticated] DB error:", err);
        }
        if (err || !row || row.ExpirationDate < Date.now()) {
            if (!row) console.log("[isAuthenticated] No row found for token.");
            if (row && row.ExpirationDate < Date.now()) console.log("[isAuthenticated] Token expired:", row.ExpirationDate, "Current:", Date.now());
            req.session.returnTo = req.originalUrl;
            const acceptsJson = req.headers["x-requested-with"] === "XMLHttpRequest" || (req.headers.accept || "").includes("application/json");
            if (acceptsJson) return res.status(401).json({ error: "Unauthorized" });
            return res.redirect("/login");
        }

        // Fyller SessionUser-objektet
        req.session.user = {
            id: row.idUser,
            navn: row.Navn,
            rolle: row.Rolle,
        };
        return next();
    });
}
