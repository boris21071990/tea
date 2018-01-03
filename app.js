// Server
const http = require('http');

// Express
const express = require('express');

// Config
const config = require('app/config');

// App
const app = express();

// Set view
const ejs = require('ejs');

app.engine('ejs', require('ejs-mate'));

app.set('views', __dirname + '/app/views');

app.set('view engine', 'ejs');

// Static
app.use(express.static('public'));

// Body parser
const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));

// Mongoose
const Mongoose = require('app/services/Mongoose');

// Session
const session = require('express-session');

const MongoStore = require('connect-mongo')(session);

const sessionStore = new MongoStore({mongooseConnection: Mongoose.connection});

const sessionMiddleware = session({
    name: config.get('session:name'),
    secret: config.get('session:secret'),
    saveUninitialized: true,
    resave: true,
    store: sessionStore
});

app.use(sessionMiddleware);

// Middleware
app.use(require('app/middleware/SendHttpError'));

// Router
const router = require('./app/router')(app);

// Error handler
const HttpError = require('app/error/HttpError');

app.use((err, req, res, next) => {

    if(err instanceof HttpError){

        res.sendHttpError(err);

    } else {

        express.errorHandler()(err, req, res, next);

    }

});

// Create server
const server = http.createServer(app);

server.listen(config.get('port'));

// Socket
const io = require('socket.io')();

io.listen(server);

// Load session for socket
io.use((socket, next) => {

    sessionMiddleware(socket.request, socket.request.res, next);

});

// Events
io.sockets.on('connection', (socket) => {

    // Load models
    const TypeOfferModel = require('app/models/TypeOffer');

    const UserOfferModel = require('app/models/UserOffer');

    // Get user id
    const userId = socket.request.session.userId;

    // Events
    socket.on('userOfferAdd', (data) => {

        // View data
        const viewData = {};

        // Set user id
        viewData.userId = userId;

        // Load user offers
        TypeOfferModel.findById(data.id)
            .exec()
            .then((typeOffer) => {

                // Set view data
                viewData.typeOffer = typeOffer;

                return UserOfferModel.findOne({user: userId}).exec();

            })
            .then((userOffer) => {

                if( ! userOffer){

                    // Save new user offer
                    const newUserOffer = new UserOfferModel({
                        user: userId,
                        typeOffer: data.id
                    });

                    return newUserOffer.save();

                } else {

                    throw new Error('Can not add new offer');

                }

            })
            .then((userOffer) => {

                const populate = [
                    {
                        path: 'user',
                        select: 'name photo'
                    },
                    {
                        path: 'typeOffer'
                    }
                ];

                return UserOfferModel.findById(userOffer._id).populate(populate).exec();

            })
            .then((userOffer) => {

                // Set view data
                viewData.userOffer = userOffer;

                // Content owner
                let contentOwner = '';

                viewData.owner = true;

                ejs.renderFile(__dirname + '/app/views/partials/useroffer.ejs', viewData, (err, str) => {

                    contentOwner = str;

                });

                socket.emit('serverOfferAdd', {
                    status: 'success',
                    content: contentOwner
                });

                // Content broadcast
                let contentBroadcast = '';

                viewData.owner = false;

                ejs.renderFile(__dirname + '/app/views/partials/useroffer.ejs', viewData, (err, str) => {

                    contentBroadcast = str;

                });

                socket.broadcast.emit('serverOfferAdd', {
                    status: 'success',
                    content: contentBroadcast,
                    message: 'Предложение от: ' + userOffer.user.name + ' - ' + userOffer.typeOffer.name
                });

            })
            .catch((err) => {

                socket.emit('serverOfferAdd', {
                    status: 'error',
                    content: err.message
                });

            });

    });

    socket.on('userOfferCancel', (data) => {

        UserOfferModel.findOneAndRemove({_id: data.id, user: userId})
            .exec()
            .then((userOffer) => {

                socket.emit('serverUserOfferCancel', {
                    status: 'success',
                    content: data.id
                });

                socket.broadcast.emit('serverUserOfferCancel', {
                    status: 'success',
                    content: data.id
                });

            });

    });

    socket.on('joinUserOfferYes', (data) => {

        UserOfferModel.findById(data.id)
            .exec()
            .then((userOffer) => {

                if(userOffer.joinedUsers.length){

                    for(let i = 0; i < userOffer.joinedUsers.length; i++){

                        if(userOffer.joinedUsers[i].user == userId){

                            throw new Error('Already joined');

                        }

                    }

                }

                userOffer.joinedUsers.push({user: userId});

                return userOffer.save();

            })
            .then((userOffer) => {

                const populate = [
                    {
                        path: 'user'
                    },
                    {
                        path: 'joinedUsers.user'
                    }
                ];

                return UserOfferModel.findById(data.id).populate(populate).exec();

            })
            .then((userOffer) => {

                let content = '';

                ejs.renderFile(__dirname + '/app/views/partials/joinedusers.ejs', {joinedUsers: userOffer.joinedUsers}, (err, str) => {

                    content = str;

                });

                socket.emit('serverJoinUserOfferYes', {
                    status: 'success',
                    content: content,
                    id: data.id
                });

                socket.broadcast.emit('serverJoinUserOfferYes', {
                    status: 'success',
                    content: content,
                    id: data.id
                });

            })
            .catch((err) => {

                socket.emit('serverJoinUserOfferYes', {
                    status: 'error',
                    content: err.message
                });

            });

    });

    socket.on('joinUserOfferNo', (data) => {

        UserOfferModel.findById(data.id)
            .exec()
            .then((userOffer) => {

                if(userOffer.joinedUsers.length){

                    for(let i = 0; i < userOffer.joinedUsers.length; i++){

                        if(userOffer.joinedUsers[i].user == userId){

                            userOffer.joinedUsers.id(userOffer.joinedUsers[i]._id).remove();

                            return userOffer.save();

                        }

                    }

                }

                throw new Error('Already canceled');

            })
            .then((userOffer) => {

                const populate = [
                    {
                        path: 'user'
                    },
                    {
                        path: 'joinedUsers.user'
                    }
                ];

                return UserOfferModel.findById(data.id).populate(populate).exec();

            })
            .then((userOffer) => {

                let content = '';

                ejs.renderFile(__dirname + '/app/views/partials/joinedusers.ejs', {joinedUsers: userOffer.joinedUsers}, (err, str) => {

                    content = str;

                });

                socket.emit('serverJoinUserOfferNo', {
                    status: 'success',
                    content: content,
                    id: data.id
                });

                socket.broadcast.emit('serverJoinUserOfferNo', {
                    status: 'success',
                    content: content,
                    id: data.id
                });

            })
            .catch((err) => {

                socket.emit('serverJoinUserOfferNo', {
                    status: 'error',
                    content: err.message
                });

            });

    });

});