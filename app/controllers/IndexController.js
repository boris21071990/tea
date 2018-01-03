const TypeOffer = require('app/models/TypeOffer');
const UserOffer = require('app/models/UserOffer');

module.exports.index = (req, res) => {

    const viewData = {};

    viewData.userId = req.session.userId;

    TypeOffer
        .find()
        .exec()
        .then((typesOffers) => {

            viewData.typesOffers = typesOffers;

            const populate = [
                {
                    path: 'user',
                    select: 'name photo'
                },
                {
                    path: 'typeOffer'
                },
                {
                    path: 'joinedUsers.user'
                }
            ];

            return UserOffer.find().sort({createdAt: -1}).populate(populate).exec();

        })
        .then((usersOffers) => {

            viewData.usersOffers = usersOffers;
            viewData.metaTitle = 'Tea application';

            res.render('index', viewData);

        })
        .catch((err) => {

            res.end(err.message);

        });

};