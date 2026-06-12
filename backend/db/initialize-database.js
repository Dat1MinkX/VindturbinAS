export const databaseSchema = `
    CREATE TABLE IF NOT EXISTS "Bruker" (
        "idUser" INTEGER PRIMARY KEY AUTOINCREMENT,
        "Brukernavn" TEXT NOT NULL UNIQUE,
        "Passord" TEXT,
        "Navn" TEXT,
        "Tlf" TEXT,
        "Rolle" TEXT
    );

    CREATE TABLE IF NOT EXISTS "LoginToken" (
        "Token" TEXT PRIMARY KEY,
        "idUser" INTEGER NOT NULL,
        "ExpirationDate" INTEGER NOT NULL,
        FOREIGN KEY ("idUser") REFERENCES "Bruker"("idUser") ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS "Kunder" (
        "idName" INTEGER PRIMARY KEY,
        "Name" TEXT,
        "Phone" TEXT,
        "Username" TEXT
    );

    CREATE TABLE IF NOT EXISTS "Soknad" (
        "idSoknad" INTEGER PRIMARY KEY,
        "idUser" INTEGER NOT NULL,
        "Navn" TEXT,
        "Tlf" TEXT,
        "Soknads-Tekst" TEXT,
        "om-deg" TEXT,
        FOREIGN KEY ("idUser") REFERENCES "Bruker"("idUser") ON DELETE CASCADE
    );


`;

export const defaultUser = {
    Brukernavn: "AdminAdmin",
    Passord: "nimda",
    Navn: "Person!",
    Tlf: "00000000",
    Rolle: "Admin",
};

export const defaultUsers = [
    {
        Navn: "Ola Nordmann",
        Brukernavn: "ola123",
        Passord: "1234",
        Tlf: "12345678",
        Rolle: "Elev"
    },
    {
        Navn: "Kari Lærer",
        Brukernavn: "kari99",
        Passord: "1234",
        Tlf: "87654321",
        Rolle: "Lærer"
    }
];