// const serverless = require('serverless-http');
// const app = require('./server'); // Import your existing Express app
// module.exports = serverless(app);

const serverless = require('serverless-http');
const app = require('./server'); // Import your Express app

const handler = serverless(app, {
  request: (req) => {
    delete req.headers['content-length']; // Workaround for content-length issues
    return req;
  },
});

module.exports = handler;
