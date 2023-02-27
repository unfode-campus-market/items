import request from "supertest";
import {app} from "../../app";

const createItem = () => {
  return request(app)
    .post('/api/items')
    .set('Cookie', global.signup())
    .send({
      title: 'MacBook',
      price: 1000
    });
};

it('should fetch a list of items', async function () {
  await createItem();
  await createItem();
  await createItem();

  const response = await request(app)
    .get('/api/items')
    .send()
    .expect(200);

  expect(response.body.length).toEqual(3);
});