/* header-footer-index.js
   Variant av header-footer for index-siden. Inneholder injeksjon av
   navigasjon og footer spesifikk for startsiden.
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
        <a href="/liste">Brukerliste</a>
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