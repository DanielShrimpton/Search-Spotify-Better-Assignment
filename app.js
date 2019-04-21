var express = require('express');
var request = require('request');
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var SpotifyStrategy = require('passport-spotify').Strategy;
require('dotenv').config;


var client_id = '8f456770a0c5460eaff16e6476344bc5';
var client_secret = '00fa8fe4d3e8479eb1509bcdc03c7800';
// var redirect_uri = 'http://127.0.0.1:8090/callback';
// var redirect_uri = 'http://localhost:8090/callback';
// var redirect_uri = 'https://search-spotify-better.herokuapp.com/callback';
var redirect_uri = 'https://search-spotify-better.herokuapp.com/auth/spotify/callback';
// var redirect_uri = 'http://localhost:8090/auth/spotify/callback';

var app = express();

passport.serializeUser(function(user, done){

	console.log(user);
	done(null, user);

});

passport.deserializeUser(function(obj, done){

	done(null, obj);

});

function ensureAuthenticated(req, res, next) {

	if (req.isAuthenticated()) {

		return next();

	}
	res.send({display_name: false, link: false});

}

passport.use(
	new SpotifyStrategy({
		clientID: client_id,
		clientSecret: client_secret,
		callbackURL: redirect_uri
	},
	function(accessToken, refreshToken, expires_in, profile, done) {

		process.nextTick(function(){

			return done(null, {user:profile, accessToken: accessToken, refreshToken: refreshToken});

		});

	})
);

app.use(session({
	store: new FileStore(),
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: false

}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/spotify', passport.authenticate('spotify', {
	scope: ['user-read-email', 'user-read-private'], showDialog: true
}), function() {
	// this function won't be run
});

app.get('/auth/spotify/callback', passport.authenticate('spotify', {failureRedirect: '/'}), function(req, res) {

	res.redirect('/');

});

app.use(express.static('client'))
	.use(cors())
	.use(cookieParser());

// ALL OF THE FEATURES FOR PAGE TO WORK

// USEFUL FOR LEARNING FROM

// app.get('/loginn', (req, res) => {

// 	console.log('Inside GET /longin callback function');
// 	console.log(req.sessionID);
// 	res.send('\nYou posted to the login page!\n');

// });

// app.post('/loginn', (req, res) => {

// 	console.log('Inside POST /login callback function');
// 	console.log(req.body);
// 	res.send('\nYou posted to the login page!\n');

// });


app.get('/logout', function(req, res) {

	req.session.destroy(function (err){

		res.redirect('/');

	});

});


app.get('/details', ensureAuthenticated, function(req, res) {

	console.log(req.isAuthenticated());
	res.send({display_name: req.user.user._json.display_name, link: req.user.user._json.external_urls.spotify});

});

app.get('/search', function(req, res){

	var accessToken = req.user.accessToken;
	var text = req.get('text'),
		type = req.get('Type');
	var url = 'https://api.spotify.com/v1/search?query='+text+'&type='+type+'&limit=50&market='+req.user.user.country;
	var content = httpGet(url, accessToken);
	res.send(content);

});

function httpGet(url, accessToken){

	console.log(accessToken);
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open('GET', url, false);
	xmlHttp.setRequestHeader('Authorization', 'Bearer '+accessToken);
	xmlHttp.send(null);
	return xmlHttp.responseText;

}


// SPOTIFY AUTH FUNCTIONS FROM HERE ON



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

// app.get('/callback', function(req, res) {

// 	// your application requests refresh and access tokens
// 	// after checking the state parameter

// 	var code = req.query.code || null;
// 	var state = req.query.state || null;
// 	var storedState = req.cookies ? req.cookies[stateKey] : null;

// 	if (state === null || state !== storedState) {

// 		res.redirect('/#' +
// 			querystring.stringify({
// 				error: 'state_mismatch'
// 			}));

// 	} else {

// 		res.clearCookie(stateKey);
// 		var authOptions = {
// 			url: 'https://accounts.spotify.com/api/token',
// 			form: {
// 				code: code,
// 				redirect_uri: redirect_uri,
// 				grant_type: 'authorization_code'
// 			},
// 			headers: {
// 				'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
// 			},
// 			json: true
// 		};

// 		request.post(authOptions, function(error, response, body) {

// 			if (!error && response.statusCode === 200) {

// 				var access_token = body.access_token,
// 					refresh_token = body.refresh_token;
// 				process.env.ACCESS_TOKEN = access_token; // Added in to create environment variables so server can acces
// 				process.env.REFRESH_TOKEN = refresh_token;
// 				// console.log(access_token);

// 				var options = {
// 					url: 'https://api.spotify.com/v1/me',
// 					headers: { 'Authorization': 'Bearer ' + access_token },
// 					json: true
// 				};

// 				// use the access token to access the Spotify Web API
// 				request.get(options, function(error, response, body) {

// 					console.log(body);  // where body is info like Username, product e.g. premium, country etc.
// 					process.env.USER = body.display_name; // Another environment variable for server to use
// 					process.env.MARKET = body.country;
// 					process.env.LINK = body.external_urls.spotify;

// 				});

// 				// we can also pass the token to the browser to make requests from there
// 				// res.redirect('/#' +
// 				// 	querystring.stringify({
// 				// 		access_token: access_token,
// 				// 		refresh_token: refresh_token
// 				// 	}));
// 				res.redirect('/');

// 			} else {

// 				res.redirect('/#' +
// 					querystring.stringify({
// 						error: 'invalid_token'
// 					}));

// 			}

// 		});

// 	}

// });


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

module.exports = app;