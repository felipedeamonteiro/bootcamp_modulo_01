const express = require("express");

const server = express();

//Para não dar um erro de POST, tenho que falar para o express, por meio de um plugin, ler JSON
server.use(express.json());

// Query params = ?teste=1
// Route params = /users/1
// Request body = { "name": "Felipe", "email": "matadordealuguel@gmail.com" }

//CRUD = Create, Read, Update, Delete

const users = ["Diego", "Robson", "Victor"];

//Isso tudo que estão aqui em baixo com Get, post, del, put são Middlewares, que são
//Funções que recebem parâmetros req e res e manipulam estes dados. Eles podem alterar o req e res também

//Vou chamar um middleware global (Esse do server.use), e ele não precisa de rota
//OBS: Ele BLOQUEIA o fluxo da aplicação do jeito que está
//server.use((req, res) => {
//  console.log("A requisição foi chamada");
//});

//Para arruma isso, é só passar o parâmetro "next"
server.use((req, res, next) => {
  console.time("Request"); //console usado para calcular o tempo de execução de alguma requisição. Aqui ele precisa ter o mesmo nome tanto aqui neste "time", quanto no "timeEnd" lá embaixo. Dessa maneira eu garanto que o time será calculado
  console.log(`Método: ${req.method}; URL: ${req.url}`);

  next();

  console.timeEnd("Request");
});

//Este aqui é chamado de middleware local. Ele serve para fazer a checagem de uma url dentro de outra middleware. É por isso que ele é chamado dentro dos parênteses das requisições
function checkUserExists(req, res, next) {
  if (!req.body.name) {
    return res.status(400).json({ error: "User name is required" });
  }

  return next();
}

function checkUserInArray(req, res, next) {
  const user = users[req.params.index];

  if (!user) {
    return res.status(400).json({ error: "User does not exist" });
  }

  req.user = user; //Como os middlewares podem alterar "req" e "res", mais especificamente o "req", e eu posso fazer uso disso. Esse cara "req.user" recebe user se ele não entrar no if, e dessa maneira eu posso usar esta informação nos outros métodos. No server.get é possível usá-lo:
  return next();
}

server.get("/users", (req, res) => {
  return res.json(users);
});

server.get("/users/:index", checkUserInArray, (req, res) => {
  //const id = req.params.id;
  //Fazendo a desestruturação do comando acima, ficaria assim:
  //const { index } = req.params;

  //Antes, o res.json retornava assim: res.json(users[index]), mas como eu alterei o req.user no middleware "checkUserInArray", ele pode ser usado aqui:
  return res.json(req.user);
});

server.post("/users", checkUserExists, (req, res) => {
  const { name } = req.body;

  users.push(name);

  return res.json(users);
});

//Posso usar quantos parâmetros eu quiser nos middlewares que eles irão executar
server.put("/users/:index", checkUserExists, checkUserInArray, (req, res) => {
  const { index } = req.params;
  const { name } = req.body;

  users[index] = name;

  return res.json(users);
});

server.delete("/users/:index", checkUserInArray, (req, res) => {
  const { index } = req.params;

  users.splice(index, 1);

  //Aqui ele retorna o array com os usuários
  //return res.json(users);

  //mas para ele só retornar que foi tudo ok, é só fazer isso:
  return res.send();
});

server.listen(3000);
