// import scheduler from './schedulers/RankScheduler';
import app from './app';
import ENV from './configs/index';

const initGreenlock = () => {
  require('greenlock-express')
    .init({
      packageRoot: `${__dirname}/..`,
      configDir: './src/configs/greenlock.d',
      // contact for security and critical bug notices
      maintainerEmail: 'wwlee94@naver.com',
      // whether or not to run at cloudscale
      cluster: false,
    })
    // Serves on 80 and 443
    .serve(app);
};

const listen = () => {
  app.listen(ENV.PORT, '0.0.0.0', () => {
    console.log(`Server running on ${ENV.PORT} at ${ENV.NODE_ENV} :)`);
    // scheduler.RankingUpdateJob();
  });
};

if (ENV.NODE_ENV === 'prod') initGreenlock();
else if (ENV.NODE_ENV === 'dev') listen();

console.log(ENV);
