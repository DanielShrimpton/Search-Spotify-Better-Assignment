var express = require('express');
// var request = require('request');
var cors = require('cors');
// var querystring = require('querystring');
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

passport.serializeUser(serial);

/**
 * It serializes the User
 * @param {*} user user
 * @param {*} done done
 */
function serial(user, done){

	done(null, user);

}

passport.deserializeUser(deserial);

/**
 * Deserializes the Uesr
 * @param {*} obj the object returned by the login of passport.use
 * @param {*} done done
 */
function deserial(obj, done){

	done(null, obj);

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

app.use(express.static('client'))
	.use(cors())
	.use(cookieParser());


app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'], showDialog: true }));
app.get('/auth/spotify/callback', passport.authenticate('spotify', {failureRedirect: '/'}), authCallback);
app.get('/logout', logout);
app.get('/details', details);
app.get('/search', search);

/**
 * Redirects to the homepage after a successful login.
 * @param {req} req req
 * @param {res} res res
 */
function authCallback(req, res) {

	res.redirect('/');

}

/**
 * The logout function is called when the client fetches /logout. It clears the current session so removes the details of the currently logged in user.
 * I had to implement this as req.logout() doesn't work. It then redirects to the home page.
 * @param {req} req req
 * @param {res} res res
 */
function logout(req, res) {

	req.session.destroy(function (err){

		if (err){

			console.error(err);
			res.sendStatus(500);

		}
		console.log('Logged out');
		res.redirect('/');

	});

}

/**
 * This function is used to check whether the currently stored login details in the session are still authenticated. If they are then it sends back the display name and the link. If not it sends back the code 204.
 * @param {req} req req
 * @param {res} res res
 */
function details(req, res) {

	// console.log(req.isAuthenticated());
	if (req.isAuthenticated()) {

		res.status(200).send({display_name: req.user.user._json.display_name, link: req.user.user._json.external_urls.spotify});

	} else {

		res.sendStatus(204);

	}


}

/**
 * This is the function that is used to collect all the information that is required to be sent to the getHttp function that calls the Spotifty API. It trys to collect the accesstoken, users country, the text supplied in the header as well
 * as the type and then calls httpGet and returns that with the status 200 to show it completed successfully. If there is an error then it returns error code 500 for a server error.
 * @param {req} req req
 * @param {res} res res
 */
function search(req, res){

	try {

		var accessToken = req.user.accessToken;
		var market = req.user.user.country;
		var text = req.get('text'),
			type = req.get('Type');
		var content = httpGet(text, type, market, accessToken);
		res.status(200).send(content);

	}
	catch (err) {

		// console.error(err);
		res.status(500).send(err);

	}


}

/**
 * This function will send a GET request to the spotify api using the search term, search type, users country and access token to construct the url to send the GET request to
 * @param {String} query The search term
 * @param {String} type The type of search, e.g. artist, album etc.
 * @param {String} market The country of the user
 * @param {String} accessToken the access token provided by spotify auth
 * @returns {Text} the http response which is then converted in the client.js
 */
function httpGet(query, type, market, accessToken){

	// console.log(accessToken);
	var xmlHttp = new XMLHttpRequest();
	var url = 'https://api.spotify.com/v1/search?query='+query+'&type='+type+'&limit=50&market='+market;
	xmlHttp.open('GET', url, false);
	xmlHttp.setRequestHeader('Authorization', 'Bearer '+accessToken);
	xmlHttp.send(null);
	return xmlHttp.responseText;

}


// app.get('/refresh_token', function(req) {

// 	// requesting access token from refresh token
// 	var refresh_token = req.query.refresh_token;
// 	var authOptions = {
// 		url: 'https://accounts.spotify.com/api/token',
// 		headers: { 'Authorization': 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64')) },
// 		form: {
// 			grant_type: 'refresh_token',
// 			refresh_token: refresh_token
// 		},
// 		json: true
// 	};

// 	request.post(authOptions, function(error, response, body) {

// 		if (!error && response.statusCode === 200) {

// 			var access_token = body.access_token;

// 		}

// 	});

// });

module.exports = app;