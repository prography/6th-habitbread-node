import moment from 'moment-timezone';
import app from './app';
import env from './configs/index';
import alarmScheduler from './jobs/AlarmScheduler';
moment.tz.setDefault('Asia/Seoul');


// Server listen
const listenServer = () => {
  app.listen(env.PORT, '0.0.0.0', async () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
  });
};

// Production & Dev 환경
const listenProdAndDev = async () => {
  alarmScheduler.SendAlarmJob();
  listenServer();
};

// local 환경
const listenLocal = async () => listenServer();

if (env.NODE_ENV === 'local') listenLocal();
else listenProdAndDev();

console.log(env);
