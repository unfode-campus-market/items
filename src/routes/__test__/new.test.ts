import request from "supertest";

import {app} from "../../app";
import {Item} from "../../models/item";
import {natsWrapper} from "../../nats-wrapper";


// expected behavior for valid inputs
it('should create an item with valid inputs', async () => {
  let items = await Item.find({});
  expect(items.length).toEqual(0);

  await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      title: 'MacBook',
      price: 1000
    })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  items = await Item.find({});
  expect(items.length).toEqual(1);
});

// expected behavior for various kinds of invalid inputs

it('should have a route handler listening to /api/items for POST requests', async () => {
  const response = await request(app)
    .post('/api/items')
    .send({});

  expect(response.status).not.toEqual(404);
});

it('can only be accessed if the user is signed in', async () => {
  await request(app)
    .post('/api/items')
    .send({})
    .expect(401);
});

it('should return a status other than 401 if the user is signed in', async () => {
  const response = await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('should return an error if an invalid title is provided', async () => {
  await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      title: '',
      price: 10
    })
    .expect(400);

  await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      price: 10
    })
    .expect(400);
});

it('should return an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      title: 'MacBook',
      price: -10
    })
    .expect(400);

  await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      title: 'MacBook'
    })
    .expect(400);
});



