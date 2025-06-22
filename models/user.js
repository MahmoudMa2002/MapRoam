const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

// User schema with email field
const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

// Add username and password hashing & authentication methods via passport-local-mongoose plugin
UserSchema.plugin(passportLocalMongoose);

// Export the User model
module.exports = mongoose.model('User', UserSchema);
