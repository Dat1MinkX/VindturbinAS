import crypto from "crypto";
import { db } from "../db/database.js";

export function isAuthenticated(req, res, next) {
    if (req.session?.user) {
        return next();
    }

    const rawToken = req.cookies?.["remember"];
    if (!rawToken) {
        return res.redirect("/login");
    }

    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const sql = `
        SELECT Bruker.idUser, Bruker.Navn, LoginToken.ExpirationDate
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
            return res.redirect("/login");
        }

        // Fyller SessionUser-objektet
        req.session.user = {
            id: row.idUser,
            navn: row.Brukernavn,
        };
        return next();
    });
}
