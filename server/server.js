let env = process.env.NODE_ENV || 'development';
console.log('env *************', env)

if (env === 'development') {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/Todo';
}else if(env === "test") {
    process.env.PORT = 3000;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoTest';
}




const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const moment = require('moment');


let { mongoose } = require('./db/mongoose.js');
let { Todo } = require('./models/todo.js');
let { User } = require('./models/user.js');

let app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.json());

/* **************************** */
app.post('/todos', (req,res) => {
    let todo = new Todo ({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.status(200).send(doc)
    }).catch((err) => {
        res.status(400).send(err)
    });
});

/* ****************************** */

app.get('/todos', (req,res) => {
    Todo.find().then((todos) => {
        res.status(200).send({todos})
    }).catch((err) => {
        res.setatus(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(400).send({error: 'Invalid ID'});

    Todo.findById(id).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    })
});

app.delete('/todos/:id',(req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(400).send({error: 'Something went wrong !!'});

    Todo.findByIdAndRemove({
        _id: id }).then((todo) => {
        if(!todo) return res.status(404).send({todo});
        res.status(200).send({ todo });

    }).catch((err) => {
        return res.status(400).send(err)
    });
});

app.patch('/todos/:id', (req, res) => {
    let id= req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

  

    if(!ObjectID.isValid(id)) return res.status(400).send({error: 'Something went wrong !!'});

    if(_.isBoolean(body.completed) && body.completed){
    
        body.completedAt = new Date().getTime();

    }else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
        if(!todo) return res.status(404).send();
        res.send({todo});
    }).catch((err) => {
        res.status(400).send({error: "erro no catch"});
    })
})



app.listen(port, () => console.log(`Satarted on port ${port}`));

module.exports = { app}
