const axios = require("axios");
// const { response } = require('express');
// const urlApi = 'http://birrul:5000/api/vms/';

// const namaDivisi = document.getElementById('namaDivisi').value;
const apiUrl = "http://birrul:5000/api/vms/visitor";
const dataToken = JSON.parse(localStorage.getItem("responseaData"));
const token = dataToken.access_token;
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};
const tableBody = document.getElementById("table-body");
const paginationContainer = document.getElementById("pagination-container");
const startDateInput = document.getElementById("start-date");
const endDateInput = document.getElementById("end-date");
const limitSelect = document.getElementById("limit-select");
const filterButton = document.getElementById("filter-button");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const currentPageElement = document.getElementById("current-page");
let startDate = "";
let endDate = "";
let itemsPerPage = parseInt(limitSelect.value);
let currentPage = 0;
let data = [];

// Function to fetch data from the API
async function fetchData(page, limit, startDate, endDate) {
  try {
    const response = await axios.get(
      `http://birrul:5000/api/vms/visitor?currentPage=${page}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
      config
    );

    data = response.data.data;
    renderTableRows();
    renderPaginationButtons();
    updateCurrentPageElement();
    updateButtonStates();
  } catch (error) {
    console.error(error);
  }
}

// Function to render table rows for the current page
function renderTableRows() {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const tableRows = data.slice(startIndex, endIndex);

  tableBody.innerHTML = ""; // Clear previous content

  for (let i = 0; i < tableRows.length; i++) {
    const row = document.createElement("tr");
    const {
      nik,
      namaLengkap,
      namaInstansi,
      tujuan,
      noPolisi,
      kendaraan,
      kodeQr,
      kios,
      petugas,
      status,
      tglRegistrasi,
    } = tableRows[i];

    row.innerHTML = `
    <td>${nik}</td>
    <td>${namaLengkap}</td>
    <td>${namaInstansi}</td>
    <td>${tujuan}</td>
    <td>${noPolisi}</td>
    <td>${kendaraan}</td>
    <td>${kodeQr}</td>
    <td>${kios}</td>
    <td>${petugas}</td>
    <td>${status}</td>
    <td>${tglRegistrasi}</td>
    `;

    tableBody.appendChild(row);
  }
}

// Function to render pagination buttons
function renderPaginationButtons() {
  const totalPages = Math.ceil(data.length / itemsPerPage);

  paginationContainer.innerHTML = ""; // Clear previous content

  prevButton.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchData(currentPage, itemsPerPage, startDate, endDate);
    }
  });

  nextButton.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchData(currentPage, itemsPerPage, startDate, endDate);
    }
  });

  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(currentPageElement);
  paginationContainer.appendChild(nextButton);

  updateButtonStates();
}

// Function to update the current page element
function updateCurrentPageElement() {
  currentPageElement.textContent = `Current Page: ${currentPage}`;
}

// Function to update the state of the previous and next buttons
function updateButtonStates() {
  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === Math.ceil(data.length / itemsPerPage);
}

// Event listener for limit select change
limitSelect.addEventListener("change", () => {
  itemsPerPage = parseInt(limitSelect.value);
  currentPage = 1;
  fetchData(currentPage, itemsPerPage, startDate, endDate);
});

// Event listener for filter button click
filterButton.addEventListener("click", () => {
  startDate = startDateInput.value;
  endDate = endDateInput.value;
  currentPage = 1;
  fetchData(currentPage, itemsPerPage, startDate, endDate);
});

// Initial fetchData call
fetchData(currentPage, itemsPerPage, startDate, endDate);
