window.onload = function() {
  document.querySelector("#formFile").addEventListener('change', () => {
    predictFile()
      .then(onResolved, onRejected)
  });
}

function predictFile() {
  console.log("Starting prediction...")
  $("#loadingio-spinner").removeClass('hidden');
  $("#network-error-message").addClass('hidden');

  let data = new FormData();
  data.append('uploaded_file', document.querySelector("#formFile").files[0]);

  return new Promise((resolve, reject) => {

    let response = fetch('http://localhost:8000/predict', {
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
  console.log(json_response);
  // example: {"prediction":[{"bank-statements":0.00405831029638648,"company-registry":0.0015687638660892844,"contracts":0.0006588833057321608,"court-documents":0.01585322991013527,"gazettes":0.016263607889413834,"invoices":0.00040692422771826386,"passport-scan":0.9983166456222534,"receipts":0.000726760714314878,"shipping-receipts":0.186161607503891,"__predicted":"passport-scan"},{"bank-statements":0.0030406122095882893,"company-registry":0.0047634076327085495,"contracts":0.0029574178624898195,"court-documents":0.021524254232645035,"gazettes":0.004118766635656357,"invoices":0.002362234750762582,"passport-scan":0.9994320273399353,"receipts":0.0008412563474848866,"shipping-receipts":0.01725003495812416,"__predicted":"passport-scan"}]}
  
  if(json_response.error == 1) { 
    throw new Error(json_response.message);
  }
  else {
    renderResults(json_response)
  }
}

function onRejected(error) {
  if (error.name == "TypeError") {
    if (error.message == "NetworkError when attempting to fetch resource.") {
      console.log(error);
      $("#network-error-message").removeClass('hidden');
      $("#loadingio-spinner").addClass('hidden');
    }
  }
}

async function pdfToThumbnails() {
    console.log("run pdfToThumbnailS")
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
    console.log("run pdfToThumbnail, page " + page_number);

    fileReader = new FileReader();
    fileReader.onload = function (ev) {
      
      pdfjsLib.getDocument({data: fileReader.result}).promise.then((pdf) => {
    
        pdf.getPage(page_number).then(function (page) {
          console.log("I got page " + page_number);
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

async function renderResults(response) {
  cleanResults()
  thumbnails = await pdfToThumbnails()
  

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

    $(".results-pdf > h2", clone).text(page);
    $(".results-pdf > img", clone).attr('src', thumbnails[i]);


    clone.appendTo("#result-section");
    

    let data = [{
      x: Object.keys(prediction),
      y: Object.values(prediction),
      type: 'bar'
    }];

    Plotly.newPlot(graph_name, data);

    $("#loadingio-spinner").addClass('hidden');
    $("#clean-button").removeClass('hidden');

  }
}

function cleanResults() {
  const results = document.getElementById("result-section");
  results.innerHTML = '';
  $("#clean-button").addClass('hidden');
}
