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
    console.log(json_response["prediction"])
}
