const axios = require("axios");

const namaInput = document.querySelector("#nama");
const usernameInput = document.querySelector("#usernames");
const passwordInput = document.querySelector("#password");
const statusInput = document.querySelector("#status");
const form = document.querySelector("#updateForm");

const urlApi = "http://birrul:5000/api/vms/";
const dataToken = JSON.parse(localStorage.getItem("responseaData"));
const token = dataToken.access_token;
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
// tess

const btnSaveAddKaryawan = document.getElementById("userAdd");
btnSaveAddKaryawan?.addEventListener("submit", (event) => {
  event.preventDefault();
  const namaLengkap = document.getElementById("namaLengkap").value;
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  postUser(namaLengkap, username, password, status);
});

document.getElementById("filterInput").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();
  const table = document.getElementById("tableUser");
  const rows = table.getElementsByTagName("tr");

  // Iterate through each table row
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].getElementsByTagName("td");
    let rowMatch = false;

    // Iterate through each cell in the row
    for (let j = 0; j < cells.length; j++) {
      const cellText = cells[j].textContent || cells[j].innerText;
      if (cellText.toLowerCase().indexOf(value) > -1) {
        rowMatch = true;
        break;
      }
    }

    // Show or hide the row based on the filter value
    rows[i].style.display = rowMatch ? "" : "none";
  }
});

const postUser = async (namaLengkap, username, password) => {
  try {
    const data = {
      nama: namaLengkap,
      username: username,
      password: password,
    };
    console.log(data);

    const response = await axios.post(urlApi + "user/create", data, config);

    if (response.status === 201) {
      console.log(response);
      alert("SUCCESS");
      location.reload();
    }
    data;
  } catch (error) {
    alert(error.response.data.message);
  }
};
// tes end

// Fetch items and populate the table
async function fetchItems() {
  try {
    const response = await axios.get(urlApi + "user", config);
    const items = response.data.data;

    const tableBody = document.querySelector("#tableUser tbody");
    tableBody.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("tr");

      const indexCell = document.createElement("td");
      indexCell.textContent = index + 1; // Nomor urut dimulai dari 1
      row.appendChild(indexCell);

      const Nama = document.createElement("td");
      Nama.textContent = item.nama;
      row.appendChild(Nama);

      const username = document.createElement("td");
      username.textContent = item.username;
      row.appendChild(username);

      const status = document.createElement("td");
      status.textContent = item.status;
      row.appendChild(status);

      const actionsCell = document.createElement("td");
      const editButton = document.createElement("button");

      editButton.setAttribute("data-toggle", "modal");
      editButton.setAttribute("data-target", "#modalEdit");
      editButton.classList.add("btn", "bg-orange", "waves-effect");
      editButton.innerHTML =
        '<i class="material-icons">edit</i><span>EDIT</span>';

      editButton.addEventListener("click", () => {
        editItem(item.id);
      });
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("btn", "bg-red", "waves-effect");
      deleteButton.innerHTML =
        '<i class="material-icons">delete</i> <span>DELETE</span>';
      deleteButton.addEventListener("click", () => {
        deleteItem(item.id);
      });
      actionsCell.appendChild(deleteButton);

      row.appendChild(actionsCell);

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}

// Edit item
function editItem(itemId) {
  axios
    .get(urlApi + `user/${itemId}`, config)

    .then((response) => {
      const itemData = response.data.data;
      namaInput.value = itemData.nama;
      statusInput.value = itemData.status;
      usernameInput.value = itemData.username;
      passwordInput.value = itemData.password;

      console.log(itemData);
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        axios
          .patch(
            urlApi + `user/${itemId}`,
            {
              nama: namaInput.value,
              username: usernameInput.value,
              password: passwordInput.value,
              status: statusInput.value,
            },
            config
          )
          .then((response) => {
            alert(response.data.message + " Success");
            location.reload();
          })
          .catch((error) => {
            alert(error.response.data.message);
            console.log(response.data);
          });
      });
    })
    .catch((error) => {
      console.error("Error update data:", error);
    });
  console.log(itemId);
  console.log("Editing item with ID:", itemId);
}

// Delete item
function deleteItem(itemId) {
  const confirmed = confirm("Apa kamu yakin untuk menghapus data ini?");
  if (confirmed) {
    axios
      .delete(urlApi + `user/${itemId}`, config)
      .then((response) => {
        alert("Data berhasil di " + response.data.message);
        // alert(response.data.message);
        location.reload();
      })
      .catch((error) => {
        alert("Data " + error.response.data.message);
        console.error(error);
      });
  }
}

fetchItems();
