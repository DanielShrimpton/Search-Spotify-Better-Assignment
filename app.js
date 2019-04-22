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

passport.serializeUser(function(user, done){

	done(null, user);

});

passport.deserializeUser(function(obj, done){

	done(null, obj);

});

/**
 * This function checks if it is authenticated and if it is then it returns next(), else it sends a JSON so the page knows weather to show login or logout
 * @param {req} req req
 * @param {res} res res
 * @param {next} next next()
 * @returns {next} next() or a res.send
 */
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




app.get('/logout', function(req, res) {

	req.session.destroy(function (err){

		if (err){

			console.error(err);

		}

		res.redirect('/');

	});

});


app.get('/details', ensureAuthenticated, function(req, res) {

	// console.log(req.isAuthenticated());
	res.send({display_name: req.user.user._json.display_name, link: req.user.user._json.external_urls.spotify});

});


app.get('/search', function(req, res){

	try {

		var accessToken = req.user.accessToken;
		var market = req.user.user.country;
		var text = req.get('text'),
			type = req.get('Type');
		var content = httpGet(text, type, market, accessToken);
		res.send(content);

	}
	catch (err) {

		console.log({error: err});
		res.send({error: err});

	}


});

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