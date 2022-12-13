document.querySelector("#formFile").addEventListener('change', predictFile);

async function predictFile() {
    console.log("Starting prediction...")

    let data = new FormData();
    data.append('uploaded_file', document.querySelector("#formFile").files[0]);

    let response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        credentials: 'same-origin',
        body: data
    });

    if(response.status != 200)
        throw new Error('HTTP response code != 200');

    let json_response = await response.json();
    if(json_response.error == 1)
        throw new Error(json_response.message);
    console.log(json_response)
    renderResults(json_response["prediction"])
}

function renderResults(response) {
  cleanResults()

  let predictions = response["prediction"]
  for(let i = 0; i < predictions.length; i++) {
    let prediction = predictions[i];


    let predicted_label = prediction["__predicted"]
    delete prediction["__predicted"]

    let page = "Page " + (i+1)
    let name = "page" + i
    let graph_name = name + '-graph'

    let clone = $("#results-template").clone()

    clone.show();    
    clone.attr('id', name)

    $(".results-graph-pseudo", clone).attr('id', graph_name)
    $(".results-prediction-pseudo", clone).text(predicted_label)

    $(".order-lg-1 > h2", clone).text(page);

    clone.appendTo("#result-section");

    let data = [{
      x: Object.keys(prediction),
      y: Object.values(prediction),
      type: 'bar'
    }];

    Plotly.newPlot(graph_name, data);
  }
}

document.querySelector("#formFile2").addEventListener('change', predictFileTable);

async function predictFileTable() {
    console.log("Starting prediction...")

    let data = new FormData();
    var file = document.querySelector("#formFile2").files[0];
    let filename = file.name;
    data.append('uploaded_file', file);

    let response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        credentials: 'same-origin',
        body: data
    });

    if(response.status != 200)
        throw new Error('HTTP response code != 200');

    let json_response = await response.json();
    if(json_response.error == 1)
        throw new Error(json_response.message);
    console.log(json_response)
    renderTable(json_response["prediction"], filename)
}

function cleanResults() {
  const results = document.getElementById("result-section");
  results.innerHTML = '';
}




// table
function renderTable(data, filename) {
  // columns
  var columns = [
    "page",
    "filename",
    "predicted",
    "bank-statements",
    "company-registry",
    "contracts",
    "court-documents",
    "gazettes",
    "invoices",
    "passport-scan",
    "receipts",
    "shipping-receipts"
  ];

  // CREATE DYNAMIC TABLE.
  var table = document.createElement("table");
  table.id = "table1"
  // table.classList.add("table")

  // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.

  var tr = table.insertRow(-1);   
  // let myhead = mytable.createTHead();
  var thead = document.createElement('thead');
  table.insertBefore(thead, table.firstChild);
  // .(newFirstElement, eElement.firstChild);

  for (var i = 0; i < columns.length; i++) {
      var th = document.createElement("th");      // TABLE HEADER.
      th.innerHTML = columns[i];
      tr.appendChild(th);
  }
  thead.appendChild(tr);

  var tbody = table.getElementsByTagName('tbody')[0];

  // ADD JSON DATA TO THE TABLE AS ROWS.
  for (var i = 0; i < data.length; i++) {

      tr = tbody.insertRow(-1);

      var rowData = data[i];

      
      rowData.filename = filename;
      rowData.page = i+1;
      rowData.predicted = rowData.__predicted;


      for (var j = 0; j < columns.length; j++) {
          var tabCell = tr.insertCell(-1);
          var value = rowData[columns[j]];
          if (["page","filename","predicted"].includes(columns[j])) {
            tabCell.innerHTML = value;
          }
          else {
            tabCell.innerHTML = value.toFixed(3);
          }
          
      }
  }

  // FINALLY ADD THE NEWLY CREATED TABLE WITH JSON DATA TO A CONTAINER.
  var divContainer = document.getElementById("result-table");
  divContainer.innerHTML = "";
  divContainer.appendChild(table);

  $('#table1').DataTable({
    dom: 'Bfrtip',
    buttons: [
        'copy', 'csv', 'excel'
    ],
    scrollX: true,
});
}