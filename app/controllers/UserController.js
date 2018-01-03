const User = require('app/models/User');

// Login action
module.exports.login = (req, res) => {

    res.render('login', {
        metaTitle: 'Вход'
    });

};

// Register action
module.exports.register = (req, res) => {

    res.render('register', {
        metaTitle: 'Регистрация'
    });

};

// Save action
module.exports.save = (req, res) => {

    const user = new User({
        name: req.body.name,
        login: req.body.login,
        password: req.body.password,
        photo: 'default.jpg'
    });

    user.save((err, user) => {

        if(err) {

            const listErrors = [];

            for(field in err.errors){
                listErrors.push(err.errors[field].message);
            }

            res.render('register', {
                metaTitle: 'Регистрация',
                listErrors: listErrors
            });

        } else {

            req.session.userId = user._id;

            res.redirect('/');

        }

    });

};

// Enter action
module.exports.enter = (req, res) => {

    const login = req.body.login;

    const password = req.body.password;

    User.authenticate(login, password, (err, user) => {

        if(user) {

            req.session.userId = user._id;

            res.redirect('/');

        } else {

            res.render('login', {
                metaTitle: 'Вход',
                errorMessage: err.message
            });

        }

    });

};

// Logout action
module.exports.logout = (req, res) => {

    req.session.destroy();

    res.redirect('/login');

};