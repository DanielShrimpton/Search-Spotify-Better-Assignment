var mongoose = require('mongoose');
var Schema = mongoose.Schema;

const UserSchema = new Schema({
	name: String,
	email: String,
	username: String,
	provide: String,
	spotify: String
}, {collection: 'Users'});

UserSchema.methods.Create = function(newUser, callback){

	newUser.name = 'HI';
	newUser.save(callback);

};

var User = mongoose.model('User', UserSchema);
module.exports = User;