import {natsWrapper} from "../../../nats-wrapper";
import {OrderCreatedListener} from "../order-created-listener";
import {Item} from "../../../models/item";
import {OrderCreatedEvent, OrderStatus} from "@campus-market/common";
import mongoose from "mongoose";
import {Message} from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);
  const item = Item.build({
    title: 'MBP',
    price: 100,
    userId: 'asdf'
  });

  await item.save();

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'asdf',
    expiresAt: 'asdf',
    item: {
      id: item.id,
      price: item.price
    }
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  }

  return {listener, item, data, message};
};

it('should set the item\'s orderId, ack the message, and publish an ItemUpdatedEvent', async () => {
  const {listener, item, data, message} = await setup();

  await listener.onMessage(data, message);

  const updatedItem = await Item.findById(item.id);

  expect(updatedItem!.orderId).toEqual(data.id);
  expect(message.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
