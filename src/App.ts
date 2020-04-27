import express from 'express';
import dotenv from 'dotenv';

const ENV: string = process.env.NODE_ENV || 'dev';
if (ENV === 'prod') {
  dotenv.config({path: `${__dirname}/../../.env.prod`});
}
else if(ENV === 'dev'){
  dotenv.config({path: `${__dirname}/../.env.dev`});
}

const app = express();

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello TypeScript & Express');
});

const port: number = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log('서버 시작');
  console.log(process.env.NODE_ENV);
  console.log(process.env.DB_URL);
});
