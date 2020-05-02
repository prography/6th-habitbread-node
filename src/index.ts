import dotenv from 'dotenv';
import app from './app';

const ENV: string = process.env.NODE_ENV || 'dev';
if (ENV === 'prod') {
  dotenv.config({ path: `${__dirname}/../.env.prod` });
} else if (ENV === 'dev') {
  dotenv.config({ path: `${__dirname}/../.env.dev` });
} else if (ENV === 'test') {
  dotenv.config({ path: `${__dirname}/../.env.test` });
}

const port: number = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${port} at ${ENV} :)`);
});
