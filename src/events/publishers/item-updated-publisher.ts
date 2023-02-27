import {ItemUpdatedEvent, Publisher, Subjects} from "@campus-market/common";


export class ItemUpdatedPublisher extends Publisher<ItemUpdatedEvent> {
  readonly subject = Subjects.ItemUpdated;
}