# Search-Spotify-Better README
This documentation is here to give a brief insight into how the API and this example works. [Here](https://search-spotify-better.herokuapp.com/out/app.js.index.html) is a link to a more in-depth documentation for the server, and [here](https://search-spotify-better.herokuapp.com/out/client.js.index.html) for the client-side documentation.

The purpose of this example is to connect to the Spotify API using a client secret token, a client id and a redirect url. Once the authentication has been verified, the api then connects to the Spotify service to search for tracks, albums or artists.

There is an example of this app being hosted at [https://search-spotify-better.herokuapp.com/](https://search-spotify-better.herokuapp.com/) but if you want to set up/test this example yourself, you will need to create an app using the Spotify developer dashboard, found [here](https://developer.spotify.com/dashboard) and place the required variables in a `.env` file. More explained on that later.

# Server-Side Documentation

# server.js
```Javascript
    const app = require('./app').app;

    app.listen(process.env.PORT || 8090);
```

This is an example server file that uses the `app.js` file's export and runs a server listening on either the supplied port in the environment variables or port 8090. The reason that `server.js` and `app.js` are separated is so that `app.js` can be fully jest tested and also so that a custom server can be built around the use of this API.

# app.js
This is the main file for the api service. It is where all of the `GET` requests, authentication through spotify, session handling and main functions are dealt with and contained. 

## Required modules

```Javascript
    var express = require('express');
    var cors = require('cors');
    var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
    var session = require('express-session');
    var FileStore = require('session-file-store')(session);
    var passport = require('passport');
    var SpotifyStrategy = require('passport-spotify').Strategy;
    require('dotenv').config();
```
These are the required modules that are needed for all the functionality of the api to work. They are all automatically installed with `npm install`.

## Http GET methods

```Javascript
    app.get('/auth/spotify', passport.authenticate('spotify', { scope: ['user-read-email', 'user-read-private'], showDialog: true }));
    app.get('/auth/spotify/callback', passport.authenticate('spotify', {failureRedirect: '/'}), authCallback);
    app.get('/logout', logout);
    app.get('/details', details);
    app.get('/search', search);
```
These are all the GET methods for the main functionality of the website.

`/auth/spotify` calls the authenticate function for the Spotify method supplied by the `Passport` module. This makes authentication really easy and helps with session handling for multiple users. 

`/auth/spotify/callback` is the callback URL that is assigned in the app settings on [developer.spotify.com](https://developer.spotify.com/dashboard) which is where you also get your client secret from. Upon correct completion from the authentication from Spotify, it will then call the callback function `authCallback`. 

The last three GET methods all call the named functions which are explained later.

## Environment variables
Using the `dotenv` package this allows the app to take advantage of environment variables that can be supplied by the user. There needs to be a `.env` file in the local directory where `app.js` is located (or an online deployment may have a built in solution for this). This means that you can distribute your application without giving away the client secret. #
```Javascript
    const client_id = process.env.CLIENT_ID;
    const client_secret = process.env.CLIENT_SECRET;
    const redirect_uri = process.env.REDIRECT_URI;
```
This is an example of the ones included in this app. They are accessed through using `process.env.VARIABLE_IN_CAPS`.

## Functions
There are eight functions that are called in this file. They are:
```
serial, deserial, passUse, authCallback, logout, details, search, httpGet
```
In short, serial is a function for the serialization of a user, deserial is for the opposite of this.

passUse is a function that returns information gathered from the passport-Spotify authentication process.

authCallback is a function that is called upon return from Spotify authentication.

logout is a function to logout the current user.

details is a function to return the details of the currently logged in user.

search is a function used to ready data for passing to the httpGet function

httpGet is a function used to perform a Spotify search using their web API.

A more detailed look into these functions and overall view of this server-side code can be found at the link at the top of the page

## Authentication
For this app I am using the Spotify method of passportjs. It is useful as it helps to handle authentication as well as set up multiple sessions for multiple users. 
```Javascript
const passport = require('passport');
const SpotifyStrategy = require('passport-spotify').Strategy;

passport.serializeUser(serial);
passport.deserializeUser(deserial);

passport.use(
	new SpotifyStrategy({
		clientID: client_id,
		clientSecret: client_secret,
		callbackURL: redirect_uri
	},
	passUse)
);

app.use(session({
	store: new FileStore(),
	secret: 'Y2jkcC7QB4VbCRYl',
	resave: false,
	saveUninitialized: false

}));
app.use(passport.initialize());
app.use(passport.session());

```
where passUse is my own custom function for dealing with the returned data. It includes the usage of session to create a new local file to store multiple users sessions. It helps with making the workflow easier and makes code easier to read.

# Client-Side Documentation
This is a brief look at how the example works.

There are two main files to this example, `index.html` and `client.js` both contained within the client folder. This example is a single page website with dynamically updated html through `client.js`. When the page loads, it has a search bar at the top, a  search button, a login button, a selection for search type and a home button (the name on the navbar).

 When the user requests to login, the website is redirected to the Spotify Authentication site, as this is the only way to authenticate with Spotify. It then returns to the page and displays the Username in the top right as a dropdown, giving the option to logout or view their profile on Spotify. This information about who is logged in is sent in a JSON response from the server (explained more in the API documentation).

 Once logged in, the user in the current session is now authenticated to make search requests to the Spotify API. They do this by choosing the search type next to the search bar and then typing the search query and either pressing enter or pressing the search button. This will then send this search query and type to the server which will then deal with the request. It then returns the results in a JSON response which is then dealt with and dynamically updated into a table using javascript to change/add html as required. 

 If the search returns no results it will tell you so, by handling the error correctly. If there is no search term it will also tell you to enter a search term. If the server disconnects for whatever reason it also handles that gracefully by alerting the user and displaying 'Server down, please try again later'. 

 For a more detailed look at the functions used in `client.js` follow the link at the top of the page

# Licensing

Spotify's Licensing -> [https://developer.spotify.com/terms/](https://developer.spotify.com/terms/)

# Known bugs

 When creating or loading a session, `Error: EPERM: operation not permitted, rename 'path\to\file.json.numbers' -> 'path/to/file.json` is an operating system error, even though it completes successfully. It is not due to my code, it is part of the session Filestore.
 
 When destroying a session on logout `[session-file-store] will retry, error on last attempt: Error: ENOENT: no such file or directory, open` is an error in the server console which is again another error with sessions Filestore. 