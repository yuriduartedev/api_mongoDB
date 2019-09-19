var express = require('express');
var bodyParser = require('body-parser');
var MongoClient = require('mongodb').MongoClient;
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

app.listen(process.env.PORT || 8080);

var uri = "mongodb://loja_admin:1536974@cluster0-shard-00-00-znuyq.mongodb.net:27017,cluster0-shard-00-01-znuyq.mongodb.net:27017,cluster0-shard-00-02-znuyq.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true&w=majority";

console.log('|========== Servidor HTTP online ==========|');

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
    MongoClient.connect(uri, function(err, client) {
      const collection = client.db("loja").collection("produtos");
      collection.insert(dados, function(err, records) {
        if(err) {
          res.json(err);
        } else {
          res.json(records);
        }
      });
      client.close();
    });
  }
});

// GET (Ready)
app.get('/api/produtos', function(req, res) {
  MongoClient.connect(uri, function(err, client) {
    const collection = client.db("loja").collection("produtos");
      collection.find().toArray(function(err, result) {
        if(err) {
          res.json(err);
        } else {
          res.json(result);
        }
      });
    client.close();
  });
});

// GET by ID (Ready/ID)
app.get('/api/produtos/:id', function(req, res) {
  MongoClient.connect(uri, function(err, client) {
    const collection = client.db("loja").collection("produtos");
      collection.find(objectId(req.params.id)).toArray(function(err, results) {
        if(err){
          res.json(err);
        } else {
          res.status(200).json(results);
        }
      });
    client.close();
  });
});

// PUT by ID (Update/ID)
app.put('/api/produto/:id', function(req, res) {
  MongoClient.connect(uri, function(err, client) {
    const collection = client.db("loja").collection("produtos");
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
        }
      );
    client.close();
  });
});

// DELETE by ID (Delete)
app.delete('/api/produto/:id', function(req, res) {
  MongoClient.connect(uri, function(err, client) {
    const collection = client.db("loja").collection("produtos");
      collection.remove({ _id: objectId(req.params.id)}, function(err, records) {
        if(err){
          res.json(err);
        } else {
          res.json(records);
        }
      });
    client.close();
  });
});
