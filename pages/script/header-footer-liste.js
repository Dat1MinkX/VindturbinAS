const body = document.body;
/* header-footer copy.js
    Kopi av header-footer som noen sider fortsatt bruker. Inneholder
    samme logikk for injeksjon av header og footer.
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