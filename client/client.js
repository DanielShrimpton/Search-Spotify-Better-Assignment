//window.addEventListener('click', function(event){
//  fetch('http://127.0.0.1:8090/list')
//  .then(response => response.text())
//  .then(body => document.getElementById('content').innerHTML=body)
//});

postData(`https://api.spotify.com/v1/audio-features/06AKEBrKUckW0KREUWRnvT`)
//  .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
  .then(data => document.getElementById('content').innerHTML = data.tempo)
  .catch(error => console.error(error));

function postData(url = ''){
  return fetch(url, {
    headers: {
      "Authorization": "Bearer BQC8koCCP8u_i_c6jtXeqG8mza5CCknWmsjwJm8idJWFRTKM7NJeqhDulMJWMGobJzuporbCq7SH8WnsmWcpHPVL6ElQtFnjb8Agp4j9r9lyiImvxQ60NEyvUFB2dIfndJhSt6QgR4djwY7L2TgTAzpjVBa7YD4AJwu4JEYFLnFRQBUScjBRtovzpHA2n6i-rKQ5mQ"
    },
    body: JSON.stringify()
  })
  .then(response => response.json());
}

document.getElementById("send_btn").onclick = search; // This gets the id of the submit button and onclick will run the function search()

function search(){
    submit() // This runs a function which returns an API request for songs with the title of the search bar

// I found this example to create a table from this website
// https://www.encodedna.com/javascript/populate-json-data-to-html-table-using-javascript.htm

    .then(function(data) {
        var table = document.createElement("table");

        for (var i = 0; i < data.tracks.items.length; i++){
            tr = table.insertRow(-1);

            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = data.tracks.items[i].name

            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = data.tracks.items[i].album.artists[0].name

            var tabCell = tr.insertCell(-1);
            tabCell.innerHTML = data.tracks.items[i].album.name
        }

        var divContainer = document.getElementById("content");
        divContainer.innerHTML = "";
        divContainer.appendChild(table);
    })
    .catch(error => console.error(error));
}

function submit(){
    var search = document.getElementById('txt_field').value; // This gets the value of the search bar
    var url = 'https://api.spotify.com/v1/search?q=name:'+search+'&type=track'; // Combines the search URL and the search criteria

    return fetch(url, {
        headers: {
            "Authorization": "Bearer BQDdVhEYnxXdHkgGTGDZe6HjKDtIfViyHSZgL86yrNHOKbRUiOOTXveV0SCDLhZtL65a52unWdUO252fG3ErJxy5mm0g1VWwvZiTse0OZ4CUqSmOrqndJBv-NL5GZfilS95gMptc5G4Vis306baRQpWG7Btn8b82Du98aSVje5309t0eJYYH8vhRzMo3fi2oZx0X3g"
        },
        body: JSON.stringify()
    })
    .then(response => response.json());
}
