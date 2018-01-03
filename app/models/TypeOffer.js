const Mongoose = require('app/services/Mongoose');

const schema = new Mongoose.Schema({
    name: {
        type: String
    },
    image: {
        type: String
    }
});

module.exports = Mongoose.model('TypeOffer', schema);