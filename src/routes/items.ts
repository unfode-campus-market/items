import express, {Request, Response} from "express";
import {NotAuthorizedError, NotFoundError, requireAuth, validateRequest} from "@campus-market/common";
import {body} from "express-validator";
import {Item} from "../models/item";
import {ItemCreatedPublisher} from "../events/publishers/item-created-publisher";
import {ItemUpdatedPublisher} from "../events/publishers/item-updated-publisher";
import {natsWrapper} from "../nats-wrapper";


const router = express.Router();

router.put(
  '/:id',
  requireAuth,
  [
    body('title')
      .not()
      .isEmpty()
      .withMessage('expected: a non-empty "title" property; got: "title" property does not exist or is empty'),
    body('price')
      .isFloat({gt: 0})
      .withMessage('expected: a "price" property whose value is a positive number; got: "price" property does not exist or is not a positive number')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      throw new NotFoundError();
    }

    if (item.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    item.set({
      title: req.body.title,
      price: req.body.price
    });

    await item.save();

    new ItemUpdatedPublisher(natsWrapper.client).publish({
      id: item.id,
      title: item.title,
      price: item.price,
      userId: item.userId
    });

    res.send(item);
  }
);

router.get('/', async (req: Request, res: Response) => {
  const items = await Item.find({});

  res.send(items);
});

router.get('/:id', async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    throw new NotFoundError();
  }

  res.send(item);
});

router.post(
  '/',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({gt: 0}).withMessage('Price must be greater than 0')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const {title, price} = req.body;
    const item = Item.build({
      title,
      price,
      userId: req.currentUser!.id
    });
    await item.save();
    await new ItemCreatedPublisher(natsWrapper.client).publish({
      id: item.id,
      title: item.title,
      price: item.price,
      userId: item.userId
    });

    res.status(201).send(item);
  }
);

export {router as itemsRouter};