

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
        del.type = "submit"
        del.innerText = "Slett"
        deleteUser.appendChild(f)
        
        const hiddenInput = document.createElement('input');
        hiddenInput.type = 'hidden';
        hiddenInput.name = 'username';
        hiddenInput.value = user.Brukernavn;
        f.append(del, hiddenInput)

        const editTd = document.createElement("td")
        const editBtn = document.createElement("button")
        editBtn.type = "button"
        editBtn.innerText = "Rediger"
        editBtn.addEventListener("click", () => {
            document.querySelector('input[name="name"]').value = user.Navn;
            document.querySelector('input[name="phone"]').value = user.Tlf;
            document.querySelector('input[name="username"]').value = user.Brukernavn;
            document.querySelector('#role').value = user.Rolle || 'Bruker';
            document.querySelector('#originalUsername').value = user.Brukernavn;
            document.querySelector('#userControls button[type="submit"]').innerText = 'Oppdater';
        });
        editTd.appendChild(editBtn)

        tableR.append(n, t, b, editTd, deleteUser)
    });
}

hent()