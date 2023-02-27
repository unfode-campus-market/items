import request from "supertest";
import {app} from "../../app";
import mongoose from "mongoose";

it('should return 404 if the item is not found', async function () {
  const randomItemId = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .get(`/api/items/${randomItemId}`)
    .send()
    .expect(404);
});

it('should return the item if it is found', async function () {
  const title = 'MacBook';
  const price = 1000;
  const response = await request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      title,
      price
    })
    .expect(201);

  const itemResponse = await request(app)
    .get(`/api/items/${response.body.id}`)
    .send()
    .expect(200);

  expect(itemResponse.body.title).toEqual(title);
  expect(itemResponse.body.price).toEqual(price);
});