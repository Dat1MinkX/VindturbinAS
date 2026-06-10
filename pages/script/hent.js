

async function hent() {
    const table = document.getElementById("bruker-liste")
    const data = await fetch("/hent-brukere")
    const users = await data.json();
    users.forEach(user => {
        const tableR = document.createElement("tr")
        table.appendChild(tableR)

        const n = document.createElement("td")
        n.innerText = user.Navn
        const t = document.createElement("td")
        t.innerText = user.Tlf
        const b = document.createElement("td")
        b.innerText = user.Brukernavn

        const deleteUser = document.createElement("td")
        const f = document.createElement("form")
        f.method = "POST"
        f.action = "/slett"
        const del = document.createElement("button")
        del.innerText = "Slett"
        deleteUser.appendChild(f)
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'username';  
        hiddenInput.value = user.Navn;
        f.append(del, hiddenInput)



        tableR.append(n, t, b, deleteUser)
    });
}

hent()