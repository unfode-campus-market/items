import mongoose from "mongoose";


interface ItemAttrs {
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
  build(attrs: ItemAttrs): ItemDocument;
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

itemSchema.statics.build = (attrs: ItemAttrs) => {
  return new Item(attrs);
};

const Item = mongoose.model<ItemDocument, ItemModel>('Item', itemSchema);

export {Item};


