document.getElementById('send_btn').onclick = search; // This gets the id of the submit button and onclick will run the function search()

/**
 * Changes the inner HTML of the dropdown to the selected type and then runs change()
 * @param {String} type The type to change to
 */
function Switch(type){

	document.getElementById('searchDropdown').innerText = type;
	change();

}

/**
 * Function that is called when the search button is pressed. It uses evt.preventDefault to stop an
 * automatic redirect and then will fetch the search results from the server at '/fetch' and then dynamically update the HTML according to the result.
 * @param {*} evt An event
 */
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
		// .then(response => response.json())
		.then(function(data) {

			console.log(data);

			if (data.error){

				console.log(data.error);
				if (data.error.status == 401 || data.error.status == 400){

					if (data.error.message == 'No search query') {

						document.getElementById('content').innerHTML = '';
						document.getElementById('content').innerHTML = '<h3>Please enter a search term</h3>';

					} else {

						$('#login').show();
						$('#loggedin').hide();
						document.getElementById('content').innerHTML = '';
						document.getElementById('content').innerHTML = '<h3>Please log in</h3>';

					}

				} else {

					document.getElementById('content').innerHTML = '';
					document.getElementById('content').innerHTML = data.error.status + ' ' + data.error.message;

				}
				return null;

			}

			if (data[type].items.length == 0){

				document.getElementById('content').innerHTML = '<h3>Sorry no results found, please try another search</h3>';
				return null;

			}

			var tbody = document.createElement('tbody');
			var thead = document.createElement('thead');

			if (type == 'albums'){

				var tr = thead.insertRow(-1);
				var cell = tr.insertCell(-1);
				cell.innerHTML = 'Album Name';
				cell = tr.insertCell(-1);
				cell.innerHTML = 'Artist';

				for (var i = 0; i < data[type].items.length; i++){

					tr = tbody.insertRow(-1);
					tr.setAttribute('class', 'clickable-row');
					tr.setAttribute('data-href', data[type].items[i].external_urls.spotify);

					var tabCell = tr.insertCell(-1);
					tabCell.innerHTML = data[type].items[i].name;

					var tabCell2 = tr.insertCell(-1);
					tabCell2.innerHTML = data[type].items[i].artists[0].name;

					// var tabCell3 = tr.insertCell(-1);
					// tabCell3.innerHTML = data[type].items[i].album.name;

				}

				var divContainer = document.getElementById('content');
				divContainer.innerHTML = '';
				divContainer.appendChild(thead);
				divContainer.appendChild(tbody);

			} else if (type == 'artists') {

				tr = thead.insertRow(-1);
				cell = tr.insertCell(-1);
				cell.innerHTML = 'Artist';
				cell = tr.insertCell(-1);
				cell.innerHTML = 'Genres';
				cell = tr.insertCell(-1);
				cell.innerHTML = 'Artist Art';

				for (i = 0; i < data[type].items.length; i++){

					tr = tbody.insertRow(-1);
					tr.setAttribute('class', 'clickable-row');
					tr.setAttribute('data-href', data[type].items[i].external_urls.spotify);

					tabCell = tr.insertCell(-1);
					tabCell.innerHTML = data[type].items[i].name;

					tabCell2 = tr.insertCell(-1);
					tabCell2.innerHTML = data[type].items[i].genres;

					try {

						var tabCell3 = tr.insertCell(-1);
						tabCell3.innerHTML = '<img src='+data[type].items[i].images[0].url+' height="128px">';

					} catch(err) {

						null;

					}

				}

				divContainer = document.getElementById('content');
				divContainer.innerHTML = '';
				divContainer.appendChild(thead);
				divContainer.appendChild(tbody);

			} else {

				tr = thead.insertRow(-1);
				cell = tr.insertCell(-1);
				cell.innerHTML = 'Track';
				cell = tr.insertCell(-1);
				cell.innerHTML = 'Artist';
				cell = tr.insertCell(-1);
				cell.innerHTML = 'Album';

				for (i = 0; i < data[type].items.length; i++){

					tr = tbody.insertRow(-1);
					tr.setAttribute('class', 'clickable-row');
					tr.setAttribute('data-href', data[type].items[i].external_urls.spotify);

					tabCell = tr.insertCell(-1);
					tabCell.innerHTML = data[type].items[i].name;

					tabCell2 = tr.insertCell(-1);
					tabCell2.innerHTML = data[type].items[i].album.artists[0].name;

					tabCell3 = tr.insertCell(-1);
					tabCell3.innerHTML = data[type].items[i].album.name;

				}

				divContainer = document.getElementById('content');
				divContainer.innerHTML = '';
				divContainer.appendChild(thead);
				divContainer.appendChild(tbody);

			}

			jQuery(document).ready(function($) {

				$('.clickable-row').click(function() {

					window.open($(this).data('href'), '_blank');

				});

			});

		})
		.catch(error => console.error(error));

}

/**
 * A function that goes through each option for the dropdown, makes them visible and then hides the current
 * selection so the appropriate ones are visible to choose from with no duplicates
 */
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

$(window).on('resize', function() {

	if($(window).width() > 400) {

		$('#body').addClass('limit1200');
		$('#body').removeClass('limit400');
		console.log('Big screen');

	} else {

		$('#body').removeClass('limit1200');
		$('#body').addClass('limit400');
		console.log('small screen');

	}

});