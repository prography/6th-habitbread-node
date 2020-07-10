import RankSchduler, { rankingJob } from '../jobs/RankScheduler';

// 서버 실행 시 Job 1회 실행
rankingJob();

// 랭킹 스케줄러 등록
RankSchduler.RankingUpdateJob();
