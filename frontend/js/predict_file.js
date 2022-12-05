document.querySelector("#formFile").addEventListener('change', predictFile);

async function predictFile() {
    console.log("Starting prediction...")

    let data = new FormData();
    data.append('uploaded_file', document.querySelector("#formFile").files[0]);

    // send fetch along with cookies
    let response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        credentials: 'same-origin',
        body: data
    });

    // server responded with http response != 200
    if(response.status != 200)
        throw new Error('HTTP response code != 200');

    // read json response from server
    // success response example : {"error":0,"message":""}
    // error response example : {"error":1,"message":"File type not allowed"}
    let json_response = await response.json();
    if(json_response.error == 1)
        throw new Error(json_response.message);
    console.log(json_response["prediction"])
	// return json_response;
}
