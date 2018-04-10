const express = require('express');

const historyGraph = require('../history-graph.js');
const redis = require('../redis.js');
const render = require('../render.js');
const Alert = require('../bot/alert.js');
const mgEmail = require('../bot/send-email.js');
const sms = require('../bot/send-sms.js');

const app = express();

// PERSIST BASE URL
app.use((req, res, next) => {
  const protocol = req.protocol;
  const host = req.get('host');
  const basePath = `${protocol}://${host}`;
  redis.setAsync('__BASE_PATH', basePath);
  next();
});

// LIST
app.get('/', async (req, res) => {
  const keys = await redis.keysAsync('alert.*');
  const values = keys.length ? await redis.mgetAsync(keys) : [];
  const alerts = values
    .map(v => new Alert(v))
    .filter(alert => req.auth.isAdmin || alert.user === req.auth.user)
    .sort((a, b) => a.date - b.date);
  res.send(render('list', req, { alerts }));
});

// CREATE
app.post('/', async (req, res) => {
  req.body.user = req.auth.user;
  const alert = new Alert(req.body);
  await redis.setAsync(alert.key(), alert.toJSON());
  res.status(303).location(`/${alert.id}`).end();

  const message = [
    `Alert created for Southwest flight #${alert.number} from `,
    `${alert.from} to ${alert.to} on ${alert.formattedDate}. `,
    `We'll alert you if the price drops below $${alert.price}.`
  ].join('');
  const subject = [
    `✈ Alert created for WN ${alert.number} `,
    `${alert.from} → ${alert.to} on ${alert.formattedDate}. `
  ].join('');

  if (mgEmail.enabled && alert.to_email) {
    mgEmail.sendEmail(alert.to_email, subject, message);
  }

  if (sms.enabled && alert.phone) {
    sms.sendSms(alert.phone, message);
  }

  alert.getLatestPrice();
  redis.setAsync(alert.key(), alert.toJSON());
});

// EDIT
app.get('/:id/edit', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  const alert = new Alert(data);
  res.send(render('edit', req, { alert }));
});

// UPDATE
app.post('/:id', async (req, res) => {
  const oldAlert = new Alert(await redis.getAsync(`alert.${req.params.id}`));
  const resetPriceHistory = (new Alert(oldAlert.data)).signature === (new Alert(req.body)).signature ? {} : { priceHistory: [] };
  const alert = new Alert(Object.assign({}, oldAlert.data, req.body, resetPriceHistory));
  await redis.setAsync(alert.key(), alert.toJSON());
  await redis.delAsync(alert.key('cooldown'));
  res.status(303).location(`/${alert.id}`).end();

  await alert.getLatestPrice();
  await redis.setAsync(alert.key(), alert.toJSON());
});

// DELETE
app.get('/:id/delete', async (req, res) => {
  await redis.delAsync(`alert.${req.params.id}`);
  await redis.delAsync(`cooldown.${req.params.id}`);
  res.status(303).location('/').end();
});

// NEW
app.get('/new', async (req, res) => {
  res.send(render('new', req));
});

// SHOW
app.get('/:id', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  const alert = new Alert(data);
  const graph = alert.data.priceHistory.length ? historyGraph(alert) : '';
  res.send(render('show', req, { alert, graph }));
});

// CHANGE PRICE
app.get('/:id/change-price', async (req, res) => {
  const data = await redis.getAsync(`alert.${req.params.id}`);
  const alert = new Alert(data);
  const newPrice = parseInt(req.query.price, 10);
  if (newPrice < alert.data.price) {
    alert.data.price = newPrice;
    await redis.setAsync(alert.key(), alert.toJSON());
    await redis.delAsync(alert.key('cooldown'));
  }
  res.status(303).location(`/${alert.id}`).end();
});

module.exports = app;
