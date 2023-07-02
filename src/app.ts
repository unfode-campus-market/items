import express from 'express';
import 'express-async-errors';
import cookieSession from "cookie-session";

import {currentUser, errorHandler, NotFoundError} from "@campus-market/common";
import {itemsRouter} from "./routes/items";

const app = express();
app.set('trust proxy', true);
app.use(express.json());
app.use(cookieSession({
  signed: false,
  secure: false
}));

app.use(currentUser);

app.use('/api/items', itemsRouter);

app.all('*', () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export {app};