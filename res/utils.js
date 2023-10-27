const { Token, User } = require('./models');

async function get_or_create_token(_id) {
    const token = await Token.findOne({ user: _id });
    if(token) {
        return token.key;
    } else {
        const new_token = new Token({
            user: _id,
            key: _id
        });
        await new_token.save();
        return new_token;
    }
}

async function get_user_by_token(token) {
    const user = await Token.findOne({ key: token });
    if(user) {
        const profile = await User.findOne({ _id: user.user });
        return profile;
    } else {
        return null;
    }
}

module.exports = {
    get_or_create_token,
    get_user_by_token
}