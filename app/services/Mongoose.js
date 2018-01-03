const mongoose = require('mongoose');
const config = require('app/config');

mongoose.connect(config.get('mongoose:url'), config.get('mongoose:options'));

module.exports = mongoose;