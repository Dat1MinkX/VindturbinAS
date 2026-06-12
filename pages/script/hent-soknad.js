/* hent-soknad.js
    Henter innsendte søknader for innlogget bruker fra `/hent-soknader`.
    Renderer søknader i en tabell og gir mulighet til å slette en søknad
    ved å sende POST til `/slett-soknad`.
*/

async function hent() {
    const table = document.getElementById("soknad-liste")
    const data = await fetch("/hent-soknader")
    const soknader = await data.json();
    
    soknader.forEach(soknad => {
        const tableR = document.createElement("tr")
        table.appendChild(tableR)

        const n = document.createElement("td")
        n.innerText = soknad.Navn
        const t = document.createElement("td")
        t.innerText = soknad.Tlf
        
        const s = document.createElement("td")
        s.innerText = soknad["Soknads-Tekst"]

        const deleteSoknad = document.createElement("td")
        const del = document.createElement("button")
        del.type = "button"
        del.innerText = "Slett"
        del.addEventListener("click", async () => {
            try {
                const response = await fetch("/slett-soknad", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
                    body: new URLSearchParams({ id: soknad.idSoknad })
                });
                if (!response.ok) {
                    const text = await response.text();
                    alert(`Kunne ikke slette søknad: ${response.status} ${text}`);
                    return;
                }
                tableR.remove();
            } catch (error) {
                alert(`Feil ved sletting: ${error.message}`);
            }
        });
        deleteSoknad.appendChild(del)

        tableR.append(n, t, s, deleteSoknad)
    });
}

hent()