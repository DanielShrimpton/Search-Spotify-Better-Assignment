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
      "Authorization": "Bearer BQCETpcnl1FyREDNcDuavb769h6oDDoPJbji4rFP0XnryuqS23EQSUi2DJGt8kiMvV7UKI2u9wijqb5l0SQket7AS1PgbVZr06OyEIXgAlmHD8vCeTqAXgQzQnPVv9sVkWOLpe7vdljr5rS36QHlT0dvihSY-GSisPAPRg"
    },
    body: JSON.stringify()
  })
  .then(response => response.json());
}
