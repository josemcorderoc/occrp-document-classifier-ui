window.onload = function() {
  document.querySelector("#formFile").addEventListener('change', () => {
    predictFile()
      .then(onResolved, onRejected)
  });
}

function predictFile() {
  console.log("Starting prediction...")
  $("#loadingio-spinner").removeClass('hidden'); 

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
  $("#loadingio-spinner").addClass('hidden'); 

  let json_response = await response.json();
  console.log(json_response)
  
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
  var numPages = $('#formFile').get(0).files[i];
  var numPages = 1; // for the moment, needs to be fixed
  for (var i = 0; i < numPages; ++i) {
    thumbnail = await pdfToThumbnail($('#formFile').get(0).files[i]);
    console.log("here");
    console.log(thumbnail);
    thumbnails = thumbnails.push(thumbnail);
    console.log("hey");
    console.log(thumbnails);
  }
  return thumbnails
}


async function pdfToThumbnail(file) {
  console.log("run pdfToThumbnail")

  fileReader = new FileReader();
  fileReader.onload = function (ev) {
    
    pdfjsLib.getDocument({data: fileReader.result}).promise.then((pdf) => {
   
      pdf.getPage(1).then(function (page) {

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
          
          return image_encoded;
        });
        

      });
    });
  };
  fileReader.readAsArrayBuffer(file);
  
}

function renderResults(response) {
  cleanResults()
  thumbnails = pdfToThumbnails()

  $("#loadingio-spinner").addClass('hidden');
  $("#clean-button").removeClass('hidden');
  

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
    $("#result-section", clone).append(thumbnails[0]);
    

    let data = [{
      x: Object.keys(prediction),
      y: Object.values(prediction),
      type: 'bar'
    }];

    Plotly.newPlot(graph_name, data);
  }
}

function cleanResults() {
  const results = document.getElementById("result-section");
  results.innerHTML = '';
  $("#clean-button").addClass('hidden');
}
