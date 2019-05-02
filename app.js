const express = require('express');
const cors = require('cors');
const XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;
require('dotenv').config();


const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = process.env.REDIRECT_URI;

const app = express();

passport.serializeUser(serial);

/**
 * It serializes the User
 * @param {*} user user object passed from passport
 * @param {*} done a callback function
 */
function serial(user, done){

	done(null, user);

}

passport.deserializeUser(deserial);

/**
 * Deserializes the User
 * @param {*} obj the object returned by the login of passport.use
 * @param {*} done a callback function
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
	passUse)
);

/**
 * The function used in passport.use to return stuff.
 * @param {*} accessToken accessToken returned from spotify login
 * @param {*} refreshToken refreshToken returned from spotify login
 * @param {*} expires_in the time in which the accessToken expires
 * @param {*} profile the users data
 * @param {*} done a callback function
 * @returns {*} returns the callback function
 */
function passUse(accessToken, refreshToken, expires_in, profile, done) {

	return done(null, {user:profile, accessToken: accessToken, refreshToken: refreshToken});

}

app.use(session({
	store: new FileStore(),
	secret: 'Y2jkcC7QB4VbCRYl',
	resave: false,
	saveUninitialized: false

}));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static('client'))
	.use(cors());

app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'], showDialog: true }));
app.get('/auth/spotify/callback', passport.authenticate('spotify', {failureRedirect: '/'}), authCallback);
app.get('/logout', logout);
app.get('/details', details);
app.get('/search', search);

/**
 * Redirects to the homepage after a successful login.
 * @param {Object} req Request JSON
 * @param {Object} res Response JSON
 */
function authCallback(req, res) {

	res.redirect('/');

}

/**
 * The logout function is called when the client fetches /logout. It clears the current session so removes the details of the currently logged in user.
 * I had to implement this as req.logout() doesn't work. It then redirects to the home page.
 * @param {Object} req Request JSON
 * @param {Object} res Response JSON
 */
function logout(req, res) {

	// console.log(req.session.destroy.toString());
	req.session.destroy(function (err){

		if (err){

			console.error(err);
			res.sendStatus(500);

		} else {

			console.log('Logged out');
			res.redirect('/');

		}

	});

}

/**
 * This function is used to check whether the currently stored login details in the session are still authenticated. If they are then it sends back the display name and the link. If not it sends back the code 204.
 * @param {Object} req Request JSON
 * @param {Object} res Response JSON
 */
function details(req, res) {

	if (req.isAuthenticated()) {

		res.status(200);
		res.send({display_name: req.user.user._json.display_name, link: req.user.user._json.external_urls.spotify});

	} else {

		res.sendStatus(204);

	}


}

/**
 * This is the function that is used to collect all the information that is required to be sent to the getHttp function that calls the Spotifty API. It trys to collect the accesstoken, users country, the text supplied in the header as well
 * as the type and then calls httpGet and returns that with the status 200 to show it completed successfully. If there is an error then it returns error code 500 for a server error.
 * @param {Object} req Request JSON
 * @param {Object} res Response JSON
 */
function search(req, res){

	try {

		let accessToken = req.user.accessToken;
		let market = req.user.user.country;
		let text = req.get('text'),
			type = req.get('Type');
		let content = httpGet(text, type, market, accessToken);
		res.status(200);
		res.send(content);

	}
	catch (err) {

		console.error(err);
		res.status(500);
		res.send(err);

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

	const xmlHttp = new XMLHttpRequest();
	let url = 'https://api.spotify.com/v1/search?query='+query+'&type='+type+'&limit=50&market='+market;
	xmlHttp.open('GET', url, false);
	xmlHttp.setRequestHeader('Authorization', 'Bearer '+accessToken);
	xmlHttp.send(null);
	return xmlHttp.responseText;

}

module.exports = {app, serial, deserial, authCallback, logout, details, search, passUse};