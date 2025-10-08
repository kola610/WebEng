import "@fortawesome/fontawesome-free/css/all.css";
import "../css/layout.css";
import "@picocss/pico/css/pico.min.css";
import { readCSV, CSV_Data } from "./csv";

//
// 🧩 Define table state
//
type TableState = {
  data: CSV_Data;
  fileName: string;
  timestamp: number;
  sortCol?: string; // added
  sortDir?: "asc" | "desc"; // added
  filterCol?: string; // NEW
};



const sort_table = async (
  data: CSV_Data,
  col_nam: string,
): Promise<CSV_Data> => {
  // changed: copy before sort so original reference not mutated unexpectedly
  const sorted = [...data].sort((a, b) => {
    const valA = a[col_nam];
    const valB = b[col_nam];

    if (typeof valA === "string" && typeof valB === "string") {
      return valA.localeCompare(valB);
    } else if (typeof valA === "number" && typeof valB === "number") {
      return valA - valB;
    } else {
      return String(valA).localeCompare(String(valB));
    }
  });
  return sorted;
};

const createTable = async (data: CSV_Data): Promise<void> => {
  if (!data[0]) return;

  const Tableparent = document.getElementById("table-content");
  if (!Tableparent) {
    console.error("Element with ID 'table-content' not found");
    return;
  }

  // clear any old content
  Tableparent.innerHTML = "";

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  table.appendChild(thead);
  table.appendChild(tbody);

  // ---------- HEADER ----------
  const tr_head = document.createElement("tr");
  thead.appendChild(tr_head);

  const first_entr = data[0];
  Object.keys(first_entr).forEach((key) => appendHeader(key));

  function appendHeader(key: any) {
    const tempHTML = document.createElement("th");
    tempHTML.classList.add("sortable");

    tempHTML.addEventListener("mouseenter", (e) => {
      const target = e.target as HTMLElement;
      
      target.classList.add("active");
    });

    tempHTML.addEventListener("mouseleave", (e) => {
      const target = e.target as HTMLElement;
      target.classList.remove("active");
    });



    // tempHTML.addEventListener("click", async(e) => {

    //   console.log("------")
    //   console.log((e.target as HTMLElement))

    //   if (!e.target){
    //     return;
    //   }

    //   const col_th = e.target;

    // }
    
    // ) 

    tempHTML.addEventListener("click", async (e) => {
      const columnContainer = document.getElementById("column-info");

      const col_name = tempHTML.textContent;


      var sel_cols = undefined
      if (col_name) {
       sel_cols = [...data].map((col) => col[col_name]);
      }
      

      if (sel_cols && sel_cols[0]) {
        // number check

        const maybe_number = sel_cols[0];

          const col_type = typeof(maybe_number)


          if (col_type === "string") {

              const target = e.target as HTMLElement;

              const allHeaders = document.querySelectorAll("th.sortable");
              allHeaders.forEach((header) => {
              if (header !== target) {
                   header.classList.remove("filterable");
               }  });
              target.classList.add("filterable");
// persist filterable column
              const savedStr = localStorage.getItem("tableState");
              if (savedStr) {
                const saved: TableState = JSON.parse(savedStr);
                localStorage.setItem(
                  "tableState",
                  JSON.stringify({ ...saved, filterCol: col_name })
                );
              }
// enable filter input
              const filterTag = document.getElementById("filter") as HTMLInputElement | null;
              if (filterTag) filterTag.disabled = false;
            }

            else {

              const allHeaders = document.querySelectorAll("th.sortable");
              allHeaders.forEach((header) => {
                   header.classList.remove("filterable");
                 });
// clear persisted filter if switching to non-string
              const savedStr2 = localStorage.getItem("tableState");
              if (savedStr2) {
                const saved: TableState = JSON.parse(savedStr2);
                localStorage.setItem(
                  "tableState",
                  JSON.stringify({ ...saved, filterCol: undefined })
                );
              }
// disable filter input
              const filterTag = document.getElementById("filter") as HTMLInputElement | null;
              if (filterTag) {
                filterTag.value = "";
                filterTag.disabled = true;
              }
            }

        // assume sel_cols = all values of the selected column
        // and col_name = name of the selected column

        const isNumericColumn = !isNaN(Number(maybe_number));

        if (columnContainer) {

        

          if (isNumericColumn) {
            // convert all values to numbers
            const nums = sel_cols.map(Number);
            const max = Math.max(...nums);
            const min = Math.min(...nums);

            columnContainer.innerHTML = `
      <ul style="list-style: none; padding-left: 0; margin: 0;">
        <li><strong>Column:</strong> <br>${col_name}</li>
        <li><strong>Data type:</strong> <br>${col_type}</li>
        <li><strong>Min:</strong> <br>${min}</li>
        <li><strong>Max:</strong> <br>${max}</li>
      </ul>
    `;
          } else { 


            

            // non-numeric column — show only column name
            columnContainer.innerHTML = `
             <ul style="list-style: none; padding-left: 0; margin: 0;">
            <li><strong>Column:</strong> <br> ${col_name}</li> 
              <li><strong>Data type:</strong> <br>${col_type}</li>
    `;
          }

          localStorage.setItem("colInfo", columnContainer.innerHTML);
        }

        // localStorage.setItem("tableInfo", infoContainer.innerHTML);
      }
    });

    tempHTML.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;

      // Clear sorting classes from all headers
      const allHeaders = document.querySelectorAll("th.sortable");
      allHeaders.forEach((header) => {
        if (header !== target) {
          header.classList.remove("asc", "desc");
        }
      }
    
    );

      const colName = target.textContent;
      if (!colName) return;

      // Toggle classes
      if (target.classList.contains("desc")) {
        target.classList.remove("desc");
        target.classList.add("asc");
      } else if (target.classList.contains("asc")) {
        target.classList.remove("asc");
        target.classList.add("desc");
      } else {
        target.classList.add("asc");
      }

      // Perform sort based on final class
      let sorted = await sort_table(data, colName); // ascending base
      if (target.classList.contains("desc")) {
        sorted = sorted.slice().reverse();
      }

      // Replace body rows (minimal change – reuse appendRow)
      tbody.innerHTML = "";
      sorted.forEach((row) => appendRow(row));

      // Update working data reference
      data = sorted;

      // Persist sorted state (minimal addition)
      const savedStr = localStorage.getItem("tableState");
      if (savedStr) {
        const saved: TableState = JSON.parse(savedStr);
        const dir: "asc" | "desc" = target.classList.contains("desc")
          ? "desc"
          : "asc";
        localStorage.setItem(
          "tableState",
          JSON.stringify({
            ...saved,
            data: sorted,
            sortCol: colName,
            sortDir: dir,
            timestamp: Date.now(),
          }),
        );
      }
    });

    tempHTML.dataset.key = String(key); // preserve exact object key
    tempHTML.textContent = key;
    tr_head.appendChild(tempHTML);
  }

  // ---------- BODY ----------
  data.forEach((row) => appendRow(row));

  function appendRow(row: Record<string, unknown>) {
    const tmp_tr_body = document.createElement("tr");

    Object.values(row).forEach((value) => {
      const tempHTML = document.createElement("td");
      tempHTML.textContent = String(value);
      tmp_tr_body.appendChild(tempHTML);
    });

    tbody.appendChild(tmp_tr_body);
  }

  Tableparent.appendChild(table);

  table.addEventListener("filtering", (e) => {
    const event = e as CustomEvent;
    const filterHeader = table.querySelector<HTMLTableCellElement>("th.filterable");
    const searchTerm: string = (event.detail?.col_name || "").toLowerCase();

    if (!filterHeader) {
      console.warn("No filterable (string) column selected.");
      return;
    }

    const colKey = filterHeader.dataset.key; // exact key
    if (!colKey) {
      console.warn("Filterable header missing data-key");
      return;
    }

    tbody.innerHTML = "";

    const filtered = searchTerm
      ? data.filter((row) => {
          const raw = row[colKey];
          if (raw == null) return false;
          return String(raw).toLowerCase().includes(searchTerm);
        })
      : data;

    // 
    
    
    filtered.forEach((row) => appendRow(row));
  });
};

//
// 📂 Handle file upload
//
async function fileChange(event: Event) {


  if (!(event.target instanceof HTMLInputElement)) return;

  const file = event.target.files?.[0];
  if (!file) return;

  const data = await readCSV(event);
  const fileName = file.name;
  const fileSizeKB = (file.size / 1024).toFixed(2);
  const numRows = data.length;

  // Display file info
  const infoContainer = document.getElementById("data-info");
  if (infoContainer) {
    infoContainer.innerHTML = `
      <ul>
      <li><strong><i class="fa fa-file"></i> File name</strong> <br> ${fileName}</li>
      <li><strong><i class="fa fa-database"></i> File size</strong> <br>${fileSizeKB} KB</li>
      <li><strong><i class="fa fa-table"></i> Number of rows</strong> <br> ${numRows}</li>
      </ul>
    `;

    localStorage.setItem("tableInfo", infoContainer.innerHTML);
  }

  // 💾 Save table state
  const state: TableState = {
    data,
    fileName,
    timestamp: Date.now(),
  };
  localStorage.setItem("tableState", JSON.stringify(state));

  // Build table
  createTable(data);

  //clear column thingy 

  const clear_col = document.getElementById("column-info");
  if (clear_col) {
    clear_col.innerHTML = "";
  }
  const filterTag = document.getElementById("filter") as HTMLInputElement | null;
  if (filterTag) {
    filterTag.value = "";
    filterTag.disabled = true;
  }
}

//MAIN



const Filter_space = document.getElementById("filter");

Filter_space?.addEventListener("keydown", (e) => {
  if (e instanceof KeyboardEvent && e.key === "Enter") {
    const target = e.target as HTMLInputElement | null;
    const look_name = (target?.value || "").trim();

    

    // Always dispatch, even if empty -> restores full table
    const msg = new CustomEvent("filtering", {
      detail: { col_name: look_name }
    });

    const tmp_table = document.querySelector("table");
    if (tmp_table) {
      tmp_table.dispatchEvent(msg);
    }
  }
});

const fileSelector = document.getElementById("file-input");
if (fileSelector instanceof HTMLInputElement) {
  fileSelector.addEventListener("change", fileChange);
}






// table STATE
window.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("tableState");
  if (saved) {
    const state: TableState = JSON.parse(saved);
    console.log("Restoring table from saved state:", state);

    createTable(state.data);

    const infoContainer = document.getElementById("data-info");
    const table_info = localStorage.getItem("tableInfo");

    const columnContainer_restored = document.getElementById("column-info");
     const column_info = localStorage.getItem("colInfo");

    if (infoContainer && table_info) {
      infoContainer.innerHTML = table_info;
    }

      if (columnContainer_restored && column_info) {
      columnContainer_restored.innerHTML = column_info;
    }


    
    // Restore header sort class (data already sorted)
    if (state.sortCol && state.sortDir) {
      requestAnimationFrame(() => {
        document.querySelectorAll("th.sortable").forEach((th) => {
          if (th.textContent === state.sortCol)
            th.classList.add(state.sortDir!);
        });
      });
    }
// restore filterable column
    if (state.filterCol) {
      requestAnimationFrame(() => {
        document.querySelectorAll("th.sortable").forEach((th) => {
          if (th.textContent === state.filterCol) th.classList.add("filterable");
        });
        const filterTag = document.getElementById("filter") as HTMLInputElement | null;
        if (filterTag) filterTag.disabled = false;
      });
    } else {
      const filterTag = document.getElementById("filter") as HTMLInputElement | null;
      if (filterTag) {
        filterTag.value = "";
        filterTag.disabled = true;
      }
    }
  }
});
