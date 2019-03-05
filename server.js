const express = require('express'); // importing a CommonJS module
const logger = require('morgan');
const helmet = require('helmet');

const hubsRouter = require('./hubs/hubs-router.js');

const server = express();
const parser = express.json();
const logMiddleware = logger('dev'); //'dev' is used to tell how we want the info displayed. 'tiny' doesn't have color-coded. refer to docs for more info.
const securityMiddleware = helmet();

server.use(parser, logMiddleware, securityMiddleware, teamNamer ); //pass in functions declared above

server.use('/api/hubs', restricted, hubsRouter);

function teamNamer(req, res, next){
  req.team = 'pt3';
  next(); // passing something in next is possible, but it has to be an error.
}

function moodyGatekeeper(req, res, next) {
  // if seconds are multiple of 3, send back
  // status 403 and the message "shall not pass"
  const seconds = new Date().getSeconds();
  console.log(seconds);
  if (seconds % 3 === 0){
    res.status(403).json({error: 'Shall not pass'})
  } else {
    next(); // we put in an else because we don't want it to go to next if it gives an error.
  }
}

// route specific middleware
function restricted(req, res, next){
  const password = req.headers.authorization;
  if (password === 'mellon'){
    next();
  } else if (password){ // password is there, but incorrect
    res.status(401).json({err: 'invalid credentials'});
  } else {
    // this is not sending a status. It's going to find a piece of middleware that handles errors and passes it along.
    next({ err: 'no credentials provided'});
  }
}

server.get('/', (req, res) => {
  res.send(`
    <h2>Lambda Hubs API</h2>
    <p>Welcome ${req.team}, to the Lambda Hubs API</p>
    `);
});

// error handling goes near the bottom to catch all errors, but does not replace catch
// you can pass through error handling through next to be used in catch
server.use((err, req, res, next) => {
  res.status(400).json({
    message: 'error thrown in server',
    err: err
  });
});

module.exports = server;
