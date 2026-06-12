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
                // Derive id from possible column names and coerce to integer
                const rawId = soknad.idSoknad ?? soknad.id ?? soknad.ID ?? soknad["idSoknad"];
                const idToSend = Number(rawId);
                if (!rawId || !Number.isInteger(idToSend)) {
                    alert(`Ugyldig id for sletting: ${JSON.stringify(rawId)}`);
                    return;
                }

                const response = await fetch("/slett-soknad", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                        "X-Requested-With": "XMLHttpRequest" // mark as AJAX for middleware
                    },
                    body: new URLSearchParams({ id: String(idToSend) })
                });
                const result = await response.json().catch(() => null);
                if (!response.ok) {
                    const errMsg = result?.error || JSON.stringify(result) || await response.text();
                    alert(`Kunne ikke slette søknad: ${response.status} ${errMsg}`);
                    return;
                }
                if (result && result.success) {
                    tableR.remove();
                } else {
                    alert(`Sletting mislyktes: ${JSON.stringify(result)}`);
                }
            } catch (error) {
                alert(`Feil ved sletting: ${error.message}`);
            }
        });
        deleteSoknad.appendChild(del)

        tableR.append(n, t, s, deleteSoknad)
    });
}

hent()