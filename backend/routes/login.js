/*
    backend/routes/login.js
    - Håndterer innloggingsrelaterte ruter og autentisering.
    - `GET /login` serverer innloggingssiden.
    - `POST /login` verifiserer brukernavn/passord, oppretter session
        og setter et 'remember' cookie ved behov.
    - Bruker `bcrypt` for passord-sammenligning og lagrer en token-hash i DB
        for 'remember'-funksjonalitet.
*/
import { Router } from "express"; // Import Router for creating route handler
import bcrypt from "bcrypt"; // Import bcrypt for password hashing/comparison
import crypto from "crypto"; // Import crypto for token generation and hashing
import path from "path"; // Import path to resolve file paths
import { db } from "../db/database.js"; // Import shared sqlite db connection

export const loginRouter = Router(); // Create and export the login router


// --- Login-side ---
loginRouter.get("/login", (_, res) => { // GET /login -> serve login page
    res.sendFile(path.join(process.cwd(), "pages/public/login.html")); // Send login.html file
});

// --- Login POST ---
loginRouter.post("/login", (req, res) => { // POST /login -> authenticate user
    const { brukernavn, passord } = req.body; // Extract username and password from form body
    const sql = `SELECT * FROM Bruker WHERE Brukernavn = ?`; // SQL to find user by brukernavn

    db.get(sql, [brukernavn], (err, row) => { // Query DB for user
        if (err) { // DB error
            res.status(500).send("Databasefeil") // Respond 500 on DB error
            return; // Stop execution
        }
        if (!row) return res.status(401).send("Ugyldig brukernavn eller passord"); // No user found

        bcrypt.compare(passord, row.Passord, (error, same) => { // Compare provided password with stored hash
            if (error) { // bcrypt error
                res.status(500).send("Feil ved hashing"); // Send 500
                return; // Stop
            }
            if (!same) { // Passwords don't match
                res.status(401).send("Feil passord"); // Unauthorized
                return; // Stop
            }

            req.session.user = { // Set session user object on successful login
                id: row.idUser, // User id from DB
                navn: row.Navn, // User display name
                rolle: row.Rolle // User role (Admin/Bruker)
            };

            const rawToken = crypto.randomBytes(32).toString("hex"); // Generate raw random token
            const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex"); // Hash token for DB storage

            res.cookie("remember", rawToken, { // Set 'remember' cookie with raw token
                httpOnly: true, // HTTP only for security
                maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days in ms
            });

            const expires = Date.now() + 1000 * 60 * 60 * 24 * 14; // Compute expiration timestamp
            db.run("INSERT INTO LoginToken (Token, idUser, ExpirationDate) VALUES (?, ?, ?)", [tokenHash, row.idUser, expires]); // Store hashed token in DB

            const redirectUrl = req.session.returnTo || (row.Rolle === "Admin" ? "/home" : "/Soknad"); // Determine post-login redirect
            delete req.session.returnTo; // Clean up returnTo from session
            res.redirect(redirectUrl); // Redirect user
        });
        return; // End db.get callback flow
    });
});

loginRouter.get("/opprett-bruker", (_, res) => { // GET /opprett-bruker -> serve new user page
    res.sendFile(path.join(process.cwd(), "pages/public/newUser.html")); // Send newUser.html
});

loginRouter.post("/ny-bruker", async (req, res) => { // POST /ny-bruker -> create new user

    const { navn, brukernavn, passord } = req.body; // Extract fields from body

    if (!navn || !passord) { // Validate required fields
        return res.redirect("/login?q=Mangler+felt"); // Redirect if missing
    }

    db.get("SELECT * FROM Bruker WHERE Brukernavn = ?", [brukernavn], async (_err, row) => { // Check if brukernavn exists
        if (row) return res.redirect("/login?q=Eksisterer+allerede"); // If exists, redirect with message

        const hash = await bcrypt.hash(passord, 10); // Hash the provided password
        db.run(
            "INSERT INTO Bruker (Navn, Brukernavn, Passord) VALUES (?, ?, ?)",
            [navn, brukernavn, hash], // Insert new user with hashed password
            (err) => {
                if (err) { // Handle insertion error
                    console.log(err)
                    return res.redirect("/login?q=Feil+ved+opprettelse") // Redirect on error
                };
                res.redirect("/login?q=Bruker+opprettet"); // Redirect on success
            }
        );
    });
});

// --- Logout ---
loginRouter.get("/logout", (req, res) => { // GET /logout -> log the user out
    const token = req.cookies?.["remember"]; // Read remember cookie if present
    if (token) { // If token exists, remove its hash from DB
        const tokenHash = crypto.createHash("sha256").update(token).digest("hex"); // Hash token to match DB
        db.run("DELETE FROM LoginToken WHERE Token = ?", [tokenHash]); // Delete token entry
    }
    res.clearCookie("remember"); // Clear cookie on client
    req.session.destroy(() => { // Destroy server-side session
        res.redirect("/login"); // Redirect to login page
    });
});