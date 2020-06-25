import app from './app';
import env from './configs/index';
import alarmScheduler from './schedulers/AlarmScheduler';
import scheduler from './schedulers/RankScheduler';

// Server listen
const listenServer = () => {
  app.listen(env.PORT, '0.0.0.0', async () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
  });
};

// Production 환경
const listenProd = async () => {
  // await require('greenlock-express')
  //   .init({
  //     packageRoot: `${__dirname}/..`,
  //     configDir: './src/configs/greenlock.d',
  //     // contact for security and critical bug notices
  //     maintainerEmail: 'wwlee94@naver.com',
  //     // whether or not to run at cloudscale
  //     cluster: false,
  //   })
  //   // Serves on 80 and 443
  //   .serve(app);
  listenServer();
  
  scheduler.RankingUpdateJob();
  alarmScheduler.AlarmUpdateJob();
  alarmScheduler.SendAlarmJob();
  await alarmScheduler.UpsertAlarmQueue();
};

if (env.NODE_ENV === 'prod') listenProd();
else if (env.NODE_ENV === 'dev') listenServer();

console.log(env);
