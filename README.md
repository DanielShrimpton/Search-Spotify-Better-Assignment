# Search-Spotify-Better README
This documentation is here to give a brief insight into how the API and this example works. [Here](https://search-spotify-better.herokuapp.com/out/index.html) is a link to a more in-depth documentation.
# server.js
```Javascript
    const app = require('./app').app;

    app.listen(process.env.PORT || 8090);
```

This is an example server file that uses the `app.js` file's export and runs a server listening on either the supplied port in the environment variables or port 8090.

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