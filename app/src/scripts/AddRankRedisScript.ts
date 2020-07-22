import { disconnect, rankingJob } from '../jobs/RankScheduler';

const run = async () => {
  // 스케줄러 1회 실행
  await rankingJob();
  await disconnect();
};

// 스크립트 실행
run();
