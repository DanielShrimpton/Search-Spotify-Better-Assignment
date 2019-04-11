document.getElementById('send_btn').onclick = search; // This gets the id of the submit button and onclick will run the function search()

function Switch(type){

	document.getElementById('searchDropdown').innerText = type;
	change();

}

function search(evt){

	evt.preventDefault();
	var search = document.getElementById('txt_field').value; // This gets the value of the search bar
	var type = document.getElementById('searchDropdown').innerText.toLowerCase();
	var type2 = type.substring(0, type.length-1);

	fetch('/search', {
		headers: {text: search, Type: type2}
	})
	// I found this example to create a table from this website
	// https://www.encodedna.com/javascript/populate-json-data-to-html-table-using-javascript.htm
		.then(response => response.json())
		.then(function(data) {

			if (data.error){

				console.log(data);
				document.getElementById('content').innerHTML = 'Error 500, internal server error, try again';
				return null;

			}
			var table = document.createElement('table');

			if (type == 'albums'){

				for (var i = 0; i < data[type].items.length; i++){

					var tr = table.insertRow(-1);

					var tabCell = tr.insertCell(-1);
					tabCell.innerHTML = data[type].items[i].name;

					var tabCell2 = tr.insertCell(-1);
					tabCell2.innerHTML = data[type].items[i].artists[0].name;

					// var tabCell3 = tr.insertCell(-1);
					// tabCell3.innerHTML = data[type].items[i].album.name;

				}

				var divContainer = document.getElementById('content');
				divContainer.innerHTML = '';
				divContainer.appendChild(table);

			} else if (type == 'artists') {

				for (var i = 0; i < data[type].items.length; i++){

					var tr = table.insertRow(-1);

					var tabCell = tr.insertCell(-1);
					tabCell.innerHTML = data[type].items[i].name;

					var tabCell2 = tr.insertCell(-1);
					tabCell2.innerHTML = data[type].items[i].genres;

					try {

						var tabCell3 = tr.insertCell(-1);
						tabCell3.innerHTML = '<img src='+data[type].items[i].images[0].url+' height="128px">';

					} catch(err) {

						null;

					}

				}

				var divContainer = document.getElementById('content');
				divContainer.innerHTML = '';
				divContainer.appendChild(table);

			} else {

				for (var i = 0; i < data[type].items.length; i++){

					var tr = table.insertRow(-1);

					var tabCell = tr.insertCell(-1);
					tabCell.innerHTML = data[type].items[i].name;

					var tabCell2 = tr.insertCell(-1);
					tabCell2.innerHTML = data[type].items[i].album.artists[0].name;

					var tabCell3 = tr.insertCell(-1);
					tabCell3.innerHTML = data[type].items[i].album.name;

				}

				var divContainer = document.getElementById('content');
				divContainer.innerHTML = '';
				divContainer.appendChild(table);

			}
			document.getElementsByTagName('table')[0].setAttribute('cellpadding', '10');
			document.getElementsByTagName('table')[0].setAttribute('class', 'text-white');

		})
		.catch(error => console.error(error));

}

function change(){

	var elements = ['Tracks', 'Artists', 'Albums'];
	var current = document.getElementById('searchDropdown').innerText;
	for (var i = 0; i < elements.length; i++){

		$('#'+elements[i]).css('display', 'block');

	}
	$('#'+current).hide();

}

document.addEventListener('DOMContentLoaded', function(){

	Switch('Tracks');

	fetch('/details')
		.then(response => response.json())
		.then(function(data){

			// data = data.json();
			if (data.display_name) {

				document.getElementById('navbarDropdown').innerHTML = 'Signed in as ' + data.display_name;
				document.getElementById('visitProfile').href = data.link;
				$('#login').hide();
				$('#loggedin').show();

			}
			else {

				// console.log(data);
				$('#login').show();
				$('#loggedin').hide();

			}

		});

});