const mysql = require("mysql");

// Create a MySQL connection
const connection = mysql.createConnection({
  host: "birrul",
  user: "root",
  password: "password",
  database: "db_vms",
});

connection.connect((err) => {
  if (err) {
    console.error("Koneksi Ke Database Error: " + err.stack);
    return;
  }
  console.log("Connected Database: " + connection.threadId);
});
const query =
  'SELECT a.id, b.nama as namaLengkap, a.nota, a.imgIn, a.imOut, DATE_FORMAT(a.dateIn, "%Y-%m-d %H:%i:%s") as waktuMasuk, DATE_FORMAT(a.dateOut, "%Y-%m-d %H:%i:%s") as waktuKeluar FROM tblTransaksi a INNER JOIN tblKaryawan b ON a.idKaryawan = b.id ORDER BY waktuMasuk DESC';
// Fetch the data from MySQL and populate the table
connection.query(query, (error, results) => {
  if (error) {
    console.error("Error fetching data: " + error.stack);
    return;
  }

  const tableBody = document.querySelector("#dataTable tbody");
  results.forEach((row) => {
    const tableRow = document.createElement("tr");
    tableRow.innerHTML = `
      <td>${row.namaLengkap}</td>
      <td>${row.nota}</td>
      <td>${row.imgIn}</td>
      <td>${row.imOut}</td>
      <td>${row.waktuKeluar}</td>
      <td>${row.waktuMasuk}</td>
    `;
    tableBody.appendChild(tableRow);
  });
});
