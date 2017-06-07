var mongoose=require('mongoose');

var userSchema = mongoose.Schema({
    username: String,
    password: String,
    interest1: String,
    interest2: String,
    interest3: String,
    interest4: String,
    url_image: String
});

var user = mongoose.model('User', userSchema);
module.exports = user;