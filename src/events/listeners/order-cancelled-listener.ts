import {Listener, OrderCancelledEvent, Subjects} from "@campus-market/common";
import {queueGroupName} from "./queue-group-name";
import {Message} from "node-nats-streaming";
import {Item} from "../../models/item";
import {ItemUpdatedPublisher} from "../publishers/item-updated-publisher";


export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    const item = await Item.findById(data.item.id);
    if (!item) {
      throw new Error('item not found');
    }

    item.set({orderId: undefined});

    await item.save();

    await new ItemUpdatedPublisher(this.client).publish({
      id: item.id,
      version: item.version,
      orderId: item.orderId,
      title: item.title,
      userId: item.userId,
      price: item.price,
    });

    msg.ack();
  }
}