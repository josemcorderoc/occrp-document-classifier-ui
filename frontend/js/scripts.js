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
    renderResults(json_response)
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

function cleanResults() {
  const results = document.getElementById("result-section");
  results.innerHTML = '';
}
