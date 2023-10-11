// const axios = require("axios");

const form = document.querySelector("#updateForm");
const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");
const searchTermInput = document.querySelector("#searchTerm");
// const limitInput = document.querySelector("#limit");

const urlApi = "http://birrul:5000/api/vms/";
const dataToken = JSON.parse(localStorage.getItem("responseaData"));
const token = dataToken.access_token;
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

// Fetch items and populate the table
async function fetchItems() {
  try {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const searchTerm = searchTermInput.value;
    // const limit = limitInput.value;
    const pageNumber = 1;
    const response = await axios.get(
      urlApi +
        `barang?currentPage=${pageNumber}&limit=10&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}`,
      config
    );
    const items = response.data.data;

    const tableBody = document.querySelector("#itemTable tbody");
    tableBody.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("tr");

      const indexCell = document.createElement("td");
      indexCell.textContent = index + 1; // Nomor urut dimulai dari 1
      row.appendChild(indexCell);

      const Nama = document.createElement("td");
      Nama.textContent = item.namaLengkap;
      row.appendChild(Nama);

      const Nik = document.createElement("td");
      Nik.textContent = item.nik;
      row.appendChild(Nik);

      const NamaInstansi = document.createElement("td");
      NamaInstansi.textContent = item.namaInstansi;
      row.appendChild(NamaInstansi);

      const NamaBarang = document.createElement("td");
      NamaBarang.textContent = item.barang;
      row.appendChild(NamaBarang);

      const NamaKios = document.createElement("td");
      NamaKios.textContent = item.kios;
      row.appendChild(NamaKios);

      const NamaKendaraan = document.createElement("td");
      NamaKendaraan.textContent = item.kendaraan;
      row.appendChild(NamaKendaraan);

      const NomorPolisi = document.createElement("td");
      NomorPolisi.textContent = item.noPolisi;
      row.appendChild(NomorPolisi);

      const NomorAntrian = document.createElement("td");
      NomorAntrian.textContent = item.noAntrian;
      row.appendChild(NomorAntrian);

      const QR = document.createElement("td");
      QR.textContent = item.kodeQr;
      row.appendChild(QR);

      const Tanggal = document.createElement("td");
      Tanggal.textContent = item.tglRegistrasi;
      row.appendChild(Tanggal);

      const NamaPetugas = document.createElement("td");
      NamaPetugas.textContent = item.petugas;
      row.appendChild(NamaPetugas);

      const Status = document.createElement("td");
      Status.innerHTML = '<i class="fas fa-check text-green-500 mx-2"></i>';
      Status.textContent = item.status;
      const isActive = item.status == "Active" ? true : false;
      if (isActive) {
        Status.classList.add("Active");
        Status.innerHTML =
          '<i class="material-icons" style="color: green;">done</i>';
      } else {
        Status.classList.add("NonActive");
        Status.innerHTML =
          '<i class="material-icons" style="color: brown;">clear</i>';
      }

      row.appendChild(Status);

      const actionsCell = document.createElement("td");
      const editButton = document.createElement("button");

      editButton.setAttribute("data-toggle", "modal");
      editButton.setAttribute("data-target", "#modalEdit");
      editButton.classList.add("btn", "bg-orange", "waves-effect");
      editButton.innerHTML = '<i class="material-icons">edit</i>';

      editButton.addEventListener("click", () => {
        editItem(item.id);
      });
      actionsCell.appendChild(editButton);

      //     const viewButton = document.createElement('button');
      //     viewButton.setAttribute('data-toggle', 'modal');
      //     viewButton.setAttribute('data-target', '#modalView');
      //     viewButton.classList.add('btn', 'bg-green', 'waves-effect');
      //     viewButton.innerHTML = '<i class="material-icons">visibility</i>';
      //     viewButton.addEventListener('click', () => {

      //       displayItemById(item.id);
      //   });
      //     actionsCell.appendChild(viewButton);

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
    .get(urlApi + `barang/${itemId}`, config)

    .then((response) => {
      const itemData = response.data.data;
      namaLengkapInputs.value = itemData.namaLengkap;
      nikInputs.value = itemData.nik;
      namaInstansiInputs.value = itemData.namaInstansi;
      // barangInputs.value = itemData.idBarang;
      // kendaraanInputs.value = itemData.idKendaraan;
      noPolisiInputs.value = itemData.noPolisi;
      notesInputs.value = itemData.notes;
      tglRegistrasiInputs.value = itemData.tglRegistrasi;
      statusInputss.value = itemData.status;

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        axios
          .patch(
            urlApi + `barang/${itemId}`,
            {
              idKendaraan: dropDownKendaraan.value,
              idBarang: dropDownBarang.value,
              namaLengkap: namaLengkapInputs.value,
              nik: nikInputs.value,
              namaInstansi: namaInstansiInputs.value,
              noPolisi: noPolisiInputs.value,
              notes: notesInputs.value,
              tglRegistrasi: tglRegistrasiInputs.value,
              status: statusInputss.value,
            },
            config
          )
          .then((response) => {
            alert(response.data.message);
            location.reload();
          })
          .catch((error) => {
            alert(error.response.data.message);
          });
      });
    })
    .catch((error) => {
      console.error(error);
    });
}

// Delete item
// function deleteItem(itemId) {
//   const confirmed = confirm('Apa kamu yakin untuk menghapus data ini?');
//   if (confirmed) {
//     axios.delete(urlApi+`barang/${itemId}`, config)
//     .then(response => {
//       alert('Data berhasil di ' + response.data.message);
//       // alert(response.data.message);
//       location.reload();
//     })
//     .catch(error => {
//       alert('Data ' + error.response.data.message);
//       console.error(error);
//     });
//   }
// }

// const resetButton = document.getElementById('resetBtn');
// resetButton.addEventListener('click', () => {
//   document.getElementById('updateForm').reset();
// });
// Fetch items when the page loads
fetchItems();

const dropdown = document.getElementById("dropDownKendaraan");
// Make an Axios request to fetch the data
axios
  .get(urlApi + "master/kendaraan", config)
  .then((response) => {
    response.data.data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.nama;
      dropdown.appendChild(option);
    });
  })
  .catch((error) => {
    error;
  });

const Barang = document.getElementById("dropDownBarang");
// Make an Axios request to fetch the data
axios
  .get(urlApi + "/master/admin/barang", config)
  .then((response) => {
    response.data.data.forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.barang;
      Barang.appendChild(option);
    });
  })
  .catch((error) => {
    error;
  });
