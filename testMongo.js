const MongoClient = require('mongodb').MongoClient;
let url = "mongodb://localhost:27017/TodoApp";

MongoClient.connect(url, {useNewUrlParser: true},(err,client) => {
    if(err) return console.log('Unable to connect to MongoDb Server !!!')
    console.log('Connected to MongoDB !');

    const db = client.db('TodoApp');

    db.collection('Todos').insertOne({
        text: "Something to do ",
        completed: false
    }, (err, result) => {
        if(err) return console.log('Unable to add todo');

        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    client.close();
});

// db.collection('Todos').insertOne({
//     name: "Albino",
//     age: 34,
//     location: 'Sampa'
// }, (err, result) => {
//     if(err) {
//         console.log('Unable to add todo');
//         console.log('erro no acesso', err);
//         return;
//     }
//     console.log(JSON.stringify(result.ops, undefined, 2));
// });

// client.close();
// });

// const client = await MongoClient.connect('yourMongoURL', { 
//     useNewUrlParser: true, 
//     useUnifiedTopology: true,
// });
// // specify the DB's name
// const db = client.db('nameOfYourDB');
// // execute find query
// const items = await db.collection('items').find({}).toArray();
// console.log(items);
// // close connection
// client.close();