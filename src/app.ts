import express from 'express';
import { v4 as uuid } from 'uuid';

const app = express();
const id: string = uuid();

app.get('/', (req: express.Request, res: express.Response) => {
  res.send(`Hello TypeScript & Express :)\n ${id}`);
});

export default app;
