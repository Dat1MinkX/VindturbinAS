/* header-footer.js
   Setter opp felles header og footer i klienten. Brukes av flere sider
   for å holde UI-konsistens. Scriptet injiserer HTML og eventuelle handlers.
*/

const body = document.body;
const header = document.createElement("header");
header.className = "site-header";
body.prepend(header);

header.innerHTML = `
    <div class="site-brand">
        <a href="/">VindturbinAS</a>
    </div>
    <nav class="site-nav">
        <a href="/">Hjem</a>
        <a href="/liste">Brukerliste</a>
        <a href="/profil">Profil</a>
        <a href="/login">Logg inn</a>
        <a href="/Sendt">Sendte søknader</a>
    </nav>
`

const footer = document.createElement("footer");
footer.className = "site-footer";
body.appendChild(footer);

footer.innerHTML = `
    <div class="footer-inner">
        <p>© 2026 VindturbinAS</p>
        <p>Felles header og footer</p>
    </div>
`