import dotenv from 'dotenv';
import greenlock from 'greenlock-express';
import app from './app';

const ENV: string = process.env.NODE_ENV || 'dev';
if (ENV === 'prod') {
  dotenv.config({ path: `${__dirname}/../.env.prod` });
} else if (ENV === 'dev') {
  dotenv.config({ path: `${__dirname}/../.env.dev` });
} else if (ENV === 'test') {
  dotenv.config({ path: `${__dirname}/../.env.test` });
}

greenlock
  .init({
    packageRoot: '{__dirname}/..',
    configDir: './greenlock.d',

    // contact for security and critical bug notices
    maintainerEmail: 'wwlee94@naver.com',

    // whether or not to run at cloudscale
    cluster: false,
  })
  // Serves on 80 and 443
  // Get's SSL certificates magically!
  .serve(app);

// const port: number = Number(process.env.PORT) || 3000;
// app.listen(port, '0.0.0.0', () => {
//   console.log(`Server running on ${port} at ${ENV} :)`);
// });
