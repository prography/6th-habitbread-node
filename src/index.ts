import dotenv from 'dotenv';
import app from './app';
import scheduler from './schedulers/RankScheduler';

const initGreenlock = () => {
  require('greenlock-express')
    .init({
      packageRoot: `${__dirname}/..`,
      configDir: './config/greenlock.d',
      // contact for security and critical bug notices
      maintainerEmail: 'wwlee94@naver.com',
      // whether or not to run at cloudscale
      cluster: false,
    })
    // Serves on 80 and 443
    .serve(app);
};

const port: number = Number(process.env.PORT) || 3000;
const ENV: string = process.env.NODE_ENV || 'dev';

if (ENV === 'prod') {
  dotenv.config({ path: `${__dirname}/../.env.prod` });
  initGreenlock();
} else if (ENV === 'dev') {
  dotenv.config({ path: `${__dirname}/../.env.dev` });
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on ${port} at ${ENV} :)`);
    scheduler.RankingUpdateJob();
  });
}
