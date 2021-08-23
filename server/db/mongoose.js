let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Todo', {userNewUrlParser: true }, () => console.log('Conneted to Database') );

module.exports = {
    mongoose
}
