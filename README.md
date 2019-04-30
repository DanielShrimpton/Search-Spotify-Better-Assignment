# Search-Spotify-Better README
This documentation is here to give a brief insight into how the API and this example works. [Here](https://search-spotify-better.herokuapp.com/out/index.html) is a link to a more in-depth documentation.
## server.js
```Javascript
    const app = require('./app').app;

    app.listen(process.env.PORT || 8090);
```

This is an example server file that uses the `app.js` file's export and runs a server listening on either the supplied port in the environment variables or port 8090.

## app.js
This is the main file for the api service. It is where all of the 