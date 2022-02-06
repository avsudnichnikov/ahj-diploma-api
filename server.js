const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const bodyParser = require('koa-body');
const Router = require('koa-router');
const WS = require('ws');

const AuthController = require('./AuthController');
const MessageController = require('./MessageController');

const app = new Koa();
const router = new Router();
const port = process.env.PORT || 3000;

const auth = new AuthController();
const messages = new MessageController();

app.use(cors());
app.use(bodyParser({
  json: true,
}));

router.get('/', async (ctx) => {
  ctx.response.body = { greeting: 'hello' };
});

router.post('/auth', (ctx) => {
  const {username, password} = ctx.request.body;
  ctx.response.body = auth.auth(username, password);
  ctx.response.status = 200;
});

router.get('/messages', async (ctx) => {
  const {limit, offset, token} = ctx.request.body;
  if (!auth.validateToken(token)) {
    ctx.response.body = { data: messages.list(limit, offset) };
    ctx.response.status = 200;
  } else {
    ctx.response.body = { errors: {token: 'is not valid'}};
    ctx.response.status = 403;
  }
});

const server = http.createServer(app.callback());
const wss = new WS.Server({ server });

wss.on('connection', (ws, req) => {
  const messageHandler = (response) => {
    [...wss.clients]
      .filter((client) => client.readyState === WS.OPEN)
      .forEach((client) => client.send(JSON.stringify(response)));
  };

  // eslint-disable-next-line no-param-reassign
  ws.token = req.headers['sec-websocket-protocol'];

  if (!auth.validateToken(ws.token)) {
    ws.terminate();
  }

  ws.on('message', (request) => {
    const { text } = JSON.parse(request).data;
    messageHandler({
      event: 'message',
      data: {
        message: messages.add(text),
      },
    });
  });

  ws.on('close', () => {
    console.log(ws.token);
  });
});

app
  .use(router.routes())
  .use(router.allowedMethods());

server.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});
