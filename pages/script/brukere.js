const list = document.getElementById("list");

let users = [];
let idCounter = 1;

// ADD USER
function addUser() {
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;
    const username = document.getElementById("username").value;

    if (!name || !phone || !username) return;

    const user = {
        id: idCounter++,
        name,
        phone,
        username
    };

    users.push(user);
    render();

    // reset input
    document.getElementById("name").value = "";
    document.getElementById("phone").value = "";
    document.getElementById("username").value = "";
}

// DELETE
function deleteUser(id) {
    users = users.filter(u => u.id !== id);
    render();
}

// RENDER
function render() {
    list.innerHTML = `
        <div class="row header">
            <div>ID</div>
            <div>Navn</div>
            <div>Tlf</div>
            <div>Brukernavn</div>
            <div></div>
        </div>
    `;

    users.forEach(u => {
        const row = document.createElement("div");
        row.className = "row";

        row.innerHTML = `
            <div>${u.id}</div>
            <div>${u.name}</div>
            <div>${u.phone}</div>
            <div>${u.username}</div>
            <div>
                <button onclick="deleteUser(${u.id})">Delete</button>
            </div>
        `;

        list.appendChild(row);
    });
}

// START (valgfri testdata)
render();