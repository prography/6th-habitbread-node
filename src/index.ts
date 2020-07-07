import app from './app';
import env from './configs/index';
import alarmScheduler from './jobs/AlarmScheduler';
import scheduler from './jobs/RankScheduler';

// Server listen
const listenServer = () => {
  app.listen(env.PORT, '0.0.0.0', async () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
  });
};

// Server listen
const listenServer = () => {
  app.listen(env.PORT, '0.0.0.0', async () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
  });
};

// Production 환경
const listenProd = async () => {
  scheduler.RankingUpdateJob();
  alarmScheduler.SendAlarmJob();
  listenServer();
};

// Develop 환경
const listenDev = async () => {
  scheduler.RankingUpdateJob();
  alarmScheduler.SendAlarmJob();
  listenServer();
};

if (env.NODE_ENV === 'prod') listenProd();
else if (env.NODE_ENV === 'dev') listenDev();

console.log(env);
