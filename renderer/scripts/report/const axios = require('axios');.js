const axios = require('axios');
// const { response } = require('express');
const urlApi = 'http://127.0.0.1:5000/api/vms/';
const dataToken = JSON.parse(localStorage.getItem('responseaData'));
const token = dataToken.access_token;
const config = {
  headers: {
      'Authorization': `Bearer ${token}`,
  }
};
const perPage = 5; // Number of items per page
let currentPage = 1; // Current page
let filteredData = []; // Filtered data array

// Fetch data from the server
function fetchData() {
  axios.get(urlApi + `visitor?${currentPage}&${limit}&${startDate}&${endDate}`, config)
    .then(response => {
      filteredData = response.data;
      renderTable();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
}

// Render table rows based on current page and filters
function renderTable() {
  const startDate = new Date(document.getElementById('startDateInput').value);
  const endDate = new Date(document.getElementById('endDateInput').value);

  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';

  const start = (currentPage - 1) * perPage;
  const end = start + perPage;

  const paginatedData = filteredData
    .filter(item => {
      const itemDate = new Date(item.date);
      return startDate <= itemDate && itemDate <= endDate;
    })
    .slice(start, end);

  paginatedData.forEach(item => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${item.nik}</td>
    <td>${item.namaLengkap}</td>
    <td>${item.namaInstansi}</td>
    <td>${item.tujuan}</td>
    <td>${item.noPolisi}</td>
    <td>${item.kendaraan}</td>
    <td>${item.kodeQr}</td>
    <td>${item.kios}</td>
    <td>${item.petugas}</td>
    <td>${item.imageCam}</td>
    <td>${item.imageScan}</td>
    <td>${item.status}</td>
    <td>${item.tglRegistrasi}</td>`;
    tableBody.appendChild(row);
  });
}

// Pagination buttons click handlers
document.getElementById('prevButton').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTable();
  }
});

document.getElementById('nextButton').addEventListener('click', () => {
  const totalPages = Math.ceil(filteredData.length / perPage);
  if (currentPage < totalPages) {
    currentPage++;
    renderTable();
  }
});

// Filter button click handler
document.getElementById('filterButton').addEventListener('click', () => {
  currentPage = 1;
  renderTable();
});

// Fetch initial data
fetchData();
