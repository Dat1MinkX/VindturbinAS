/* hent soknad.js (duplicate filename with space)
    Legacy copy — samme som hent-soknad.js. Henter og renderer søknader
    for brukeren. Kan trygt bli konsolidert til én fil (hent-soknad.js).
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

        const g = document.createElement("td")
        g.innerText = soknad["om-deg"]

        const deleteSoknad = document.createElement("td")
        const f = document.createElement("form")
        f.method = "POST"
        f.action = "/slett-soknad"
        const del = document.createElement("button")
        del.type = "submit"
        del.innerText = "Slett"
        deleteSoknad.appendChild(f)
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'id';
        hiddenInput.value = soknad.idSoknad;
        hiddenInput.value = soknad.om-deg;
        f.append(del, hiddenInput)

        tableR.append(n, t, s, g, deleteSoknad)
    });
}

hent()