import app from './app';
import env from './configs/index';
import alarmScheduler from './schedulers/AlarmScheduler';
import scheduler from './schedulers/RankScheduler';

// Production 환경
const listenProd = async () => {
  await require('greenlock-express')
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
  scheduler.RankingUpdateJob();
  alarmScheduler.AlarmUpdateJob();
  alarmScheduler.SendAlarmJob();
  await alarmScheduler.UpsertAlarmQueue();
};

// Develop 환경
const listenDev = async () => {
  scheduler.RankingUpdateJob();
  alarmScheduler.AlarmUpdateJob();
  alarmScheduler.SendAlarmJob();
  alarmScheduler.UpsertAlarmQueue();
  app.listen(env.PORT, '0.0.0.0', async () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
  });
};

if (env.NODE_ENV === 'prod') listenProd();
else if (env.NODE_ENV === 'dev') listenDev();

console.log(env);
