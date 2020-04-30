import dotenv from 'dotenv';
import app from './app';

const ENV: string = process.env.NODE_ENV || 'dev';
if (ENV === 'prod') {
  dotenv.config({ path: `${__dirname}/../.env.prod` });
} else if (ENV === 'dev') {
  dotenv.config({ path: `${__dirname}/../.env.dev` });
}

const port: number = Number(process.env.PORT) || 3000;
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on ${port} :)`);
  console.log(ENV);
  console.log(process.env.DB_URL);
});
