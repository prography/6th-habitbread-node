import express from 'express';

const app = express();

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello TypeScript & Express :)');
});

export default app;
// eslint-disable-next-line prettier/prettier
