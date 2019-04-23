const app = require('./app').app;

// app.listen(8090);
app.listen(process.env.PORT || 8090);
