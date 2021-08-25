require('./config/config.js');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const moment = require('moment');


let { mongoose } = require('./db/mongoose.js');
let { Todo } = require('./models/todo.js');
let { User } = require('./models/user.js');
let { authenticate } = require('./middleware/authenticate.js')

let app = express();
let port = process.env.PORT || 3000;

app.use(bodyParser.json());

/* **************  POST ************** */

app.post('/todos', authenticate,(req,res) => {
    let todo = new Todo ({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc) => {
        res.status(200).send(doc)
    }).catch((err) => {
        res.status(400).send(err)
    });
});

/* ***************  GET   *************** */

app.get('/todos', authenticate, (req,res) => {
    Todo.find({
        _creator: req.user._id
    }).then((todos) => {
        res.status(200).send({todos})
    }).catch((err) => {
        res.setatus(400).send(err);
    });
});

/* **************  GET ONE  ************** */

app.get('/todos/:id', authenticate, (req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid(id)) return res.status(400).send({error: 'Invalid ID'});

    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo) => {
        if(!todo) return res.status(404).send();

        res.send({todo});
    }).catch((err) => {
        res.status(400).send();
    })
});

/* **************  DELETE  ************** */

app.delete('/todos/:id',authenticate, (req, res) => {
    let id = req.params.id;

    if(!ObjectID.isValid({
        _id: id,
        _creator: req.user._id
    })) return res.status(400).send({error: 'Something went wrong !!'});

    Todo.findOneAndRemove({
        _id: id }).then((todo) => {
        if(!todo) return res.status(404).send({todo});
        res.status(200).send({ todo });

    }).catch((err) => {
        return res.status(400).send(err)
    });
});

/* **************  PATCH ************** */

app.patch('/todos/:id', authenticate, (req, res) => {
    let id= req.params.id;
    let body = _.pick(req.body, ['text', 'completed']);

  

    if(!ObjectID.isValid(id)) return res.status(400).send({error: 'Something went wrong !!'});

    if(_.isBoolean(body.completed) && body.completed){
    
        body.completedAt = new Date().getTime();

    }else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({ _id:id, _creator: req.user._id }, {$set: body}, {new: true}).then((todo) => {
        if(!todo) return res.status(404).send();
        res.send({todo});
    }).catch((err) => {
        res.status(400).send({error: "erro no catch"});
    })
})

/* **************  POST USER  ************** */

app.post('/users',(req,res) => {
    let body= _.pick(req.body, ['email', 'password']);
    let user = new User(body);
    

    user.save().then(() => {
        return user.generateAuthToken();
        //res.send(user);
    }).then((token)=>{
        res.header('x-auth', token).send(user);
    }).catch((err) => {
        res.status(400).send(err);
    })
})

/* **************  GET USER ME ************** */

app.get('/users/me', authenticate, (req,res) => {
    res.send(req.user);
});

/* *************** POST LOGIN  ******************* */

app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
  
    User.findByCredentials(body.email, body.password).then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header("x-auth", token).send(user);
      })
    }).catch((err) => {
      res.status(400).send(err);
    })
  });

/* **************  DELETE USER ME TOKEN ************** */

app.delete('/users/me/token', authenticate,(req,res) =>{
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }).catch((err) =>{
        res.status(400).send(err);
    })
})




app.listen(port, () => console.log(`Satarted on port ${port}`));

module.exports = { app}
