const Mongoose = require('app/services/Mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const schema = new Mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Введите имя']
    },
    login: {
        type: String,
        required: [true, 'Введите логин'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Введите пароль']
    },
    photo: {
        type: String
    }
});

schema.pre('save', function(next) {

    const user = this;

    if( ! user.isModified('password')) {
        return next();
    }

    bcrypt.genSalt(saltRounds, (err, salt) => {

        if(err) {
            return next(err);
        }

        bcrypt.hash(user.password, salt, (err, hash) => {

            if(err) {
                return next(err);
            }

            user.password = hash;

            next();
        });

    });

});

schema.statics.authenticate = (login, password, callback) => {

    User.findOne({login: login}, (err, user) => {

        if( ! user) {
            return callback(new Error('Неправильный логин или пароль'));
        }

        bcrypt.compare(password, user.password, (err, result) => {

            if(result === true) {
                return callback(null, user);
            } else {
                return callback(new Error('Неправильный логин или пароль'));
            }

        });

    });

};

const User = Mongoose.model('User', schema);

module.exports = User;