//window.addEventListener('click', function(event){
//  fetch('http://127.0.0.1:8090/list')
//  .then(response => response.text())
//  .then(body => document.getElementById('content').innerHTML=body)
//});

//postData('https://api.spotify.com/v1/audio-features/06AKEBrKUckW0KREUWRnvT')
////  .then(data => console.log(JSON.stringify(data))) // JSON-string from `response.json()` call
//  .then(data => document.getElementById('content').innerHTML = data.tempo)
//  .catch(error => console.error(error));
// 
// function postData(url = ''){
//   return fetch(url, {
//     headers: {
//       'Authorization': 'Bearer BQCKyRsLzOGGbWmDnz9L864u-IDkCZSV02KBWc0zhLqj_F0eu_5bezhyZLs22haUXmLV10hV-nv8SbZVcZxF0J6CP2HBd8RtOX7eTBQMqPUwpJ1VfkbRZ6Ylx4yqg1igX0VCtapT-8P6WIQKwNnqsiEcAwk83EIhm6pxEjlx-k-WyVj_27boyV429IACtAuK9XcFSQ'
//     },
//     body: JSON.stringify()
//   })
//     .then(response => response.json());
// }

document.getElementById('send_btn').onclick = search; // This gets the id of the submit button and onclick will run the function search()

function search(){
  submit() // This runs a function which returns an API request for songs with the title of the search bar

  // I found this example to create a table from this website
  // https://www.encodedna.com/javascript/populate-json-data-to-html-table-using-javascript.htm

    .then(function(data) {
      var table = document.createElement('table');

      for (var i = 0; i < data.tracks.items.length; i++){
        tr = table.insertRow(-1);

        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data.tracks.items[i].name;

        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data.tracks.items[i].album.artists[0].name;

        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = data.tracks.items[i].album.name;
      }

      var divContainer = document.getElementById('content');
      divContainer.innerHTML = '';
      divContainer.appendChild(table);
    })
    .catch(error => console.error(error));
}

function submit(){
  var search = document.getElementById('txt_field').value; // This gets the value of the search bar
  var url = 'https://api.spotify.com/v1/search?q=name:'+search+'&type=track'; // Combines the search URL and the search criteria

  return fetch(url, {
    headers: {
      'Authorization': 'Bearer BQCKyRsLzOGGbWmDnz9L864u-IDkCZSV02KBWc0zhLqj_F0eu_5bezhyZLs22haUXmLV10hV-nv8SbZVcZxF0J6CP2HBd8RtOX7eTBQMqPUwpJ1VfkbRZ6Ylx4yqg1igX0VCtapT-8P6WIQKwNnqsiEcAwk83EIhm6pxEjlx-k-WyVj_27boyV429IACtAuK9XcFSQ'
    },
    body: JSON.stringify()
  })
    .then(response => response.json());
}
