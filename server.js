var express = require('express');
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var SpotifyWebApi = require('spotify-web-api-node');
require('dotenv').config;

var client_id = '8f456770a0c5460eaff16e6476344bc5';
var client_secret = '00fa8fe4d3e8479eb1509bcdc03c7800';
// var redirect_uri = 'http://127.0.0.1:8090/callback';
var redirect_uri = 'http://localhost:8090/callback';

var spotifyApi = new SpotifyWebApi();


var generateRandomString = function(length) {

	var text = '';
	var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

	for (var i = 0; i < length; i++) {

		text += possible.charAt(Math.floor(Math.random() * possible.length));

	}
	return text;

};


var stateKey = 'spotify_auth_state';

var app = express();

app.use(express.static('client'))
	.use(cors())
	.use(cookieParser());

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
				process.env.ACCESS_TOKEN = access_token;
				process.env.REFRESH_TOKEN = refresh_token;
				spotifyApi.setAccessToken(access_token);

				var options = {
					url: 'https://api.spotify.com/v1/me',
					headers: { 'Authorization': 'Bearer ' + access_token },
					json: true
				};

				// use the access token to access the Spotify Web API
				request.get(options, function(error, response, body) {

					console.log(body);  // where body is info like Username, product e.g. premium, country etc.
					process.env.USER = body.display_name;

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
			process.env.ACCESS_TOKEN = access_token;
			// res.send({
			// 	'access_token': access_token
			// });

		}

	});

});


app.get('/logout', function(req, res) {

	process.env.ACCESS_TOKEN = '';
	process.env.REFRESH_TOKEN = '';
	process.env.USER = '';
	res.clearCookie();
	res.redirect('/');

});


app.get('/details', function(req, res) {

	res.send({display_name: process.env.USER});

});


app.get('/search', function(req, res) {

	var text = req.get('text');
	var sending = spotifyApi.searchTracks('track:'+text)
		.then(function(data) {

			// console.log(JSON.stringify(data.body));
			return data.body.tracks;

		}, function(err) {

			console.log(err);

		});

	// console.log(sending);
	res.send(sending.then(function(result){

		return result;

	}));
	// res.send(sending);

});


app.listen(8090);
