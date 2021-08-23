let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.NGODB_URI || 'mongodb://localhost:27017/Todo', {userNewUrlParser: true });

module.exports = {
    mongoose
}
