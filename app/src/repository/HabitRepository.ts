import { HabitCreateInput, HabitUpdateInput, PrismaClient } from '@prisma/client';
import moment from 'moment-timezone';
import { BaseRepository } from './BaseRepository';

export class HabitRepository extends BaseRepository {
  private prisma: PrismaClient;

  constructor() {
    super();
    moment.tz.setDefault('Asia/Seoul');
    this.prisma = new PrismaClient();
  }

  public async disconnect(){
    await this.prisma.disconnect()
  }

  // 습관 추가하기 (with 사용자)
  public async create(payload: HabitCreateInput) {
    return this.prisma.habit.create({
      data: payload,
    });
  }

  // userId로 모든 습관 찾기
  public async findAll(userId: number){
    return this.prisma.habit.findMany({
      where: { userId }
    });
  }

  // habitId로 습관 찾기
  public async findById(habitId: number) {
    return this.prisma.habit.findOne({
      where: { habitId },
    });
  }

  public async findAllByUserId(userId: number) {
    return this.prisma.habit.findMany({
      where: { userId },
      select: {
        habitId: true,
        title: true,
        description: true,
        dayOfWeek: true,
        commitHistory: {
          select: { createdAt: true },
        },
      },
    });
  }

  public async findByIdWithinYearAndMonth(habitId: number, year: number, month: number) {
    return this.prisma.habit.findOne({
      where: { habitId },
      include: {
        commitHistory: {
          where: {
            createdAt: {
              gte: moment().subtract(month, 'months').subtract(year, 'years').startOf('months').toDate(),
              lte: moment().subtract(month, 'months').subtract(year, 'years').endOf('months').toDate(),
            },
          },
          select: { createdAt: true },
        },
      },
    });
  }

  // 임시 메서드 네이밍 논의 (어떤 역할을 하는지?)
  public async findForTemp(habitId: number, checkDays: number) {
    return this.prisma.habit.findOne({
      where: { habitId },
      include: {
        commitHistory: {
          where: {
            createdAt: {
              gte: moment().subtract(checkDays, 'days').startOf('days').toDate(),
              lte: moment().endOf('days').toDate(),
            },
          },
        },
      },
    });
  }

  // 기본 습관 업데이트 메서드
  public async updateById(habitId: number, payload: HabitUpdateInput) {
    return this.prisma.habit.update({
      where: { habitId },
      data: payload,
    });
  }

  // 습관 연속 커밋 횟수 + 사용자 경험치 업데이트
  public async updateCountAndUserExp(habitId: number, continuousCount: number, userExp: number) {
    return this.prisma.habit.update({
      where: { habitId },
      data: {
        commitHistory: { create: {} },
        continuousCount,
        user: {
          update: { exp: userExp + 10 },
        },
      },
      select: {
        user: true,
      },
    });
  }

  // 특정 year, month 값으로 습관 조회하기
  public async updateByIdWithinYearAndMonth(habitId: number, year: number, month: number) {
    return this.prisma.habit.update({
      where: { habitId },
      data: { continuousCount: 0 },
      include: {
        commitHistory: {
          where: {
            createdAt: {
              gte: moment().subtract(month, 'months').subtract(year, 'years').startOf('months').toDate(),
              lte: moment().subtract(month, 'months').subtract(year, 'years').endOf('months').toDate(),
            },
          },
          select: { createdAt: true },
        },
      },
    });
  }

  // habitId로 습관 삭제
  public async deleteById(habitId: number) {
    return this.prisma.habit.delete({ where: { habitId } });
  }
}
