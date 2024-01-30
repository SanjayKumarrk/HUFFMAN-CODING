import { io } from "socket.io-client";
import { HuffmanCoding } from "./_/js/HuffmanCoding";
import { drawGraph } from "./_/js/graph";

let Huffman = new HuffmanCoding();
let ComHuffman = new HuffmanCoding();
let timing;

const socket = io("http://192.168.0.115:3000");
socket.on("connect", () => {
  console.log("Connected with id:", socket.id);
});

//Encoder
var table = document.getElementsByTagName("table")[0];
var enCoder = document.getElementById("enCoder");

// Decoder
var deCoder = document.getElementById("deCoder");
var resultID = document.getElementById("result");

//transmitter
const tx = document.querySelector(".tx__details");
const txInput = document.querySelector("#tx__input");
const txBtn = document.querySelector(".send");

//Receiver
const rx = document.querySelector(".rx__details");
const rxBtn = document.querySelector(".getTree");

//Events
socket.on("rx", (data) => {
  ComHuffman.init(data);
  let code = ComHuffman.createOutput().join("").replace(/[^01]/g, "");
  let message = ComHuffman.readCode(code).join("");
  createRxDetails(code, message);
  rxBtn.disabled = false;
});

enCoder.addEventListener("input", function inputListener(e) {
  //cleanup
  deCoder.disabled = true;
  timing = setTimeout(function () {
    removeAllRows(table.children);
    removeGraph();
    DefaultValues();
    if (enCoder.value !== "") {
      Huffman.init(enCoder.value);
      updateTable(Huffman.table);
      updateGraph(Huffman.table);
      deCoder.disabled = false;
      console.log(Huffman.createOutput().join(""));
      console.log(Huffman.stat());
      console.log(Huffman.root);
    }
  }, 400);
});

deCoder.addEventListener("input", function inputListener(e) {
  deCoder.value = e.target.value.replace(/[^01]/g, "");
  var list = Huffman.readCode(deCoder.value);
  resultID.innerHTML = list.join("");
});

txInput.addEventListener("input", () => {
  if (txInput.value === "") {
    txBtn.disabled = true;
  } else {
    txBtn.disabled = false;
  }
});

txBtn.addEventListener("click", () => {
  if (txInput.value !== "") {
    ComHuffman.init(txInput.value);
    // let opCode = ComHuffman.createOutput();
    socket.emit("tx", txInput.value);
    tx.innerHTML += `<div class="tx__message--box">
    <p class="tx__text">text-transmitted:${txInput.value}</p>
  </div>`;
    txInput.value = "";
  }
});

rxBtn.addEventListener("click", () => {
  removeAllRows(table.children);
  removeGraph();
  DefaultValues();
  enCoder.value = ComHuffman.input;
  updateTable(ComHuffman.table);
  updateGraph(ComHuffman.table);
});
// End of events

function createRow(char, apperane, probability, code) {
  var row = document.createElement("tr");

  var charTD = document.createElement("td");
  var apperaneTD = document.createElement("td");
  var probabilityTD = document.createElement("td");
  var codeTD = document.createElement("td");

  //copy the info
  charTD.innerHTML = char;
  apperaneTD.innerHTML = apperane + "x";
  probabilityTD.innerHTML = probability + "%";
  codeTD.innerHTML = code;

  //styling
  codeTD.className = "code";

  //append to the table
  row.appendChild(charTD);
  row.appendChild(apperaneTD);
  row.appendChild(probabilityTD);
  row.appendChild(codeTD);

  table.appendChild(row);
}

//Default functions
function removeAllRows(elm) {
  var lastElm;
  while (elm.length > 1) {
    lastElm = elm.length - 1;
    elm[lastElm].parentNode.removeChild(elm[lastElm]);
  }
}

function removeGraph() {
  var graph = document.querySelector("svg");
  if (graph) graph.parentElement.removeChild(graph);
}

function DefaultValues() {
  deCoder.value = "";
  resultID.innerHTML = "";
}
//End of Default functions

//Update function
function updateGraph(HuffmanTable) {
  drawGraph(HuffmanTable);
}
function updateTable(keys) {
  var probability,
    frequency,
    size = enCoder.value.length;

  //End-result
  keys.forEach(function readElement(elm) {
    frequency = elm.freq;
    probability = ((elm.freq / size) * 100).toFixed(0);
    var char = getChar(elm.value);
    createRow(char, frequency, probability, elm.code);
  });
}
//End of Update function

//Helper functions
function getChar(char) {
  if (char.charCodeAt() == 32) {
    char = "Space";
  } else if (char.charCodeAt() == 9) {
    char = "Tabb";
  } else if (char.charCodeAt() == 10) {
    char = "New Line";
  }
  return char;
}

function createRxDetails(code, message) {
  const data = `<div class="rx__message--box">
  <p class="rx__text">code-received:${code}</p>
  <p class="rx__text">decoded-message:${message}</p>
</div>`;

  rx.innerHTML += data;
}
