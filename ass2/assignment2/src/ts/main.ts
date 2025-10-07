import "@fortawesome/fontawesome-free/css/all.css";
import "../css/layout.css";
import "@picocss/pico/css/pico.min.css";
import { readCSV, CSV_Data } from "./csv";


const headerTable = async (data: CSV_Data, event: Event): Promise<void> => {


}

const createTable = async (data: CSV_Data, event: Event): Promise<void> => {


// create header 

if (!data[0]) {
  return
 }

 const Tableparent = document.getElementById("table-content");

if (Tableparent) {
const table = document.createElement("table");
const thead = document.createElement("thead");
const tbody = document.createElement("tbody");

table.appendChild(thead);
table.appendChild(tbody);

//start -- head

const tr_head = document.createElement("tr");

thead.appendChild(tr_head); // tr vom head 

 const first_entr = data[0];

 Object.keys(first_entr).forEach(key => appendHeader(key));



function appendHeader(key: any) {
  
  const tempHTML = document.createElement("th");
  tempHTML.textContent = key;

  tr_head.appendChild(tempHTML);

}


//end -- head

//start -- body

const tr_body = document.createElement("tr");

thead.appendChild(tr_body); // tr vom head 

data.forEach(row => appendRow(row))

function appendRow(row: Record<string, unknown>) {

  const tmp_tr_body = document.createElement("tr");

  Object.values(row).forEach(e => appendCell(e));

  function appendCell (cell: any) {

  const tempHTML = document.createElement("td");
  tempHTML.textContent = cell;

  tmp_tr_body.appendChild(tempHTML);


  }




  tbody.appendChild(tmp_tr_body);

}



//end -- body


Tableparent.appendChild(table);



  
} else {
  console.error("Element with ID 'table-content' not found");
}

  return;
}

async function fileChange(event: Event) {
  // Make sure the event comes from the right element
  if (!(event.target instanceof HTMLInputElement)) return;
  // console.log("hello")
  // console.log(event.type)
  //  console.log(event)
  // Access the selected file (the first one if multiple)
  const file = event.target.files?.[0];

 
  if (!file) return;

  // Use the provided helper to read and parse the CSV file
  const data = await readCSV(event);

  console.log(data)
  // Extract useful info
  const fileName = file.name;
  const fileSizeKB = (file.size / 1024).toFixed(2);
  const numRows = data.length;

  // Select the element in your HTML where info should appear
  const infoContainer = document.getElementById("data-info");

  
  if (infoContainer) {
    infoContainer.innerHTML = `
      <ul>
        <li><i class="fa fa-file"></i> File name: ${fileName}</li>
        <li><i class="fa fa-database"></i> File size: ${fileSizeKB} KB</li>
        <li><i class="fa fa-table"></i> Number of rows: ${numRows}</li>
      </ul>
    `;
  }

  createTable(data, event);


}



const fileSelector = document.getElementById("file-input");

if (fileSelector instanceof HTMLInputElement) {
  fileSelector.addEventListener("change", fileChange);
}
