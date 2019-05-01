# Search-Spotify-Better README
This documentation is here to give a brief insight into how the API and this example works. [Here](https://search-spotify-better.herokuapp.com/out/index.html) is a link to a more in-depth documentation.

The purpose of this example is to connect to the Spotify API using a client secret token, a client id and a redirect url. Once the authentication has been verified, the api then connects to the Spotify service to search for tracks, albums or artists.

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

A more detailed look into these functions and overall view of this server-side code can be found [here](https://search-spotify-better.herokuapp.com/out/index.html)

# Client-Side Documentation