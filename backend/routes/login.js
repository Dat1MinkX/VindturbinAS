import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import path from "path";
import { db } from "../db/database.js";

export const loginRouter = Router();


// --- Login-side ---
loginRouter.get("/login", (_, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/login.html"));
});

// --- Login POST ---
loginRouter.post("/login", (req, res) => {
    const { brukernavn, passord } = req.body;
    const sql = `SELECT * FROM Bruker WHERE Brukernavn = ?`;

    db.get(sql, [brukernavn], (err, row) => {
        if (err) {
            res.status(500).send("Databasefeil")
            return;
        }
        if (!row) return res.status(401).send("Ugyldig brukernavn eller passord");

        bcrypt.compare(passord, row.Passord, (error, same) => {
            if (error) {
                res.status(500).send("Feil ved hashing");
                return;
            }
            if (!same) {
                res.status(401).send("Feil passord");
                return;
            }

            req.session.user = {
                id: row.idUser,
                navn: row.Navn,
                rolle: row.Rolle
            };

            const rawToken = crypto.randomBytes(32).toString("hex");
            const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

            res.cookie("remember", rawToken, {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 14
            });

            const expires = Date.now() + 1000 * 60 * 60 * 24 * 14;
            db.run("INSERT INTO LoginToken (Token, idUser, ExpirationDate) VALUES (?, ?, ?)", [tokenHash, row.idUser, expires]);

            const redirectUrl = req.session.returnTo || (row.Rolle === "Admin" ? "/home" : "/Soknad");
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        });
        return;
    });
});

loginRouter.get("/opprett-bruker", (_, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/newUser.html"));
});

loginRouter.post("/ny-bruker", async (req, res) => {

    const { navn, brukernavn, passord } = req.body;

    if (!navn || !passord) {
        return res.redirect("/login?q=Mangler+felt");
    }

    db.get("SELECT * FROM Bruker WHERE Brukernavn = ?", [brukernavn], async (_err, row) => {
        if (row) return res.redirect("/login?q=Eksisterer+allerede");

        const hash = await bcrypt.hash(passord, 10);
        db.run(
            "INSERT INTO Bruker (Navn, Brukernavn, Passord) VALUES (?, ?, ?)",
            [navn, brukernavn, hash],
            (err) => {
                if (err) {
                    console.log(err)
                    return res.redirect("/login?q=Feil+ved+opprettelse")
                };
                res.redirect("/login?q=Bruker+opprettet");
            }
        );
    });
});

// --- Logout ---
loginRouter.get("/logout", (req, res) => {
    const token = req.cookies?.["remember"];
    if (token) {
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
        db.run("DELETE FROM LoginToken WHERE Token = ?", [tokenHash]);
    }
    res.clearCookie("remember");
    req.session.destroy(() => {
        res.redirect("/login");
    });
});