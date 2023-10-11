const axios = require("axios");

const namaInput = document.querySelector("#namaInput");
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

const btnSaveAddKaryawan = document.getElementById("MaterialAdd");
btnSaveAddKaryawan?.addEventListener("submit", (event) => {
  event.preventDefault();
  const idTypeBarang = document.getElementById("dropDownTypeBarang").value;
  const namaBarang = document.getElementById("namaBarang").value;

  postTypeMat(idTypeBarang, namaBarang);
});

document.getElementById("filterInput").addEventListener("keyup", function () {
  const value = this.value.toLowerCase();
  const table = document.getElementById("tableMaterial");
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

const postTypeMat = async (idTypeBarang, namaBarang) => {
  try {
    const data = {
      idTypeBarang: idTypeBarang,
      nama: namaBarang,
    };
    console.log(data);

    const response = await axios.post(
      urlApi + "master/create/barang",
      data,
      config
    );

    if (response.status === 201) {
      // console.log(response);
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
    const response = await axios.get(urlApi + "master/admin/barang", config);
    const items = response.data.data;

    const tableBody = document.querySelector("#tableMaterial tbody");
    // tableBody.classList.add('DataTables_Table_0');
    tableBody.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("tr");

      const indexCell = document.createElement("td");
      indexCell.textContent = index + 1; // Nomor urut dimulai dari 1
      row.appendChild(indexCell);

      const TypeMaterial = document.createElement("td");
      TypeMaterial.textContent = item.typeBarang;
      row.appendChild(TypeMaterial);

      const namaMaterial = document.createElement("td");
      namaMaterial.textContent = item.barang;
      row.appendChild(namaMaterial);

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
    .get(urlApi + `master/barang/${itemId}`, config)

    .then((response) => {
      const itemData = response.data.data;
      dropdown1.value = itemData.idTypeBarang;
      namaInput.value = itemData.nama;
      // console.log(dropdown.value);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        axios
          .patch(
            urlApi + `master/update/barang/${itemId}`,
            {
              idTypeBarang: dropdown1.value,
              nama: namaInput.value,
              status: 1,
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
      .delete(urlApi + `master/delete/barang/${itemId}`, config)
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

const dropdown = document.getElementById("dropDownTypeBarang");
// dropdown.classList.add('form-control', 'show-tick');
axios
  .get(urlApi + "master/type/barang", config)
  .then((response) => {
    response.data.data.forEach((itemDrop) => {
      const option = document.createElement("option");
      option.value = itemDrop.id;
      option.textContent = itemDrop.nama;
      dropdown.appendChild(option);
      //  console.log(itemDrop.nama);
    });
  })

  .catch((error) => {
    error;
  });

const dropdown1 = document.getElementById("dropDownTypeBarangE");
// dropdown.classList.add('form-control', 'show-tick');
axios
  .get(urlApi + "master/type/barang", config)
  .then((response) => {
    response.data.data.forEach((itemDrop) => {
      const option = document.createElement("option");
      option.value = itemDrop.id;
      option.textContent = itemDrop.nama;
      dropdown1.appendChild(option);
      //  console.log(itemDrop.nama);
    });
  })

  .catch((error) => {
    error;
  });
