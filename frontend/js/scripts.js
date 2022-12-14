var classes = [
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

function predictFile() {
  console.log("Starting prediction...")
  cleanResults();
  $("#loadingio-spinner").removeClass('display-non');
  $("#network-error-message").css('visibility', 'hidden');

  let data = new FormData();
  data.append('uploaded_file', document.querySelector("#formFile").files[0]);

  return new Promise((resolve, reject) => {

    let response = fetch('https://occrp-api-pbtmu45elq-uc.a.run.app/predict', {
        method: 'POST',
        credentials: 'same-origin',
        body: data
    });

    if(response.status != 200) {
      resolve(response);
    } else {
      reject(response);
    }
    
  });
}

async function onResolved(response) {
  let json_response = await response.json();

  if(json_response.error == 1) { 
    throw new Error(json_response.message);
  }

  Promise.all([
    renderResultsBar(json_response),
    renderResultsTable(json_response)
  ]).then(unhideResultsSection)
}

function unhideResultsSection() {
  $("#loadingio-spinner").addClass('display-non');
  $("#clean-button").removeClass('display-non');
  $("#results-section").removeClass('display-non');

  let resultsSection = document.getElementById("results-section");
  resultsSection.scrollIntoView();
}

function onRejected(error) {
  if (error.name == "TypeError") {
    if (error.message == "NetworkError when attempting to fetch resource.") {
      console.log("Problem:", error);
      $("#network-error-message").css('visibility', 'visible');
      $("#loadingio-spinner").addClass('display-non');
    }
  }
  
  // some fake data with two pages
  // TODO comment this out!
  var json_string = "{\"prediction\":[{\"bank-statements\":0.00405831029638648,\"company-registry\":0.0015687638660892844,\"contracts\":0.0006588833057321608,\"court-documents\":0.01585322991013527,\"gazettes\":0.016263607889413834,\"invoices\":0.00040692422771826386,\"passport-scan\":0.9983166456222534,\"receipts\":0.000726760714314878,\"shipping-receipts\":0.186161607503891,\"__predicted\":\"passport-scan\"},{\"bank-statements\":0.0030406122095882893,\"company-registry\":0.0047634076327085495,\"contracts\":0.0029574178624898195,\"court-documents\":0.021524254232645035,\"gazettes\":0.004118766635656357,\"invoices\":0.002362234750762582,\"passport-scan\":0.9994320273399353,\"receipts\":0.0008412563474848866,\"shipping-receipts\":0.01725003495812416,\"__predicted\":\"passport-scan\"}]}";
  var json_to_response = new Response(json_string);
  renderResultsBar(json_to_response);

  json_to_response = new Response(json_string);
  renderResultsTable(json_to_response);
}

async function pdfToThumbnails() {
    console.log("run pdfToThumbnailS");
    var thumbnails = []
    var thumbnail
    // var numPages = $('#formFile').get(0).files[i]; // for the moment, needs to be fixed
    var file = $('#formFile').get(0).files[0];
    var numPages = await getPageNumber(file);
    for (var i = 1; i < numPages + 1; ++i) {
      console.log("time 1");
      thumbnail = await pdfToThumbnail(file, i);
      console.log("time 3");
      thumbnails.push(thumbnail);
    }
    return (thumbnails);
}

async function getPageNumber(file) {
  return new Promise((resolve, reject) => {

    fileReader = new FileReader();
    fileReader.onload = function (ev) {
      
      pdfjsLib.getDocument({data: fileReader.result}).promise.then((pdf) => {
    
        resolve(pdf.numPages)

      });
    };
    fileReader.readAsArrayBuffer(file);
  });
}


async function pdfToThumbnail(file, page_number) {
  return new Promise((resolve, reject) => {
    // console.log("run pdfToThumbnail, page " + page_number);

    fileReader = new FileReader();
    fileReader.onload = function (ev) {
      
      pdfjsLib.getDocument({data: fileReader.result}).promise.then((pdf) => {
    
        pdf.getPage(page_number).then(function (page) {
          // console.log("I got page " + page_number);
          var desiredWidth = 250;
          var viewport = page.getViewport({ scale: 1 });
          var scale = desiredWidth / viewport.width;
          var scaled = page.getViewport({ scale: scale });

          var canvas = document.createElement('canvas');
          var context = canvas.getContext("2d");
          canvas.height = scaled.height;
          canvas.width = scaled.width;

          var renderContext = {  canvasContext: context,  viewport: scaled };
          var renderTask = page.render(renderContext);
          
          renderTask.promise.then(function () {
            var image_encoded = canvas.toDataURL();
            console.log("time 2");
            resolve(image_encoded);
          });
        });
      });
    };

    fileReader.readAsArrayBuffer(file);
  });
}



async function renderResultsBar(response) {

  // example: {"prediction":[{"bank-statements":0.00405831029638648,"company-registry":0.0015687638660892844,"contracts":0.0006588833057321608,"court-documents":0.01585322991013527,"gazettes":0.016263607889413834,"invoices":0.00040692422771826386,"passport-scan":0.9983166456222534,"receipts":0.000726760714314878,"shipping-receipts":0.186161607503891,"__predicted":"passport-scan"},{"bank-statements":0.0030406122095882893,"company-registry":0.0047634076327085495,"contracts":0.0029574178624898195,"court-documents":0.021524254232645035,"gazettes":0.004118766635656357,"invoices":0.002362234750762582,"passport-scan":0.9994320273399353,"receipts":0.0008412563474848866,"shipping-receipts":0.01725003495812416,"__predicted":"passport-scan"}]}
  // cleanResults()
  thumbnails = await pdfToThumbnails()
  

  let predictions = response["prediction"]
  for(let i = 0; i < predictions.length; i++) {
    let prediction = predictions[i];


    let predicted_label = prediction["__predicted"]
    delete prediction["__predicted"]

    let page = "Page " + (i+1)
    let name = "results-thumbnail-" + i
    let name_graph = "results-collapsible-" + i;
    let name_card = "results-collapsible-card-" + i;

    // clone thumbnail
    let clone = $("#results-thumbnail-template").clone()
    clone.attr('id', name)

    $("h5", clone).text(predicted_label);
    $("img", clone).attr('src', thumbnails[i]);
    $("p > a", clone).attr('href', '#' + name_graph);
    $(".page-number-pseudo", clone).text(i+1);
    $("#result-thumbnails").append(clone)

    clone.show();
    delete clone;

    // clone collapsible bar graph section and insert graph
    let clone2 = $("#results-collapsible-template").clone();
    clone2.attr('id', name_graph);
    
    $(".card", clone2).attr('id', name_card);

    $("#results-bar-plot").append(clone2);

    let cleanedPrediction = Object.fromEntries(classes.map(col => [col, prediction[col]]));

    let data = [{
      x: Object.keys(cleanedPrediction),
      y: Object.values(cleanedPrediction),
      type: 'bar'
    }];

    let layout = {
      title: page,
      xaxis: {
        showgrid: false,
        zeroline: false,
        tickangle: 45,
        automargin: true  
      },
      yaxis: {
        title: 'Probability',
        showline: false
      },
      width: 450,
      height: 300,
    };
    
    Plotly.newPlot(name_graph, data, layout);
  }
}

function cleanResults() {
  if ($.fn.DataTable.isDataTable('#results-table')) {
    $('#results-table').DataTable().destroy();
    $("#results-table").html("");
  }
  
  $("#results-section").addClass('display-non');
  $("#clean-button").addClass('display-non');

  $("#result-thumbnails").html("");
  $("#results-bar-plot").html("");
}

// table
async function renderResultsTable(response) {
  let filename = $('#formFile').get(0).files[0].name;
  // example: {"prediction":[{"bank-statements":0.00405831029638648,"company-registry":0.0015687638660892844,"contracts":0.0006588833057321608,"court-documents":0.01585322991013527,"gazettes":0.016263607889413834,"invoices":0.00040692422771826386,"passport-scan":0.9983166456222534,"receipts":0.000726760714314878,"shipping-receipts":0.186161607503891,"__predicted":"passport-scan"},{"bank-statements":0.0030406122095882893,"company-registry":0.0047634076327085495,"contracts":0.0029574178624898195,"court-documents":0.021524254232645035,"gazettes":0.004118766635656357,"invoices":0.002362234750762582,"passport-scan":0.9994320273399353,"receipts":0.0008412563474848866,"shipping-receipts":0.01725003495812416,"__predicted":"passport-scan"}]}
  
  let data = response["prediction"];

  for (var i = 0; i < data.length; i++) {
      var rowData = data[i];
      rowData.filename = filename;
      rowData.page = i+1;
      rowData.predicted = rowData.__predicted;
      for (var j = 0; j < classes.length; j++) {
        rowData[classes[j]] = parseFloat(rowData[classes[j]].toFixed(4))
      }
  }

    let table = $('#results-table').DataTable({
      data: data,
      columns: [
          { data: 'filename', title: 'filename',
            render: function (data, type, full, meta) {
                      return '<div class="text-break" style="width:150px;">' + data + "</div>";
          }},
          { data: 'page', title: 'page' },
          { data: 'predicted', title: 'predicted'  },
          { data: 'bank-statements', title: 'bank-statements' },
          { data: 'company-registry', title: 'company-registry' },
          { data: 'contracts', title: 'contracts' },
          { data: 'court-documents', title: 'court-documents' },
          { data: 'gazettes', title: 'gazettes' },
          { data: 'invoices', title: 'invoices' },
          { data: 'passport-scan', title: 'passport-scan' },
          { data: 'receipts', title: 'receipts' },
          { data: 'bank-statements', title: 'bank-statements' },
          { data: 'shipping-receipts', title: 'shipping-receipts' }
      ],
      dom: 'Bfrtip',
      buttons: [
          'copy', 'csv', 'excel'
      ],
      scrollX: true,
      pageLength: 5
  });

  const options = {
    attributes: true
  };

  function callback(mutationList, observer) {
    mutationList.forEach(function(mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        table.columns.adjust().draw();
      }
    })
  }
  const observer = new MutationObserver(callback)
  observer.observe(document.getElementById("v-pills-2"), options)
}