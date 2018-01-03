const multer = require('multer');
const upload = multer({dest: 'uploads/'});

// Middleware
const CheckAuthenticate = require('app/middleware/CheckAuthenticate');

// Controllers
const IndexController = require('app/controllers/IndexController');
const UserController = require('app/controllers/UserController');
const ProfileController = require('app/controllers/ProfileController');

module.exports = (app) => {

    // Main page
    app.get('/', CheckAuthenticate, IndexController.index);

    // User controller
    app.get('/login', UserController.login);
    app.get('/register', UserController.register);
    app.get('/logout', UserController.logout);
    app.post('/login', UserController.enter);
    app.post('/register', UserController.save);

    // Profile controller
    app.get('/profile', CheckAuthenticate, ProfileController.index);
    app.post('/profile', CheckAuthenticate, upload.single('photo'), ProfileController.save);

};