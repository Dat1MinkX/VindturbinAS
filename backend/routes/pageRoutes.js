/*
    backend/routes/pageRoutes.js
    - Definerer side-ruter og enklere API-endepunkter knyttet til sider.
    - Server statiske sider fra `pages/public` og beskytter enkelte ruter
        med `isAuthenticated` middleware.
    - Inneholder endepunkter for å hente og endre brukere og søknader
        (f.eks. `/hent-brukere`, `/legg-til`, `/slett`, `/hent-soknader`,
        `/slett-soknad`, og `POST /soknad`).
    Kort og konsist kommentar forklarer hensikten med denne filen.
*/
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

pageRouter.get("/brukere", (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/bruker-profil.html"));
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

pageRouter.get("/soknad", isAuthenticated, (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/Soknad.html"));
});

pageRouter.get("/user", isAuthenticated, (_req, res) => {
    res.sendFile(path.join(process.cwd(), "pages/public/bruker-profil.html"));
});

pageRouter.post("/soknad", isAuthenticated, (req, res) => {
    const { navn, tlf, soknadstekst } = req.body ?? {};
    const idUser = req.session.user.id;

    if (!navn || !tlf || !soknadstekst) {
        return res.redirect("/soknad?q=Mangler+felt");
    }

    db.run(
        'INSERT INTO "Soknad" ("idUser", "Navn", "Tlf", "Soknads-Tekst") VALUES (?, ?, ?, ?)',
        [idUser, navn, tlf, soknadstekst],
        (err) => {
            if (err) {
                console.error("Feil ved lagring av søknad:", err);
                return res.redirect("/soknad?q=Feil+ved+lagring");
            }
            res.redirect("/sendt");
        }
    );
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

pageRouter.get("/hent-soknader", isAuthenticated, (req, res) => {
    const idUser = req.session.user.id;
    db.all('SELECT rowid, * FROM "Soknad" WHERE "idUser" = ?', [idUser], (err, rows) => {
        if (err) {
            console.error("Feil ved henting av søknader:", err);
            return res.status(500).json({ error: "Kunne ikke hente søknader" });
        }

        // Normalize each row so client always receives a numeric `idSoknad` field.
        const normalized = (rows || []).map(r => {
            const idVal = r.idSoknad ?? r.id ?? r.rowid ?? null;
            return { ...r, idSoknad: Number.isInteger(idVal) ? idVal : (idVal ? Number(idVal) : null) };
        });

        console.log(`Returnerer ${normalized.length} soknader for bruker=${idUser}:`, normalized);
        res.json(normalized);
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

pageRouter.post("/slett-soknad", isAuthenticated, (req, res) => {
    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: "Mangler id" });
    }

    const numericId = Number(id);
    if (!Number.isInteger(numericId)) {
        console.log(`Ugyldig id for sletting: ${id}`);
        return res.status(400).json({ error: "Ugyldig id" });
    }

    console.log(`Slett søknad forespørsel for id=${numericId}, bruker=${req.session?.user?.id}`);
    db.get('SELECT * FROM "Soknad" WHERE "idSoknad" = ?', [numericId], (getErr, row) => {
        if (getErr) {
            console.error("Feil ved lookup før sletting:", getErr);
            return res.status(500).json({ error: "Feil ved sletting" });
        }
        console.log("Rad før sletting:", row);

        // Try deleting by idSoknad, but fall back to rowid if idSoknad is NULL
        db.run('DELETE FROM "Soknad" WHERE COALESCE("idSoknad", rowid) = ?', [numericId], function (err) {
            if (err) {
                console.error("Feil ved sletting av søknad:", err);
                return res.status(500).json({ error: "Feil ved sletting" });
            }

            console.log(`Slettet rader: ${this.changes}`);
            if (this.changes === 0) {
                return res.status(404).json({ error: "Søknad ikke funnet" });
            }

            return res.json({ success: true });
        });
    });
});