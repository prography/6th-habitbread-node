import app from './app';
import env from './configs/index';
import scheduler from './schedulers/AlarmScheduler';

// Production 환경
const listenProd = () => {
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

// Develop 환경
const listenDev = () => {
  app.listen(env.PORT, '0.0.0.0', () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
    scheduler.AlarmUpdateJob();
    scheduler.SendAlarmJob();
  });
};

if (env.NODE_ENV === 'prod') listenProd();
else if (env.NODE_ENV === 'dev') listenDev();

console.log(env);
