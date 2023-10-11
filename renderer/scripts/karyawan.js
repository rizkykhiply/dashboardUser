const axios = require("axios");
const strftime = require("strftime");
const fs = require("fs");

const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");
const searchTermInput = document.querySelector("#searchTerm");
const limitInput = document.querySelector("#limit");
const namaInput = document.querySelector("#namaInput");
const noIndukInputs = document.querySelector("#noIndukInputs");
const noPolisiInputs = document.querySelector("#noPolisiInputs");
// const imageInputs = document.querySelector('#imageInputs');
const noKartuInputs = document.querySelector("#noKartuInputs");
const statusInputs = document.querySelector("#statusInputs");
const form = document.querySelector("#updateForm");

const urlApi = "http://birrul:5000/api/vms/";
const dataToken = JSON.parse(localStorage.getItem("responseaData"));
const token = dataToken.access_token;
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const dropdown1 = document.getElementById("dropDownDivisi1");
axios
  .get(urlApi + "master/divisi", config)
  .then((response) => {
    response.data.data.forEach((itemDrop) => {
      const option = document.createElement("option");
      option.value = itemDrop.id;
      option.textContent = itemDrop.nama;
      dropdown1.appendChild(option);
    });
  })

  .catch((error) => {
    error;
  });

const date1 = new Date();
const formattedDate = strftime("%y-%m-%d %H:%M:%S", date1);

formattedDate;

const btnSaveAddKaryawan = document.getElementById("KaryawanlAdd");
btnSaveAddKaryawan?.addEventListener("submit", (event) => {
  event.preventDefault();
  const idDivisi = document.getElementById("dropDownDivisi").value;
  const nama = document.getElementById("nama").value;
  const noInduk = document.getElementById("noInduk").value;
  const noPolisi = document.getElementById("noPolisi").value;
  const noKartu = document.getElementById("noKartu").value;
  const image = document.getElementById("imageInput");
  const imageFile = image.files[0];
  const imageBuffer = fs.readFileSync(imageFile.path);
  const base64Image = Buffer.from(imageBuffer).toString("base64");

  postKaryawan(
    idDivisi,
    nama,
    noInduk,
    noPolisi,
    noKartu,
    base64Image,
    formattedDate
  );
});

const postKaryawan = async (
  idDivisi,
  nama,
  noInduk,
  noPolisi,
  noKartu,
  base64Image,
  formattedDate
) => {
  try {
    const data = {
      idDivisi: idDivisi,
      nama: nama,
      noInduk: noInduk,
      noPolisi: noPolisi,
      noKartu: noKartu,
      image: base64Image,
      tglRegistrasi: formattedDate,
    };
    console.log(data);

    const response = await axios.post(
      urlApi + "register/karyawan",
      data,
      config
    );

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

async function fetchItems() {
  try {
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    const searchTerm = searchTermInput.value;
    const limit = limitInput.value;
    const pageNumber = 1;
    const response = await axios.get(
      urlApi +
        `karyawan?currentPage=${pageNumber}&limit=${limit}&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}`,
      config
    );
    const items = response.data.data;

    const tableBody = document.querySelector("#tableKaryawan tbody");

    tableBody.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("tr");

      const indexCell = document.createElement("td");
      indexCell.textContent = index + 1;
      row.appendChild(indexCell);

      const Divisi = document.createElement("td");
      Divisi.textContent = item.divisi;
      row.appendChild(Divisi);

      const Nama = document.createElement("td");
      Nama.textContent = item.nama;
      row.appendChild(Nama);

      const Img = document.createElement("img");
      Img.src = item.image;
      Img.style.width = "100px";
      Img.style.height = "100px";
      Img.crossOrigin = "Anonymous";
      row.appendChild(Img);

      const NoInduk = document.createElement("td");
      NoInduk.textContent = item.noInduk;
      row.appendChild(NoInduk);

      const NoPolisi = document.createElement("td");
      NoPolisi.textContent = item.noPolisi;
      row.appendChild(NoPolisi);

      const NoKartu = document.createElement("td");
      NoKartu.textContent = item.noKartu;
      row.appendChild(NoKartu);

      const TglRegis = document.createElement("td");
      TglRegis.textContent = item.tglRegistrasi;
      row.appendChild(TglRegis);

      const Status = document.createElement("td");
      Status.textContent = item.status;
      row.appendChild(Status);

      const actionsCell = document.createElement("td");
      const editButton = document.createElement("button");

      editButton.setAttribute("data-toggle", "modal");
      editButton.setAttribute("data-target", "#modalEdit");
      editButton.classList.add("btn", "bg-orange", "waves-effect");
      editButton.innerHTML = '<i class="material-icons"></i><span>EDIT</span>';

      editButton.addEventListener("click", () => {
        editItem(item.id);
      });
      actionsCell.appendChild(editButton);

      const deleteButton = document.createElement("button");
      deleteButton.classList.add("btn", "bg-red", "waves-effect");
      deleteButton.innerHTML =
        '<i class="material-icons"></i> <span>DELETE</span>';
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
    .get(urlApi + `karyawan/${itemId}`, config)

    .then((response) => {
      const itemData = response.data.data;
      dropdown1.value = itemData.idDivisi;
      namaInputs.value = itemData.nama;
      noIndukInputs.value = itemData.noInduk;
      noPolisiInputs.value = itemData.noPolisi;
      // imageInputs.value = itemData.image;
      noKartuInputs.value = itemData.noKartu;
      statusInputs.value = itemData.status;

      // console.log(dropdown.value);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        axios
          .patch(
            urlApi + `karyawan/${itemId}`,
            {
              idDivisi: dropdown1.value,
              nama: namaInputs.value,
              noInduk: noIndukInputs.value,
              noPolisi: noPolisiInputs.value,
              noKartu: noKartuInputs.value,
              tglRegistrasi: formattedDate,
              status: statusInputs.value,
            },
            config
          )
          .then((response) => {
            alert(response.data.message + " Success");
            location.reload();
          })
          .catch((error) => {
            alert(error.response.data.message);
            // console.log(response.data);
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
      .delete(urlApi + `karyawan/${itemId}`, config)
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

const dropdown = document.getElementById("dropDownDivisi");
// dropdown.classList.add('form-control', 'show-tick');
axios
  .get(urlApi + "master/divisi", config)
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

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault();

    var currentInput = e.target;
    var nextInput = getNextInput(currentInput);

    if (nextInput) {
      nextInput.focus();
    }
  }
});

function getNextInput(currentInput) {
  var tabIndex = parseInt(currentInput.getAttribute("tabindex")) || 0;
  var nextTabIndex = tabIndex + 1;

  var nextInput = document.querySelector(
    'input[tabindex="' + nextTabIndex + '"]:not([disabled]):not([readonly])'
  );

  return nextInput;
}

document
  .getElementById("fileUploadForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    // window.open("/")
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      fetch(urlApi + "register/import/karyawan", {
        method: "POST",
        headers: {
          ...config.headers,
        },
        body: formData,
      })
        .then(async (response) => {
          const responses = await response.json();
          console.log(responses);
          alert("success import");
        })
        .catch((error) => {
          console.log(error);
        });
    } else {
      console.error("Please select a file to upload.");
    }
  });

// script.js
const downloadBtn = document.getElementById("downloadBtn");

const downloadCSV = async () => {
  try {
    const response = await axios.get(
      "http://birrul:5000/api/vms/karyawan/download",
      config
    );

    // Create a temporary anchor element to trigger the download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "data.csv");
    document.body.appendChild(link);

    // Programmatically click the link to start the download
    link.click();

    // Clean up the temporary anchor element
    link.parentNode.removeChild(link);
  } catch (error) {
    console.error("Error downloading the CSV file:", error.message);
  }
};

downloadBtn.addEventListener("click", downloadCSV);
