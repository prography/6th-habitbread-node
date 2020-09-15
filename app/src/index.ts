import app from './app';
import env from './configs/index';
import alarmScheduler from './jobs/AlarmScheduler';
import RedisRepository from './repository/RedisRepository';

// Server listen
const listenServer = () => {
  app.listen(env.PORT, '0.0.0.0', async () => {
    console.log(`Server running on ${env.PORT} at ${env.NODE_ENV} :)`);
  });
};

// Production 환경
const listenProd = async () => {
  alarmScheduler.SendAlarmJob();
  listenServer();
};

// Develop 환경
const listenDev = async () => listenServer();

if (env.NODE_ENV === 'prod') listenProd();
else if (env.NODE_ENV === 'dev') listenDev();

process.on('SIGINT', async () => {
  await RedisRepository.getInstance().quit();
});

console.log(env);
