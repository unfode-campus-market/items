import {OrderCancelledListener} from "../order-cancelled-listener";
import {natsWrapper} from "../../../nats-wrapper";
import {Item} from "../../../models/item";
import mongoose from "mongoose";
import {OrderCancelledEvent} from "@campus-market/common";
import {Message} from "node-nats-streaming";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const item = Item.build({
    title: 'mbp',
    price: 100,
    userId: 'asdf'
  });
  item.set({orderId: new mongoose.Types.ObjectId().toHexString()});
  await item.save();

  const data: OrderCancelledEvent['data'] = {
    id: item.orderId!,
    version: item.version,
    item: {
      id: item.id
    }
  };

  // @ts-ignore
  const message: Message = {
    ack: jest.fn()
  };

  return {listener, item, data, message};
};

it('should update the item, publish an item-updated event, and ack the message,', async () => {
  const {listener, item, data, message} = await setup();
  await listener.onMessage(data, message);

  const updatedItem = await Item.findById(item.id);

  expect(updatedItem!.orderId).toBeUndefined();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
  expect(message.ack).toHaveBeenCalled();
});