import mongoose from "mongoose";
import {updateIfCurrentPlugin} from "mongoose-update-if-current";

interface ItemAttributes {
  title: string;
  price: number;
  userId: string;
}

interface ItemDocument extends mongoose.Document{
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string;
}

interface ItemModel extends mongoose.Model<ItemDocument> {
  build(attributes: ItemAttributes): ItemDocument;
}

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    userId: {
      type: String,
      required: true
    },
    orderId: {
      type: String
    }
  },
  {
    toJSON: {
      versionKey: false,
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      }
    }
  }
);

itemSchema.set('versionKey', 'version');
itemSchema.plugin(updateIfCurrentPlugin);

itemSchema.statics.build = (attributes: ItemAttributes) => {
  return new Item(attributes);
};

const Item = mongoose.model<ItemDocument, ItemModel>('Item', itemSchema);

export {Item};


