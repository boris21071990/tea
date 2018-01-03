const User = require('app/models/User');

module.exports = (req, res, next) => {

    // Check user id
    if( ! req.session.userId) {
        return res.redirect('/login');
    }

    // Check user
    User.findById(req.session.userId, (err, user) => {

        if( ! user) {
            res.redirect('/login');
        } else {
            next();
        }

    });

};