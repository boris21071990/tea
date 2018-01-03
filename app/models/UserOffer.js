const Mongoose = require('app/services/Mongoose');

const schema = new Mongoose.Schema({
    user: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    typeOffer: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'TypeOffer'
    },
    joinedUsers: [
        {
            joinedAt: {
                type: Date,
                default: Date.now
            },
            user: {
                type: Mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    usePushEach: true
});

module.exports = Mongoose.model('UserOffer', schema);