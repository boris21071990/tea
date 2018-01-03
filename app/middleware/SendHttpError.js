module.exports = (req, res, next) => {

    res.sendHttpError = (error) => {

        // Set status
        res.status(error.status);

        // Render
        res.render('error', {
            error: error,
            metaTitle: 'Ошибка'
        });

    };

    next();

};