let env = process.env.NODE_ENV || 'development';
console.log('env *************', env)

if (env === 'development' || env === "test" ) {
    let config = require('./config.json');
    let envConfig = config[env];
    Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key]
    })
    console.log(Object.keys(envConfig))
}


//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/Todo';
// }else if(env === "test") {
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoTest';
// }

