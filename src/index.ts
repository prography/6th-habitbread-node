// import scheduler from './schedulers/RankScheduler';
import app from './app';
import env from './configs/index';

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
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
    // scheduler.RankingUpdateJob();
  });
};

if (env.NODE_ENV === 'prod') initGreenlock();
else if (env.NODE_ENV === 'dev') listen();

console.log(env);
