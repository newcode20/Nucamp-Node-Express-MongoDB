const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    admin: { //when a new user document is created the admin flag will be set to false
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('User', userSchema);
//from the first argument the collection will be named users