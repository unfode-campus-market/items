import request from "supertest";
import mongoose from "mongoose";

import {app} from "../../app";
import {natsWrapper} from "../../nats-wrapper";


// expected behavior for valid inputs
it('should update the item if valid inputs are provided', async function () {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/items')
    .set('Cookie', cookie)
    .send({
      title: 'MacBook',
      price: 1000
    });

  const updatedTitle = 'MacBook Air';
  const updatedPrice = 1200;
  await request(app)
    .put(`/api/items/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: updatedPrice
    })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const itemResponse = await request(app)
    .get(`/api/items/${response.body.id}`)
    .send();

  expect(itemResponse.body.title).toEqual(updatedTitle);
  expect(itemResponse.body.price).toEqual(updatedPrice);
});

// expect behaviors for various kinds of invalid inputs

it('should return a 404 if the provided id does not exist', async function () {
  const randomItemId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/items/${randomItemId}`)
    .set('Cookie', global.signup())
    .send({
      title: 'MacBook',
      price: 1000
    })
    .expect(404);
});

it('should return a 401 if the user is not signed in', async function () {
  const randomItemId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/items/${randomItemId}`)
    .send({
      title: 'MacBook',
      price: 1000
    })
    .expect(401);
});

it('should return a 401 if the user does not own the item', async function () {
  const response = await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      title: 'MacBook',
      price: 1000
    });

  await request(app)
    .put(`/api/items/${response.body.id}`)
    .set('Cookie', global.signup())
    .send({
      title: 'MacBook Air',
      price: 1200
    })
    .expect(401);
});

it('should return a 400 if the user provides an invalid title or price', async function () {
  const cookie = global.signup();
  const response = await request(app)
    .post('/api/items')
    .set('Cookie', cookie)
    .send({
      title: 'MacBook',
      price: 1000
    });

  await request(app)
    .put(`/api/items/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20
    })
    .expect(400);

  await request(app)
    .put(`/api/items/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'iPhone',
      price: -20
    })
    .expect(400);
});