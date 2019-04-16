var express = require('express');
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
require('dotenv').config;


var app = express();

app.use(express.static('client'))
	.use(cors())
	.use(cookieParser());

// ALL OF THE FEATURES FOR PAGE TO WORK


app.get('/logout', function(req, res) {

	process.env.ACCESS_TOKEN = '';
	process.env.REFRESH_TOKEN = '';
	process.env.USER = '';
	process.env.LINK = '';
	process.env.MARKET = '';
	res.clearCookie();
	res.redirect('/');

});


app.get('/details', function(req, res) {

	res.send({
		display_name: process.env.USER,
		link: process.env.LINK
	});

});

app.get('/search', function(req, res){

	var text = req.get('text'),
		type = req.get('Type');
	var url = 'https://api.spotify.com/v1/search?query='+text+'&type='+type+'&limit=50&market='+process.env.MARKET;
	var content = httpGet(url);
	res.send(content);

});

function httpGet(url){

	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', url, false);
	xmlHttp.setRequestHeader('Authorization', 'Bearer '+process.env.ACCESS_TOKEN);
	xmlHttp.send(null);
	return xmlHttp.responseText;

}


// SPOTIFY AUTH FUNCTIONS FROM HERE ON

var client_id = '8f456770a0c5460eaff16e6476344bc5';
var client_secret = '00fa8fe4d3e8479eb1509bcdc03c7800';
// var redirect_uri = 'http://127.0.0.1:8090/callback';
// var redirect_uri = 'http://localhost:8090/callback';
var redirect_uri = 'https://search-spotify-better.herokuapp.com/callback';

// SPOTIFY FUNCTION

var generateRandomString = function(length) {

	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {

		text += possible.charAt(Math.floor(Math.random() * possible.length));

	}
	return text;

};


var stateKey = 'spotify_auth_state';


app.get('/login', function(req, res) {

	var state = generateRandomString(16);
	res.cookie(stateKey, state);

	// your application requests authorization
	var scope = 'user-read-private user-read-email';
	res.redirect('https://accounts.spotify.com/authorize?' +
		querystring.stringify({
			response_type: 'code',
			client_id: client_id,
			scope: scope,
			redirect_uri: redirect_uri,
			state: state,
			show_dialog: true
		}));

});

app.get('/callback', function(req, res) {

	// your application requests refresh and access tokens
	// after checking the state parameter

	var code = req.query.code || null;
	var state = req.query.state || null;
	var storedState = req.cookies ? req.cookies[stateKey] : null;

	if (state === null || state !== storedState) {

		res.redirect('/#' +
			querystring.stringify({
				error: 'state_mismatch'
			}));

	} else {

		res.clearCookie(stateKey);
		var authOptions = {
			url: 'https://accounts.spotify.com/api/token',
			form: {
				code: code,
				redirect_uri: redirect_uri,
				grant_type: 'authorization_code'
			},
			headers: {
				'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
			},
			json: true
		};

		request.post(authOptions, function(error, response, body) {

			if (!error && response.statusCode === 200) {

				var access_token = body.access_token,
					refresh_token = body.refresh_token;
				process.env.ACCESS_TOKEN = access_token; // Added in to create environment variables so server can acces
				process.env.REFRESH_TOKEN = refresh_token;
				// console.log(access_token);

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {

					console.log(body);  // where body is info like Username, product e.g. premium, country etc.
					process.env.USER = body.display_name; // Another environment variable for server to use
					process.env.MARKET = body.country;
					process.env.LINK = body.external_urls.spotify;

				});

				// we can also pass the token to the browser to make requests from there
				// res.redirect('/#' +
				// 	querystring.stringify({
				// 		access_token: access_token,
				// 		refresh_token: refresh_token
				// 	}));
				res.redirect('/');

			} else {

				res.redirect('/#' +
					querystring.stringify({
						error: 'invalid_token'
					}));

			}

		});

	}

});


app.get('/refresh_token', function(req) {

	// requesting access token from refresh token
	var refresh_token = req.query.refresh_token;
	var authOptions = {
		url: 'https://accounts.spotify.com/api/token',
		headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
		form: {
			grant_type: 'refresh_token',
			refresh_token: refresh_token
		},
		json: true
	};

	request.post(authOptions, function(error, response, body) {

		if (!error && response.statusCode === 200) {

			var access_token = body.access_token;
			process.env.ACCESS_TOKEN = access_token; // ADDED IN SO SERVER CAN ACCESS

		}

	});

});

// app.listen(8090);
app.listen(process.env.PORT || 8090);
