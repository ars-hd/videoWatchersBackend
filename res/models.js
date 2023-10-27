const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    ip_address: String,
    role: String,
    timestamp: Date,
    credit: String
})
const User = mongoose.model('User', userSchema);

const tokenSchema = new mongoose.Schema({
    key: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    timestamp: Date
})
const Token = mongoose.model('Token', tokenSchema);


const videoSchema = new mongoose.Schema({
    title: String,
    url: String,
    status: String,
    reward: String,
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    watchers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    timestamp: Date
})
const Video = mongoose.model('Video', videoSchema);


module.exports = {
    User,
    Token,
    Video
}