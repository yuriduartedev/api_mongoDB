var express = require('express');
var bodyParser = require('body-parser');
var mongodb = require('mongodb');
var objectId = require('mongodb').ObjectId;
var expressValidator = require('express-validator');
var app = express();

// body-parser
app.use(bodyParser.urlencoded({ extended:true }));
app.use(bodyParser.json());

/* configurar o middleware express-validator */
app.use(expressValidator());

// Flygth Request
app.use(function(req, res, next) {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "content-type");
  res.setHeader("Access-Control-Allow-Credentials", true);

  next();
});

var port = 8080;

app.listen(port);

var db = new mongodb.Db(
  'loja',
  new mongodb.Server('localhost', 27017, {}),
  {}
);

console.log('|========== Servidor HTTP online na porta ' + port + ' ==========|');

app.get('/', function(req, res) {
  res.send({msg: 'Bem vindo!'});
})

// REST => URI + VERBO HTTP

// POST (Create)
app.post('/api/produto', function(req, res) {
  var dados = req.body;

  req.assert('nome', 'deve ser preenchido!').notEmpty();
  req.assert('quantidade', 'deve ser preenchido!').notEmpty();
  req.assert('valor', 'deve ser preenchido!').notEmpty();

  var erros = req.validationErrors();

  if(erros) {
    res.status(400).json(erros)
    console.log(erros);
  } else {
    db.open(function(err, mongoclient) {
      mongoclient.collection('produtos', function(err, collection) {
        collection.insert(dados, function(err, records) {
          if(err) {
            res.json(err);
          } else {
            res.json(records);
          }
          mongoclient.close();
        });
      });
    });
  }
});

// GET (Ready)
app.get('/api/produtos', function(req, res) {
  db.open(function(err, mongoclient) {
    mongoclient.collection('produtos', function(err, collection) {
      collection.find().toArray(function(err, result) {
        if(err) {
          res.json(err);
        } else {
          res.json(result);
        }
        mongoclient.close();
      });
    });
  });
});

// GET by ID (Ready/ID)
app.get('/api/produtos/:id', function(req, res) {
  db.open( function(err, mongoclient) {
    mongoclient.collection('produtos', function(err, collection) {
      collection.find(objectId(req.params.id)).toArray(function(err, results) {
        if(err){
          res.json(err);
        } else {
          res.status(200).json(results);
        }
        mongoclient.close();
      });
    });
  });
});

// PUT by ID (Update/ID)
app.put('/api/produto/:id', function(req, res) {
  db.open( function(err, mongoclient) {
    mongoclient.collection('produtos', function(err, collection) {
      collection.update(
        { _id: objectId(req.params.id) },
        { $set:
          { nome: req.body.nome, quantidade: req.body.quantidade, valor: req.body.valor }
        },
        { mult: false },
        function(err, records) {
          if(err) {
            res.json(err);
          } else {
            res.json(records);
          }
          mongoclient.close();
        }
      );
    });
  });
});

// DELETE by ID (Delete)
app.delete('/api/produto/:id', function(req, res) {
  db.open( function(err, mongoclient) {
    mongoclient.collection('produtos', function(err, collection) {
      collection.remove({ _id: objectId(req.params.id)}, function(err, records) {
        if(err){
          res.json(err);
        } else {
          res.json(records);
        }
        mongoclient.close();
      });
    });
  });
});
