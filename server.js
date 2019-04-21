const app = require('./app.js');

// app.listen(8090);
app.listen(process.env.PORT || 8090);
