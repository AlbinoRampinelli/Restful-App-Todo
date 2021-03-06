const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');

const { Todo } = require('./../models/todo');

const todos = [{
    _id: new ObjectID(),
    text: "First test todo"
},
{   _id: new ObjectID(),
    text: "second test todo"
}];


beforeEach((done) =>{
    Todo.remove({}).then(() => {
        return Todo.insertMany(todos);
    }).then(() => done())
});

describe('POST /todos', () => {
    it("Should create a new todo", (done) =>{
        let text= 'Testing todo route';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if(err) return err;
            
            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((err) =>{
                done(err);
            });
        });
    });
    it('Should not create todo with invalid no data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if(err) return done(err);

                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((err) =>{
                    done(err);
                });
            });
    });
});
describe('Get /todos', () =>{
        it('Should get all todos', (done) => {
          request(app)
            .get('/todos')
            .expect(200)
            .expect((res) => {
                    expect(res.body.todos.length).toBe(2)
            })
            .end(done);
        });

});
describe('GET /todos/:id', () =>{
    it('Should return todo doc by id', (done) =>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done)
    });

    it('Should return 404 todo is not found', (done) => {
        let hexID = new ObjectID().toHexString();
        request(app)
            .get(`/todos/${hexID}`)
            .expect(404)
            .end(done);
    });
    it('Should return 404 for non-object id', (done) =>{
        request(app)
            .get('/todos/123abc')
            .expect(400)
            .end(done)
    });
});

describe('DELETE /todos/:id', () => {
    it('Should remove a todo',  (done) => {

        let hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/$(hexId)`)
            .expect(200)
            .expect((res) =>{
                expect(res.body.todo._id).toBe(hexId);
            })
            .end((err, res) =>{
                if(err) return done(err);

            Todo.findById(hexId).then((todo) =>{
                expect(todo).toBeNull();
                done();
            }).catch((err) =>{
                    done(err);
            });
        });
    });
    
    it('Should return 404 if todo not found ', (done) => {
        let hexID = new ObjectID().toHexString();
        request(app)
            .delete(`/todos/${hexID}`)
            .expect(404)
            .end(done);
    });
    it('Should return 400 if ObjectID is invalid', (done) => {
        request(app)
        .delete('/todos/123abc')
        .expect(400)
        .end(done)
    });
});

describe('PATCH /todos/:id', () =>{
    it('Should update the todo', (done) =>{
        let hexId = todos[0]._id.toHexString();
        let text = 'This should be a new text';

        request(app)
            .patch(`/todos/${hexId}`)
            .send({ 
                completed: true,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.completed).toBe(true);
                expect(typeof parseInt(res.body.completedAt)).toBe('number');
            })
            .end(done);
    });
    it('Should clear completedAt(=null) when todo is not completed' , (done) =>{
        let hexId = todos[0]._id.toHexString();
        let text = 'This should be a new text';

        request(app)
            .patch(`/todos/${hexId}`)
            .send({ 
                completed: false,
                text
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text)
                expect(res.body.completed).toBe(false)
                expect(typeof parseInt(res.body.completedAt)).toBe('number')
            })
            .end(done);
    })
})