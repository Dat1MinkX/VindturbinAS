import { Router } from "express";
export const pageRouter = Router();
import { isAuthenticated } from "../middleware/isAuthenticated.js";
import path from "path";
import { db } from "../db/database.js";

pageRouter.get("/", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/index.html"));
});

pageRouter.get("/profile", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/profil.html"));
});

pageRouter.get("/liste", isAuthenticated, (req, res) => {
    if (req.session?.user?.rolle !== "Admin") {
        return res.redirect("/Admin?q=Ingen+tilgang");
    }
    res.sendFile(path.join(process.cwd(), "pages/public/liste.html"));
});

pageRouter.get("/Admin", (req, res) => {
    req.session.returnTo = "/";
    res.sendFile(path.join(process.cwd(), "pages/public/Admin.html"));
});

pageRouter.get("/login", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/login.html"));
});

pageRouter.get("/Soknad", isAuthenticated, (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/Soknad.html"));
});

pageRouter.get("/newUser", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/newUser.html"));
});

pageRouter.get("/sendt", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/Sendt.html"));
});

pageRouter.post("/admin-ny-bruker", (_req, res) => {

    const { name, phone, username } = _req.body

    if (!name || !username || !phone) {
        return res.redirect("/liste?q=Mangler+felt");
    }

    db.get("SELECT * FROM Kunder WHERE Username = ?", [username], async (_err, row) => {
        if (row) return res.redirect("/login?q=Eksisterer+allerede");

        db.run(
            "INSERT INTO Kunder (Name, Phone, Username) VALUES (?, ?, ?)",
            [name, phone, username],
            (err) => {
                if (err) {
                    console.log(err)
                    return res.redirect("/login?q=Feil+ved+opprettelse")
                };
                res.redirect("/liste?q=Bruker+opprettet");
            }
        );
    });


    res.redirect("/liste");
})



pageRouter.post("/legg-til", async (req, res) => {

    const { name, phone, username, role, originalUsername } = req.body;
    const userRole = role || "Bruker";

    if (!name || !username) {
        return res.redirect("/liste?q=Mangler+felt");
    }

    if (originalUsername) {
        db.run(
            "UPDATE Bruker SET Navn = ?, TLF = ?, Brukernavn = ?, Rolle = ? WHERE Brukernavn = ?",
            [name, phone, username, userRole, originalUsername],
            function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/liste?q=Feil+ved+oppdatering");
                }
                if (this.changes === 0) {
                    return res.redirect("/liste?q=Bruker+ikke+funnet");
                }
                res.redirect("/liste?q=Bruker+oppdatert");
            }
        );
        return;
    }

    db.get("SELECT * FROM Bruker WHERE Brukernavn = ?", [username], async (_err, row) => {
        if (row) return res.redirect("/liste?q=Eksisterer+allerede");
        db.run(
            "INSERT INTO Bruker (Navn, TLF, Brukernavn, Rolle) VALUES (?, ?, ?, ?)",
            [name, phone, username, userRole],
            (err) => {
                if (err) {
                    console.log(err)
                    return res.redirect("/liste?q=Feil+ved+opprettelse" + err)
                };
                res.redirect("/liste?q=Bruker+lagt+til");
            }
        );
    });
});

pageRouter.get("/hent-brukere", (req, res) => {
    db.all("SELECT * FROM Bruker", [], (err, rows) => {
        if (err) {
            console.error("Feil ved henting av data:", err);
            // Hvis du har en feilside, kan du redirecte dit i stedet
            return res.status(500).json({ error: "Kunne ikke hente brukere" });
        }

        res.json(rows);
    });
});

pageRouter.post("/slett", (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.redirect("/liste?q=Mangler+brukernavn");
    }

    db.run("DELETE FROM Bruker WHERE Brukernavn = ?", [username], function (err) {
        if (err) {
            console.error("Feil ved sletting:", err);
            return res.redirect("/liste?q=Feil+ved+sletting");
        }

        // 'this.changes' forteller hvor mange rader som ble påvirket (slettet)
        if (this.changes === 0) {
            return res.redirect("/liste?q=Bruker+ikke+funnet");
        }

        res.redirect("/liste?q=Bruker+slettet");
    });
});