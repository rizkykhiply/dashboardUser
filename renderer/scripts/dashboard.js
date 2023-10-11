// const urlApi = 'http://birrul:5000/api/vms/';
// const dataToken = JSON.parse(localStorage.getItem('responseaData'));
// const token = dataToken.access_token;
// const UPDATE_INTERVAL = 5000;
// const config = {
//   headers: {
//       'Authorization': `Bearer ${token}`,
//   }
// };

// function fetchData() {
//   axios.get(urlApi+'report/count/day', config)
//     .then(response => {
//       // Handle the response here
//       const number = response.data.data.totalVisitor;

//       console.log(number);
//       updateNumberElement(number);
//     })
//     .catch(error => {
//       console.error('Error fetching data:', error);
//       // Handle errors
//     });
// }

// function updateNumberElement(number) {
//   const numberElement = document.querySelector('.number.count-to');
//   numberElement.setAttribute('data-to', number);
//   numberElement.innerText = number; // Optionally update the inner text immediately
// }

// // Fetch data when the page loads (optional)
// fetchData();
// setInterval(fetchData, UPDATE_INTERVAL)

document.addEventListener("DOMContentLoaded", () => {
  const namaUser = JSON.parse(localStorage.getItem("responseaData"));
  if (namaUser) {
    const displayNameElement = document.getElementById("display-name");
    displayNameElement.textContent = namaUser.nama;
  }
  namaUser.access_token;
});

// const btnLogout = document.getElementById('logout-button');
// btnLogout?.addEventListener('click', () => {
//   logout();
// });

// const logout = () => {
//   localStorage.removeItem('responseaData');

//   ('Logged out');

//   window.location.href = '../login.html';
// };
