const fs = require('fs');
const UserModel = require('app/models/User');

// Index action
module.exports.index = (req, res) => {

    // User id
    const userId = req.session.userId;

    UserModel
        .findById(userId)
        .exec()
        .then((user) => {

            res.render('profile', {
                metaTitle: 'Profile',
                user: user
            });

        })
        .catch((err) => {

            res.end(err.message);

        });

};

// Save action
module.exports.save = (req, res) => {

    // User id
    const userId = req.session.userId;

    // List errors
    const listErrors = [];

    UserModel
        .findById(userId)
        .exec()
        .then((user) => {

            user.name = req.body.name;

            return user.save();

        })
        .then((user) => {

            if(req.file){

                const allowedExtensions = ['jpg', 'jpeg', 'gif', 'png'];
                const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
                const fileExtension = req.file.originalname.split('.').pop();
                const newFileName = user._id + '.' + fileExtension;

                // Check extension and mime type
                if(allowedExtensions.indexOf(fileExtension) < 0 || allowedMimeTypes.indexOf(req.file.mimetype) < 0){

                    listErrors.push('Недопустимый формат изображения');

                }

                if(listErrors.length == 0){

                    fs.readFile(req.file.path, (err, data) => {

                        if(err){

                            listErrors.push('Произошла ошибка при загрузке');

                            throw err;

                        }

                        fs.writeFile('public/photos/' + newFileName, data, (err) => {

                            if(err){

                                listErrors.push('Произошла ошибка при загрузке');

                                throw err;

                            }

                            user.photo = newFileName;

                            user.save((err) => {

                                if(err){

                                    listErrors.push('Произошла ошибка при загрузке');

                                    throw err;

                                }

                                fs.unlink(req.file.path, (err) => {

                                    if(err){

                                        listErrors.push('Произошла ошибка при загрузке');

                                        throw err;

                                    }

                                    res.redirect('/profile');

                                });

                            });

                        });

                    });

                } else {

                    fs.unlink(req.file.path, (err) => {

                        if(err){

                            throw err;

                        }

                    });

                    throw new Error();

                }

            } else {

                res.redirect('/profile');

            }

        })
        .catch((err) => {

            if(err.errors){

                for(let field in err.errors){
                    listErrors.push(err.errors[field].message);
                }

            }

            res.render('profile', {
                metaTitle: 'Профиль',
                listErrors: listErrors,
                user: {
                    photo: req.body.photo,
                    name: req.body.name
                }
            });

        });

};