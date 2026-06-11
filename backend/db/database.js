// IKKE RØR DENNE FILEN!!!
import sqlite3 from "sqlite3";
import path from "path";
import bcrypt from "bcrypt";
import fs from "fs";

import {
    databaseSchema,
    defaultUser
} from "./initialize-database.js";

sqlite3.verbose();

const dbDir = path.join(process.cwd(), "databaser");
const dbPath = path.join(dbDir, "database.db");

if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("DB error:", err);
        return;
    }

    console.log("DB connected");

    db.run("PRAGMA foreign_keys = ON;");

    db.all("PRAGMA table_info('Soknad');", [], (err, rows) => {
        if (err) {
            console.error("Soknad schema check error:", err);
            return;
        }

        const existingColumns = new Set(rows.map(col => col.name));
        const missingColumns = [
            { name: 'idUser', sql: 'ALTER TABLE "Soknad" ADD COLUMN "idUser" INTEGER;' },
            { name: 'Navn', sql: 'ALTER TABLE "Soknad" ADD COLUMN "Navn" TEXT;' },
            { name: 'Tlf', sql: 'ALTER TABLE "Soknad" ADD COLUMN "Tlf" TEXT;' },
            { name: 'Soknads-Tekst', sql: 'ALTER TABLE "Soknad" ADD COLUMN "Soknads-Tekst" TEXT;' }
        ];

        missingColumns.forEach(column => {
            if (!existingColumns.has(column.name)) {
                db.run(column.sql, (alterErr) => {
                    if (alterErr) {
                        console.error(`Could not add ${column.name} to Soknad:`, alterErr);
                    } else {
                        console.log(`Added ${column.name} column to Soknad table.`);
                    }
                });
            }
        });
    });

    db.exec(databaseSchema, (err) => {
        if (err) {
            console.error("Schema error:", err);
            return;
        }

        createDefaultUser();
    });
});

async function createDefaultUser() {
    db.get(
        'SELECT * FROM "Bruker" WHERE "Brukernavn" = ?',
        [defaultUser.Brukernavn],
        async (err, row) => {
            if (err) {
                console.error("Default user lookup error:", err);
                return;
            }

            if (row) {
                return;
            }

            const userToInsert = {
                ...defaultUser,
                Passord: await bcrypt.hash(defaultUser.Passord, 10)
            };

            const columns = Object.keys(userToInsert);
            const values = Object.values(userToInsert);
            const placeholders = columns.map(() => "?").join(", ");

            db.run(
                `INSERT INTO "Bruker" (${columns.map(column => `"${column}"`).join(", ")}) VALUES (${placeholders})`,
                values,
                (insertErr) => {
                    if (insertErr) {
                        console.error("Default user creation error:", insertErr);
                    }
                }
            );
        }
    );
}