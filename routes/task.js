var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Conexión a MongoDB Atlas
mongoose.connect("mongodb+srv://herrebra7:5623bogota@cluster0.ffmrjym.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Conexión a la base de datos exitosa'))
.catch(err => console.error('Error al conectar a la base de datos:', err));

var Schema = mongoose.Schema;

// Define Database Schema
var TaskSchema = new Schema({
  title: {type: String, required: true},
  description: {type: String},
  status: {type: Boolean, required: true},
}, {collection: 'tasks'});

// Define Schema Object
var Task = mongoose.model('Task', TaskSchema);

/* GET Tasks page. */
router.get('/', function(req, res, next) {
  Task.find().sort({_id: -1})
  .then(function(docs) {
    res.render('tasks/index', {tasks: docs})
  })
});

/* GET Task Single page. */
router.get('/view/:id', function(req, res, next) {
  var id = req.params.id;
  Task.findById(id)
  .then(function(doc) {
    res.render('tasks/show', {task: doc})
  })
  .catch(err => console.error('Error al obtener la tarea:', err));
});

/* GET Task Single page. */
router.get('/add', function(req, res, next) {
  res.render('tasks/create', {title: "Create New Task", success: req.session.success, errors: req.session.errors});
});

/* Post Task Single page. */
router.post('/store', function(req, res, next) {
  req.check('title', "Please give a title").notEmpty();
  req.check('status', "Please give status for task").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
    res.redirect('/add');
  } else {
    req.session.success = true;

    var task = {
      'title': req.body.title,
      'description': req.body.description,
      'status': req.body.status
    };

    var task = new Task(task);
    task.save()
    .then(() => res.redirect('/'))
    .catch(err => console.error('Error al guardar la tarea:', err));
  }
});

router.post('/update', function(req, res, next) {
  var id = req.body.id;

  req.check('title', "Please give a title").notEmpty();
  req.check('status', "Please give status for task").notEmpty();

  var errors = req.validationErrors();
  if (errors) {
    req.session.errors = errors;
    req.session.success = false;
    res.redirect('/');
  } else {
    req.session.success = true;
    Task.findByIdAndUpdate(id, req.body)
    .then(() => res.redirect('/'))
    .catch(err => console.error('Error al actualizar la tarea:', err));
  }
});

/* Delete Task */
router.post('/delete', function(req, res, next) {
  var id = req.body.id;
  Task.findByIdAndRemove(id)
  .then(() => res.redirect('/'))
  .catch(err => console.error('Error al eliminar la tarea:', err));
});

module.exports = router;
