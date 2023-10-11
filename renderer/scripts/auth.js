// script.js
const axios = require("axios");
// const axios = require('axios');

const login = async (username, password) => {
  try {
    const data = {
      username: username,
      password: password,
    };
    const response = await axios.post(
      "http://birrul:5000/api/vms/auth/login",
      JSON.stringify(data),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const responseaData = response.data.data;

    localStorage.setItem("responseaData", JSON.stringify(responseaData));

    alert(response.data.message);

    window.location.href = "visitor/index.html";
  } catch (error) {
    alert(error.response.data.message);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  const namaUser = JSON.parse(localStorage.getItem("responseaData"));
  if (namaUser) {
    const displayNameElement = document.getElementById("display-name");
    displayNameElement.textContent = namaUser.nama;
  }
  namaUser.access_token;
});

const logout = () => {
  localStorage.removeItem("responseaData");

  ("Logged out");

  window.location.href = "../login.html";
};
const btnLogin = document.getElementById("login-form");
btnLogin?.addEventListener("submit", (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  login(username, password);
});
const btnLogout = document.getElementById("logout-button");
btnLogout?.addEventListener("click", () => {
  console.log("CK");
  logout();
});

// const videoPlayer = document.getElementById('videoPlayer');

//     // Set the source of the video element to the RTSP stream URL
//     videoPlayer.src = 'http://admin:4dmin1234@10.51.150.29/ISAPI/Streaming/channels/101/Picture';
//     console.log(videoPlayer.src);

//     // Handle errors, if any, during loading the stream
//     videoPlayer.addEventListener('error', (event) => {
//       console.error('Error loading RTSP stream:', event.target.error);
//     });
