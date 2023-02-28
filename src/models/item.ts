import mongoose from "mongoose";


interface ItemAttributes {
  title: string;
  price: number;
  userId: string;
}

interface ItemDocument extends mongoose.Document{
  title: string;
  price: number;
  userId: string;
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

itemSchema.statics.build = (attributes: ItemAttributes) => {
  return new Item(attributes);
};

const Item = mongoose.model<ItemDocument, ItemModel>('Item', itemSchema);

export {Item};


