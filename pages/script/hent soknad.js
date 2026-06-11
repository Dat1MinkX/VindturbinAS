async function hent() {
    const table = document.getElementById("soknad-liste") // 1. Endret ID til tabellen
    const data = await fetch("/hent-soknader") // 2. Endret til riktig URL
    const soknader = await data.json(); // 3. Endret navn på variabelen
    
    soknader.forEach(soknad => { // 4. 'user' byttet til 'soknad'
        const tableR = document.createElement("tr")
        table.appendChild(tableR)

        const n = document.createElement("td")
        n.innerText = soknad.Navn
        const t = document.createElement("td")
        t.innerText = soknad.Tlf
        
        const b = document.createElement("td")
        b.innerText = soknad.Soknadstekst // 5. Byttet ut Brukernavn med Søknadstekst

        const deleteUser = document.createElement("td")
        const f = document.createElement("form")
        f.method = "POST"
        f.action = "/slett-soknad" // 6. URL for å slette
        const del = document.createElement("button")
        del.type = "submit"
        del.innerText = "Slett"
        deleteUser.appendChild(f)
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'soknadId'; // 7. Endret fra username til id
        hiddenInput.value = soknad.id;
        f.append(del, hiddenInput)

        const editTd = document.createElement("td")
        const editBtn = document.createElement("button")
        editBtn.type = "button"
        editBtn.innerText = "Rediger"
        editBtn.addEventListener("click", () => {
            // 8. Oppdatert feltene som skal fylles ut når man trykker rediger
            document.querySelector('input[name="navn"]').value = soknad.Navn;
            document.querySelector('input[name="tlf"]').value = soknad.Tlf;
            document.querySelector('textarea[name="soknadstekst"]').value = soknad.Soknadstekst;
            document.querySelector('#originalSoknadId').value = soknad.id;
            document.querySelector('#userControls button[type="submit"]').innerText = 'Oppdater';
        });
        editTd.appendChild(editBtn)

        tableR.append(n, t, b, editTd, deleteUser)
    });
}

hent()