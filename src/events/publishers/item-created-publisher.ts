import {ItemCreatedEvent, Publisher, Subjects} from "@campus-market/common";

export class ItemCreatedPublisher extends Publisher<ItemCreatedEvent> {
  readonly subject = Subjects.ItemCreated;
}

