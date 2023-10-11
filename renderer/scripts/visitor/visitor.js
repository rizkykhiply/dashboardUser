// const axios = require("axios");
const strftime = require("strftime");
// const fs = require('fs');

var websocket = null;
var timerId = null;
var bigImageEmpty = true;
var bCardDetectedNotification = false;
var bConnected = false;

var strTltle;
var strConnect = "Connect";
var strDisconnect = "Diskonek";
var strDeviceStatus = "status perangkat";
var strDeviceConnected = "Perangkat terhubung";
var strDeviceName = "Nama perangkat";
var strDeviceSerialno = "merancang nomor seri";
var strDevNotConnect = "Perangkat tidak terhubung";
var strDescOfWebsocketError =
  "Harap konfirmasi bahwa layanan WebSocket berjalan normal dan buat kembali koneksi";
var strDescFailSetRFID =
  "Mengatur apakah terjadi kesalahan dalam membaca informasi chip";
var strDescFailSetVIZ =
  "Atur apakah akan mengenali kesalahan informasi tata letak";
var strPlaceHolderCardTextInfo =
  "Informasi teks yang dibaca dari sertifikat ditampilkan di sini";
var strDescFailSendWebsocket =
  "Terjadi kesalahan saat mengirim perintah ke layanan latar belakang";
var strDeviceOffLine = "Perangkat menjadi offline";
var strDeviceReconnected = "Perangkat telah terhubung kembali";
var strWebDescDeviceNotFound =
  "WebSocket terhubung, perangkat tidak terdeteksi";
var strWebDescRequireRestartSvc = "Layanan WebSocket perlu dimulai ulang";
var strWebDescAskForSupport =
  "Layanan WebSocket mengalami masalah, silakan hubungi administrator";
var strWebDescRequireReconnect =
  "Layanan WebSocket memerlukan sisi web untuk membangun kembali koneksi";
var host = "ws://127.0.0.1:90/echo";

window.onload = function () {
  document.getElementById("connection").value = strConnect;
};

/* Sebelum menutup halaman, tutup koneksi websocket */
window.onbeforeunload = function (event) {
  if (websocket !== null) {
    websocket.close();
    websocket = null;
  }
};

function setConnBtnValue() {
  if (bConnected) {
    document.getElementById("connection").value = strDisconnect;
  } else {
    document.getElementById("connection").value = strConnect;
  }
}

/* Membangun koneksi WebSocket dan menginisialisasi properti websocket */
function connect() {
  try {
    if (websocket != null) {
      websocket.close();
    }

    websocket = new WebSocket(host);

    /* Berhasil membuat koneksi websocket */
    websocket.onopen = function () {
      bConnected = true;
      setConnBtnValue();

      getWebConstants();

      setDefaultSettings();
      timerId = setInterval(getDeviceStatus(), 1000);
    };

    /* Merespon pesan respon atau pesan notifikasi dari layanan latar belakang */
    websocket.onmessage = function (event) {
      // console.log(event.data);
      var retmsg = event.data;
      var jsonMsg;

      try {
        jsonMsg = JSON.parse(retmsg);
        if (jsonMsg.Type == "Reply") {
          if (jsonMsg.hasOwnProperty("Commands")) {
            for (var index in jsonMsg.Commands) {
              processReply(jsonMsg.Commands[index]);
            }
          } else {
            processReply(jsonMsg);
          }
        } else if (jsonMsg.Type == "Notify") {
          processNotify(jsonMsg);
        }
        // console.log(jsonMsg);
        return;
      } catch (exception) {
        document.getElementById("msg").innerHTML = "Parse error: " + event.data;
      }
    };

    /* Dipicu saat menutup koneksi websocket secara aktif atau pasif, menghapus informasi halaman */
    websocket.onclose = function () {
      bConnected = false;
      setConnBtnValue();
      // document.getElementById('connection').value = strConnect; // "menjalin koneksi";
      clrDeviceStatus();
      clrTextInfo();
      clrImages(true);
      // websocket = null;

      if (websocket !== null) {
        if (websocket.readyState == 3) {
          document.getElementById("deviceStatus").innerHTML =
            strDescOfWebsocketError;
          document.getElementById("deviceStatus").style.color = "#f00";
        }

        websocket.close();
        websocket = null;
      }
    };

    /* kejadian kesalahan websocket, hapus informasi halaman dan alarm */
    websocket.onerror = function (evt) {
      bConnected = false;
      setConnBtnValue();
      // document.getElementById('connection').value = strConnect; // "建立连接";
      clrDeviceStatus();
      clrTextInfo();
      clrImages(true);
    };
  } catch (exception) {
    // document.getElementById("msg").innerHTML = "WebSocket  error";
  }
}

/* Fungsi ini dipicu ketika tombol Buat Koneksi diklik pada halaman */
function onConnection() {
  if (document.getElementById("connection").value == strConnect) {
    if (websocket !== null) {
      websocket.close();
      websocket = null;
    }

    connect();
  } else {
    if (websocket !== null) {
      websocket.close();
      websocket = null;

      window.location.reload();
    }
  }
}

/* Mengklik tombol putuskan sambungan pada halaman akan memicu fungsi ini */
function disConnect() {
  if (websocket != null) {
    websocket.close();
    websocket = null;
  }
}

/* Halaman mengirimkan instruksi ke latar belakang, dan latar belakang mengembalikan respons */
function processReply(msgReply) {
  if (msgReply.Command == "Get") {
    if (msgReply.Succeeded == "Y") {
      /* Get指令成功执行，从应答报文中解析出对应的结果 */
      if (msgReply.Operand == "DeviceName") {
        /* 应答报文中的设备名称 */
        document.getElementById("deviceName").innerHTML =
          /* strDeviceName + ":" + */ msgReply.Result;
      } else if (msgReply.Operand == "DeviceSerialNo") {
        /* 应答报文中的设备序列号 */
        document.getElementById("deviceSerial").innerHTML =
          /* strDeviceSerialno + ":" + */ msgReply.Result;
      } else if (msgReply.Operand == "OnLineStatus") {
        /* 应答报文中的设备在线状态 */
        document.getElementById("deviceStatus").innerHTML =
          /* strDeviceStatus + ":" + */ msgReply.Result;
        if (msgReply.Result == strDeviceConnected) {
          document.getElementById("deviceStatus").style.color = "#000";
          document.getElementById("deviceNameKey").style.display = "inline";
          document.getElementById("deviceSerialKey").style.display = "inline";
        }
      } else if (msgReply.Operand == "VersionInfo") {
        document.title = strTitle + "V" + msgReply.Result;
        document.getElementsByTagName("h1")[0].innerText =
          strTitle + "V" + msgReply.Result;
      } else if (msgReply.Operand == "DeviceType") {
        if (msgReply.Result == "Scanner") {
          document.getElementById("deviceSerialKey").style.display = "none";
          document.getElementById("idScanDocument").style.display = "inline";
        }

        var domDevType = document.getElementById("DevType");
        for (i = 0; i < domDevType.options.length; ++i) {
          if (msgReply.Result == domDevType.options[i].value) {
            domDevType.options[i].selected = true;
          }
        }
      } else if (msgReply.Operand == "WebConstant") {
        if (msgReply.Param == "CardRecogSystem") {
          strTitle = msgReply.Result;
        } else if (msgReply.Param == "Connect") {
          strConnect = msgReply.Result;
          setConnBtnValue();
          // document.getElementById("connection").value = msgReply.Result;
        } else if (msgReply.Param == "Disconnect") {
          strDisconnect = msgReply.Result;
          setConnBtnValue();
          // document.getElementById("connection").value = msgReply.Result;
        } else if (msgReply.Param == "Save") {
          document.getElementById("btnSaveSettings").value = msgReply.Result;
        } else if (msgReply.Param == "IDCANCEL") {
          document.getElementById("btnCancelSave").value = msgReply.Result;
        } else if (msgReply.Param == "DeviceStatus") {
          strDeviceStatus = msgReply.Result;
        } else if (msgReply.Param == "DeviceName") {
          strDeviceName = msgReply.Result;
          document.getElementById("deviceNameKey").innerHTML =
            strDeviceName + ":";
        } else if (msgReply.Param == "DeviceSerialno") {
          strDeviceSerialno = msgReply.Result;
          document.getElementById("deviceSerialKey").innerHTML =
            strDeviceSerialno + ":";
        } else if (msgReply.Param == "DeviceNotConnected") {
          strDevNotConnect = msgReply.Result;
        } else if (msgReply.Param == "DescOfWebsocketError") {
          strDescOfWebsocketError = msgReply.Result;
        } else if (msgReply.Param == "DescFailSetRFID") {
          strDescFailSetRFID = msgReply.Result;
        } else if (msgReply.Param == "DescFailSetVIZ") {
          strDescFailSetVIZ = msgReply.Resultl;
        } else if (msgReply.Param == "PlaceHolderCardTextInfo") {
          // strPlaceHolderCardTextInfo = msgReply.Result;
          // document.getElementById("msg").setAttribute("placeholder", strPlaceHolderCardTextInfo);
        } else if (msgReply.Param == "DescFailSendWebsocket") {
          strDescFailSendWebsocket = msgReply.Result;
        } else if (msgReply.Param == "DeviceOffLine") {
          strDeviceOffLine = msgReply.Result;
        } else if (msgReply.Param == "DeviceReconnected") {
          strDeviceReconnected = msgReply.Result;
        } else if (msgReply.Param == "WebDescDeviceNotFound") {
          strWebDescDeviceNotFound = msgReply.Result;
        } else if (msgReply.Param == "WebDescRequireRestartSvc") {
          strWebDescRequireRestartSvc = msgReply.Result;
        } else if (msgReply.Param == "WebDescAskForSupport") {
          strWebDescAskForSupport = msgReply.Result;
        } else if (msgReply.Param == "WebDescRequireReconnect") {
          strWebDescRequireReconnect = msgReply.Result;
        } else if (msgReply.Param == "DeviceConnected") {
          strDeviceConnected = msgReply.Result;
        }
      }
    }
  } else if (msgReply.Command == "Set") {
    if (msgReply.Succeeded == "N") {
      /* Set指令未生效 */
      if (msgReply.Operand == "RFID") {
        document.getElementById("msg").innerHTML = strDescFailSetRFID;
      } else if (msgReply.Operand == "VIZ") {
        //document.getElementById("msg").innerHTML = strDescFailSetVIZ;
      }
    }
  }
}

/* Layanan latar belakang secara aktif mengirimkan pesan ke klien web, termasuk informasi pembacaan kartu, gambar ID, pemberitahuan status abnormal, dll. */
function processNotify(msgNotify) {
  if (msgNotify.Command == "Display") {
    if (msgNotify.Param == strDeviceOffLine) {
      clrDeviceStatus();
      document.getElementById("deviceStatus").innerHTML =
        strWebDescDeviceNotFound; // "WebSocket terhubung, perangkat tidak terdeteksi";
      document.getElementById("deviceStatus").style.color = "#f00";
    } else if (msgNotify.Param == strDeviceReconnected) {
      getDeviceStatus();
    }
  } else if (msgNotify.Command == "Reconnect") {
    clrDeviceStatus();
    document.getElementById("deviceStatus").innerHTML =
      strWebDescRequireReconnect; // "Layanan WebSocket memerlukan sisi web untuk membuat kembali sambungan dan menyambung kembali.";
    document.getElementById("deviceStatus").style.color = "#f00";
    disConnect();
    connect();
  } else if (msgNotify.Command == "AskSupport") {
    clrDeviceStatus();
    document.getElementById("deviceStatus").innerHTML = strWebDescAskForSupport; // "Layanan WebSocket mengalami masalah：" + msgNotify.Param;
    document.getElementById("deviceStatus").style.color = "#f00";
  } else if (msgNotify.Command == "RestartService") {
    /* disConnect(); */
    document.getElementById("deviceStatus").innerHTML =
      strWebDescRequireRestartSvc; // "Layanan WebSocket perlu di-restart, silakan hubungi administrator";
    document.getElementById("deviceStatus").style.color = "#f00";
  } else if (msgNotify.Command == "Save") {
    if (msgNotify.Operand == "CardContentText") {
      clrImages(false);
      displayCardContent(msgNotify.Param);
    } else if (msgNotify.Operand == "Images") {
      clrImages(false);
      displayImages(msgNotify.Param);
    } else if (msgNotify.Operand == "DocInfoAllInOne") {
      displayCardContent(msgNotify.Param.Fields);
      displayImages(msgNotify.Param.Images);
    }
  } else if (msgNotify.Command == "CardDetected") {
    clrTextInfo();
    clrImages(true);
  }
}

/* Parsing informasi teks dokumen (format JSON) dan tampilkan di halaman */
function displayCardContent(cardContent) {
  var domTextArea = document.getElementById("divTextArea");
  var domTextItem;
  var domKeySpan;
  var domSource = null;
  var domValInput;

  domTextArea.innerHTML = "";

  for (var key in cardContent) {
    domTextItem = document.createElement("div");
    domKeySpan = document.createElement("span");
    domValInput = document.createElement("input");

    domTextItem.className = "cTextItem";

    domKeySpan.className = "cTextKey";
    domKeySpan.innerText = key;
    domValInput.className = "cTextValue";
    domValInput.setAttribute("readonly", "readonly");

    var cont = cardContent[key];
    if (cont.hasOwnProperty("Content") && cont.hasOwnProperty("Source")) {
      domSource = document.createElement("input");
      domSource.className = "cTextSource";
      domSource.setAttribute("readonly", "readonly");
      domSource.value = cont.Source;
      domValInput.value = cont.Content;
    } else {
      domValInput.value = cardContent[key];
    }

    domTextItem.appendChild(domKeySpan);
    if (domSource != null) {
      domTextItem.appendChild(domSource);
    }
    domTextItem.appendChild(domValInput);
    domTextArea.appendChild(domTextItem);
  }
}

/* Jika ada gambar bernama imageName, tampilkan pada posisi yang sesuai di halaman */
function tryDisplayImage(images, imageName, domId, imageData) {
  if (images.hasOwnProperty(imageName)) {
    document.getElementById(domId).src = images[imageName];
    // console.log(images.White);
    const Base64String = images.White;
    const sparator = ",";
    const part = Base64String.split(sparator);
    const imageType = part[0].split(":")[1].split(";")[0];
    const imageData = part[1];
    // console.log(imageType);
    // console.log(imageData);

    if (bigImageEmpty) {
      // document.getElementById("imageDisplay").src = images[imageName];
      bigImageEmpty = false;
    }
    postVisitor(
      idKendaraan,
      idKios,
      namaLengkap,
      nik,
      namaInstansi,
      noPolisi,
      tujuan,
      imagebase64data,
      imageData,
      noKartu,
      formattedDate
    );
  }
}

/* Periksa gambar mana yang termasuk dalam data gambar yang dikirim oleh latar belakang dan tampilkan di halaman */
function displayImages(images) {
  tryDisplayImage(images, "White", "imageWhite");
  // tryDisplayImage(images, "IR", "imageIR");
  // tryDisplayImage(images, "UV", "imageUV");
  // tryDisplayImage(images, "OcrHead", "imageOcrHead");
  // tryDisplayImage(images, "ChipHead", "imageChipHead");
  tryDisplayImage(images, "SidHead", "imageChipHead");
}

function clrTextInfo() {
  document.getElementById("divTextArea").innerHTML = "";
}

/* Menghapus informasi gambar pada halaman */
function clrImages(bForce) {
  if (bForce || !bCardDetectedNotification) {
    document.getElementById("imageWhite").src = "png/Home_pic_bgicon.png";
    // document.getElementById("imageIR").src = "png/Home_pic_bgicon.png";
    // document.getElementById("imageUV").src = "png/Home_pic_bgicon.png";
    // document.getElementById("imageOcrHead").src = "png/Home_pic_bgicon.png";
    // document.getElementById("imageChipHead").src = "png/Home_pic_bgicon.png";
    // document.getElementById("imageDisplay").src = "png/Home_pic_kong.png";
    bigImageEmpty = true;
  }
}

/* Merangkum operasi pengiriman data */
function sendJson(jsonData) {
  try {
    if (websocket !== null) {
      websocket.send(JSON.stringify(jsonData));
    }
    console.log(JSON.stringify(jsonData));
  } catch (exception) {
    //document.getElementById("msg").innerHTML = strDescFailSendWebsocket;
  }
}

function onManualTrigger() {
  var cmdManualTrigger = {
    Type: "Notify",
    Command: "Trigger",
    Operand: "ManualRecog",
    Param: 2,
  };

  sendJson(cmdManualTrigger);
}

function ScanDocument() {
  var cmdScanDocument = {
    Type: "Notify",
    Command: "TriggerEx",
    Operand: "ManualRecog",
    Param: {
      DocumentId: 2,
    },
  };

  sendJson(cmdScanDocument);
}

/* Dapatkan status perangkat, versi inti, dan kirim beberapa instruksi sekaligus */
function getDeviceStatus() {
  var request = {
    Type: "Request",
    Commands: [
      {
        Command: "Get",
        Operand: "OnLineStatus",
      } /* Mendapatkan status online perangkat */,
      { Command: "Get", Operand: "DeviceName" } /* Dapatkan nama perangkat */,
      {
        Command: "Get",
        Operand: "DeviceType",
      } /* 获取设备类型(扫描仪或护照阅读机) */,
      {
        Command: "Get",
        Operand: "DeviceSerialNo",
      } /* Mendapatkan nomor seri perangkat */,
      {
        Command: "Get",
        Operand: "VersionInfo",
      } /* Mendapatkan informasi versi inti */,
    ],
  };

  sendJson(request);
}

/* Menghapus informasi status perangkat yang ditampilkan di halaman */
function clrDeviceStatus() {
  document.getElementById("deviceStatus").innerHTML = strDevNotConnect;
  document.getElementById("deviceNameKey").style.display = "none";
  document.getElementById("deviceName").innerHTML = "";
  document.getElementById("deviceSerialKey").style.display = "none";
  document.getElementById("deviceSerial").innerHTML = "";
}

/* Mengatur parameter pembacaan kartu, mengidentifikasi informasi chip, dan mengidentifikasi informasi tata letak secara default */
function setDefaultSettings() {
  var request = {
    Type: "Request",
    Commands: [
      {
        Command: "Set",
        Operand: "RFID",
        Param: "Y",
      } /* Mengatur informasi chip identifikasi */,
      {
        Command: "Set",
        Operand: "VIZ",
        Param: "Y",
      } /* Mengatur informasi tata letak identifikasi */,
    ],
  };

  sendJson(request);
}

/* Ambil foto KTP */
function takePhoto() {
  var request = {
    Type: "Request",
    Command: "Set",
    Operand: "TakePhoto",
    Param: 0,
  };
  var requestGetBase64 = {
    Type: "Request",
    Command: "Get",
    Operand: "Base64Image",
  };

  sendJson(request);
  sendJson(requestGetBase64);
  console.log(requestGetBase64);
}

/* Pilih gambar yang akan diperbesar untuk dilihat */
function showImage(domId) {
  // document.getElementById("imageDisplay").src = document.getElementById(domId).src;
}

function showSettingPage() {
  document.getElementById("settings").style.display = "block";
  document.getElementById("control").style.display = "none";
  document.getElementById("cardInfo").style.display = "none";
}

function checkStatusToString(domId) {
  if (document.getElementById(domId).checked) {
    return "True";
  } else {
    return "False";
  }
}

function SaveSettings() {
  bCardDetectedNotification =
    document.getElementById("CallBack").checked ||
    document.getElementById("CardDetect").checked;

  var request = {
    Type: "Request",
    Commands: [
      {
        Command: "Set",
        Operand: "VIZ",
        Param: checkStatusToString("RecogVIZ"),
      },
      {
        Command: "Set",
        Operand: "RFID",
        Param: checkStatusToString("RecogRFID"),
      },
      {
        Command: "Set",
        Operand: "Rejection",
        Param: checkStatusToString("Rejection"),
      },
      {
        Command: "Set",
        Operand: "IfEnableCallback",
        Param: checkStatusToString("CallBack"),
      },
      {
        Command: "Set",
        Operand: "IfNotifyCardDetected",
        Param: checkStatusToString("CardDetect"),
      },
      {
        Command: "Set",
        Operand: "MRZOnWhiteImage",
        Param: checkStatusToString("MRZOnWhite"),
      },
      {
        Command: "Set",
        Operand: "IfDetectUVDull",
        Param: checkStatusToString("UVDull"),
      },
      {
        Command: "Set",
        Operand: "IfDetectFibre",
        Param: checkStatusToString("Fibre"),
      },
      {
        Command: "Set",
        Operand: "IfCheckSourceType",
        Param: checkStatusToString("SourceType"),
      },
      {
        Command: "Set",
        Operand: "BarCodeRecog",
        Param: checkStatusToString("BarCode"),
      },
    ],
  };

  sendJson(request);

  document.getElementById("settings").style.display = "none";
  document.getElementById("control").style.display = "block";
  document.getElementById("cardInfo").style.display = "block";
}

function DonnotSaveSettings() {
  document.getElementById("settings").style.display = "none";
  document.getElementById("control").style.display = "block";
  document.getElementById("cardInfo").style.display = "block";
}
function ChangeConnectType() {
  var tmp = "ws://127.0.0.1:90/echo";
  if (tmp == host) {
    host = "wss://127.0.0.1:90/echo";
  } else {
    host = "ws://127.0.0.1:90/echo";
  }
}

function getWebConstants() {
  var request = {
    Type: "Request",
    Commands: [
      { Command: "Get", Operand: "WebConstant", Param: "CardRecogSystem" },
      { Command: "Get", Operand: "WebConstant", Param: "Connect" },
      { Command: "Get", Operand: "WebConstant", Param: "Disconnect" },
      { Command: "Get", Operand: "WebConstant", Param: "Save" },
      { Command: "Get", Operand: "WebConstant", Param: "IDCANCEL" },
      { Command: "Get", Operand: "WebConstant", Param: "DeviceStatus" },
      { Command: "Get", Operand: "WebConstant", Param: "DeviceName" },
      { Command: "Get", Operand: "WebConstant", Param: "DeviceSerialno" },
      { Command: "Get", Operand: "WebConstant", Param: "DeviceNotConnected" },
      { Command: "Get", Operand: "WebConstant", Param: "DescOfWebsocketError" },
      { Command: "Get", Operand: "WebConstant", Param: "DescFailSetRFID" },
      { Command: "Get", Operand: "WebConstant", Param: "DescFailSetVIZ" },
      {
        Command: "Get",
        Operand: "WebConstant",
        Param: "PlaceHolderCardTextInfo",
      },
      { Command: "Get", Operand: "WebConstant", Param: "DeviceOffLine" },
      { Command: "Get", Operand: "WebConstant", Param: "DeviceReconnected" },
      {
        Command: "Get",
        Operand: "WebConstant",
        Param: "DescFailSendWebsocket",
      },
      {
        Command: "Get",
        Operand: "WebConstant",
        Param: "WebDescDeviceNotFound",
      },
      {
        Command: "Get",
        Operand: "WebConstant",
        Param: "WebDescRequireRestartSvc",
      },
      { Command: "Get", Operand: "WebConstant", Param: "WebDescAskForSupport" },
      {
        Command: "Get",
        Operand: "WebConstant",
        Param: "WebDescRequireReconnect",
      },
      { Command: "Get", Operand: "WebConstant", Param: "DeviceConnected" },
    ],
  };

  sendJson(request);
}

function ChangeDeviceType() {
  var domDevType = document.getElementById("DevType");
  /*
            if (domDevType.options[domDevType.selectedIndex].value == 'PassportReader') {
                alert("护照阅读机");
            } else {
                alert("扫描仪");
            }
            */
  domDevType.selectedIndex = domDevType.defaultIndex;
}

function SetReadSidChip(param) {
  var request = {
    Type: "Request",
    Command: "Set",
    Operand: "Sid",
    Param: {
      OnlyReadChip: param,
    },
  };

  sendJson(request);
}

const startDateInput = document.querySelector("#startDate");
const endDateInput = document.querySelector("#endDate");
const searchTermInput = document.querySelector("#searchTerm");
// const limitInput = document.querySelector("#limit");
// const pageNumber = 1;
const namaInput = document.querySelector("#namaInput");
const noIndukInputs = document.querySelector("#noIndukInputs");
const noPolisiInputs = document.querySelector("#noPolisiInputs");
// const imageInputs = document.querySelector('#imageInputs');
const noKartuInputs = document.querySelector("#noKartuInputs");
const notesInputs = document.querySelector("#notesInputs");
const statusInputs = document.querySelector("#statusInputss");
const form = document.querySelector("#updateForm");

const urlApi = "http://birrul:5000/api/vms/";
const dataToken = JSON.parse(localStorage.getItem("responseaData"));
const token = dataToken.access_token;
const config = {
  headers: {
    Authorization: `Bearer ${token}`,
  },
};

const dropDownKendaraan1 = document.getElementById("dropDownKendaraan1");
// dropdown.classList.add('form-control', 'show-tick');
axios
  .get(urlApi + "master/kendaraan", config)
  .then((response) => {
    response.data.data.forEach((itemDrop) => {
      const option = document.createElement("option");
      option.value = itemDrop.id;
      option.textContent = itemDrop.nama;
      dropDownKendaraan1.appendChild(option);
    });
  })

  .catch((error) => {
    error;
  });

const video = document.querySelector("#video");

const constraints = {
  audio: false,
  video: {
    width: 350,
    height: 350,
  },
};

if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(function (stream) {
      video.srcObject = stream;
    })
    .catch(function (err0r) {
      ("Something went wrong!");
    });
}

function stop(e) {
  const stream = video.srcObject;
  const tracks = stream.getTracks();

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    track.stop();
  }
  video.srcObject = null;
}

const btnCapture = document.querySelector("#btnCapture");
const canvas = document.getElementById("canvas");

btnCapture.addEventListener("click", function () {
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0);
});

const date1 = new Date();
const formattedDate = strftime("%y-%m-%d %H:%M:%S", date1);

formattedDate;

const btnSaveAddKaryawan = document.getElementById("visitorAdd");
btnSaveAddKaryawan?.addEventListener("submit", (event) => {
  event.preventDefault();
  const destinationCanvas = document.createElement("canvas");
  // const destinationCanvas1 = document.createElement("canvas");
  const destCtx = destinationCanvas.getContext("2d");
  // const destCtx1 = destinationCanvas1.getContext('2d');
  const idKendaraan = document.getElementById("dropDownKendaraan").value;
  const namaLengkap = document.getElementById("namaLengkap").value;
  const nik = document.getElementById("nik").value;
  const noKartu = document.getElementById("noKartu").value;
  const namaInstansi = document.getElementById("namaInstansi").value;
  const noPolisi = document.getElementById("noPolisi").value;
  const tujuan = document.getElementById("tujuan").value;
  const idKios = 1;
  // console.log(base64Image);
  destinationCanvas.height = 325;
  destinationCanvas.width = 325;
  // destinationCanvas1.height = 325;
  // destinationCanvas1.width = 325;

  destCtx.translate(video.videoWidth, 0);
  destCtx.scale(-1, 1);
  destCtx.drawImage(document.getElementById("canvas"), 0, 0);
  let imagebase64data = destinationCanvas.toDataURL("image/png");
  imagebase64data = imagebase64data.replace("data:image/png;base64,", "");
  // console.log(formattedDate);
  postKaryawan(
    idKendaraan,
    idKios,
    namaLengkap,
    nik,
    namaInstansi,
    noPolisi,
    tujuan,
    imagebase64data,
    noKartu,
    formattedDate
  );
});

const postKaryawan = async (
  idKendaraan,
  idKios,
  namaLengkap,
  nik,
  namaInstansi,
  noPolisi,
  tujuan,
  imagebase64data,
  noKartu,
  formattedDate
) => {
  try {
    const data = {
      idKendaraan: idKendaraan,
      idKios: idKios,
      namaLengkap: namaLengkap,
      nik: nik,
      namaInstansi: namaInstansi,
      noPolisi: noPolisi,
      tujuan: tujuan,
      imageScan: "imagebase64data1",
      imageCam: imagebase64data,
      kodeQr: noKartu,
      tglRegistrasi: formattedDate,
    };
    // console.log(data);

    const response = await axios.post(
      urlApi + "register/visitor",
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
// let pageNumber = 0; // Global variable to keep track of the current page

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
        `visitor?currentPage=${pageNumber}&limit=10&search=${searchTerm}&startDate=${startDate}&endDate=${endDate}`,
      config
    );
    const items = response.data.data;
    // console.log(items);
    // const tableBody = document.getElementById('dataBody');
    const tableBody = document.querySelector("#tableVisitor tbody");
    // tableBody.classList.add('DataTables_Table_0');
    tableBody.innerHTML = "";

    items.forEach((item, index) => {
      const row = document.createElement("tr");

      const indexCell = document.createElement("td");
      indexCell.textContent = index + 1; // Nomor urut dimulai dari 1
      row.appendChild(indexCell);

      const NamaLengkap = document.createElement("td");
      NamaLengkap.textContent = item.namaLengkap;
      row.appendChild(NamaLengkap);

      const Nopol = document.createElement("td");
      Nopol.textContent = item.noPolisi;
      row.appendChild(Nopol);

      const Kios = document.createElement("td");
      Kios.textContent = item.kios;
      row.appendChild(Kios);

      const NoKartu = document.createElement("td");
      NoKartu.textContent = item.kodeQr;
      row.appendChild(NoKartu);

      const Img = document.createElement("img");
      Img.src = item.imageScan;
      Img.style.width = "90px";
      Img.style.height = "50px";
      Img.crossOrigin = "Anonymous";
      row.appendChild(Img);

      // const Ktp = document.createElement("td");
      // Ktp.textContent = item.imageCam;
      // row.appendChild(Ktp);

      const TglRegis = document.createElement("td");
      TglRegis.textContent = item.tglRegistrasi;
      row.appendChild(TglRegis);

      const Petugas = document.createElement("td");
      Petugas.textContent = item.petugas;
      row.appendChild(Petugas);

      // const Status = document.createElement('td');
      // Status.textContent = item.status;
      // row.appendChild(Status);

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
      // console.log(item)
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

      const viewButton = document.createElement("button");
      viewButton.setAttribute("data-toggle", "modal");
      viewButton.setAttribute("data-target", "#modalView");
      viewButton.classList.add("btn", "bg-green", "waves-effect");
      viewButton.innerHTML = '<i class="material-icons">visibility</i>';
      viewButton.addEventListener("click", () => {
        displayItemById(item.id);
      });
      actionsCell.appendChild(viewButton);

      row.appendChild(actionsCell);
      tableBody.appendChild(row);
    });
    // const prevButton = document.querySelector('button[onclick="fetchPreviousPage()"]');
    // prevButton.style.display = currentPage > 1 ? 'block' : 'none';

    // // Show or hide the "Next" button based on whether there are more pages
    // const hasNextPage = response.headers['x-has-next-page'];
    // const nextButton = document.querySelector('button[onclick="fetchNextPage()"]');
    // nextButton.style.display = hasNextPage ? 'block' : 'none';
  } catch (error) {
    console.error("Error fetching items:", error);
  }
}
// Edit item
function editItem(itemId) {
  axios
    .get(urlApi + `visitor/${itemId}`, config)

    .then((response) => {
      const itemData = response.data.data;
      dropDownKendaraan1.value = itemData.idKendaraan;
      namaLengkapInputs.value = itemData.namaLengkap;
      nikInputs.value = itemData.nik;
      namaInstansiInputs.value = itemData.namaInstansi;
      noPolisiInputs.value = itemData.noPolisi;
      tujuanInputs.value = itemData.tujuan;
      notesInputs.value = itemData.notes;
      tglRegistrasiInputs.value = itemData.tglRegistrasi;
      statusInputss.value = itemData.status;

      // console.log(itemData);

      form.addEventListener("submit", (e) => {
        e.preventDefault();
        axios
          .patch(
            urlApi + `visitor/${itemId}`,
            {
              idKendaraan: dropDownKendaraan1.value,
              namaLengkap: namaLengkapInputs.value,
              nik: nikInputs.value,
              namaInstansi: namaInstansiInputs.value,
              noPolisi: noPolisiInputs.value,
              tujuan: tujuanInputs.value,
              notes: notesInputs.value,
              tglRegistrasi: formattedDate,
              status: statusInputs.value,
            },
            config
          )
          .then((response) => {
            alert(response.data.message + " Success");
            // console.log(response.data.data)
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
  // console.log(itemId)
  // console.log('Editing item with ID:', itemId);
}

async function getItem(itemId) {
  try {
    const response = await axios.get(urlApi + `visitor/${itemId}`, config);
    return response.data.data;
  } catch (error) {
    console.error("Gagal mengambil data item:", error);
    throw error;
  }
}

// Fungsi untuk menampilkan data "item" di halaman HTML
async function displayItemById(itemId) {
  try {
    const itemData = await getItem(itemId);
    const itemElement = document.getElementById("itemData");

    const itemHTML = `

      <label class="form-label">Nama Lengkap :</label>
      ${itemData.namaLengkap}<br><br><br>
      <label class="form-label">NIK :</label>
      ${itemData.nik}<br><br><br>
      <label class="form-label">PT :</label>
      ${itemData.namaInstansi}<br><br><br>
      <label class="form-label">No Polisi :</label>
      ${itemData.noPolisi}<br><br><br>
      <label class="form-label">Jenis Kendaraan :</label>
      ${itemData.kendaraan}<br><br><br>
      <label class="form-label">Tujuan :</label>
      ${itemData.tujuan}<br><br><br>
      <label class="form-label">Camera :</label>
      <img src="${itemData.imageCam}" crossOrigin="anonymous"><br><br><br>
      <label class="form-label">No Kartu :</label>
      ${itemData.kodeQr}<br><br><br>
      <label class="form-label">Tgl Regis :</label>
      ${itemData.tglRegistrasi}<br><br><br>
    `;
    itemElement.innerHTML = itemHTML;
  } catch (error) {
    // Tangani kesalahan jika terjadi
    console.error("Terjadi kesalahan:", error);
  }
}
// async function fetchNextPage() {
//   pageNumber++; // Increment the page number for the next page
//   fetchItems();
// }

// async function fetchPreviousPage() {
//   if (pageNumber > 1) {
//     pageNumber--; // Decrement the page number for the previous page
//     fetchItems();
//   }
// }

fetchItems();

const dropDownKendaraan = document.getElementById("dropDownKendaraan");
// dropdown.classList.add('form-control', 'show-tick');
axios
  .get(urlApi + "master/kendaraan", config)
  .then((response) => {
    response.data.data.forEach((itemDrop) => {
      const option = document.createElement("option");
      option.value = itemDrop.id;
      option.textContent = itemDrop.nama;
      dropDownKendaraan.appendChild(option);
      //  console.log(response.data.data);
    });
  })

  .catch((error) => {
    error;
  });

document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    e.preventDefault(); // Prevent the default Enter key behavior

    // Find the next input field
    var currentInput = e.target;
    var nextInput = getNextInput(currentInput);

    // Focus on the next input field
    if (nextInput) {
      nextInput.focus();
    }
  }
});

function getNextInput(currentInput) {
  var tabIndex = parseInt(currentInput.getAttribute("tabindex")) || 0;
  var nextTabIndex = tabIndex + 1;

  // Find the next visible input field with the next tabindex
  var nextInput = document.querySelector(
    'input[tabindex="' + nextTabIndex + '"]:not([disabled]):not([readonly])'
  );

  return nextInput;
}

// endend
