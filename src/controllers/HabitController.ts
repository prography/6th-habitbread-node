import { PrismaClient } from '@prisma/client';
import { validate } from 'class-validator';
import { Response } from 'express';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { Body, CurrentUser, Delete, Get, HttpError, JsonController, Params, Post, Put, Res } from 'routing-controllers';
import { AuthError, BadRequestError, NoContent, NotFoundError } from '../exceptions/Exception';
import { Habit, ID } from '../validations/HabitValidation';
import { BaseController } from './BaseController';

@JsonController('/habits')
export class HabitController extends BaseController {
  private prisma: PrismaClient;

  constructor() {
    super();
    this.prisma = new PrismaClient();
  }

  // 습관 등록하기
  @Post('/')
  public async createHabit(@CurrentUser() tokenPayload: any, @Body() habit: Habit, @Res() res: Response) {
    try {
      if (tokenPayload === null) throw new BadRequestError('AccesToken이 없습니다.');
      if (tokenPayload === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
      if (tokenPayload instanceof TokenExpiredError || tokenPayload instanceof JsonWebTokenError)
        throw new AuthError(tokenPayload);

      const bodyErrors = await validate(habit);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const user = await this.prisma.user.findOne({
        where: { userId: tokenPayload },
      });

      if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');

      const newHabit = await this.prisma.habit.create({
        data: {
          title: habit.title,
          description: habit.description,
          category: habit.category,
          user: {
            connect: { userId: tokenPayload },
          },
        },
      });

      if (habit.isScheduled === true) {
        // 추후 스케줄 작업 필요
      } else {
        // 추후 스케줄 작업 필요
      }

      return newHabit;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // 전체 습관 조회하기
  @Get('/')
  public async findHabits(@CurrentUser() tokenPayload: any, @Res() res: Response) {
    try {
      if (tokenPayload === null) throw new BadRequestError('AccesToken이 없습니다.');
      if (tokenPayload === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
      if (tokenPayload instanceof TokenExpiredError || tokenPayload instanceof JsonWebTokenError)
        throw new AuthError(tokenPayload);

      const user = await this.prisma.user.findOne({
        where: { userId: tokenPayload },
        select: {
          Habit: true,
        },
      });
      if (user === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (user.Habit.length === 0) throw new NoContent('');
      return user;
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // habitId로 습관 조회하기
  @Get('/:habitId')
  public async findHabit(@CurrentUser() tokenPayload: any, @Params() id: ID, @Res() res: Response) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
      if (tokenPayload === null) throw new BadRequestError('AccesToken이 없습니다.');
      if (tokenPayload === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
      if (tokenPayload instanceof TokenExpiredError || tokenPayload instanceof JsonWebTokenError)
        throw new AuthError(tokenPayload);

      const habit = await this.prisma.user
        .findOne({
          where: { userId: tokenPayload },
        })
        .Habit({
          where: { habitId: id.habitId },
        });

      if (habit === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (habit.length === 0) throw new NotFoundError('습관을 찾을 수 없습니다.');
      return habit[0];
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // habitId로 습관 수정하기
  @Put('/:habitId')
  public async updateHabit(
    @CurrentUser() tokenPayload: any,
    @Params() id: ID,
    @Body() habit: Habit,
    @Res() res: Response
  ) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
      if (tokenPayload === null) throw new BadRequestError('AccesToken이 없습니다.');
      if (tokenPayload === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
      if (tokenPayload instanceof TokenExpiredError || tokenPayload instanceof JsonWebTokenError)
        throw new AuthError(tokenPayload);
      const bodyErrors = await validate(habit);
      if (bodyErrors.length > 0) throw new BadRequestError(bodyErrors);

      const findHabit = await this.prisma.user
        .findOne({
          where: { userId: tokenPayload },
        })
        .Habit({
          where: { habitId: id.habitId },
        });

      if (findHabit === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (findHabit.length === 0) throw new NotFoundError('습관을 찾을 수 없습니다.');
      return await this.prisma.habit.update({
        where: { habitId: id.habitId },
        data: {
          title: habit.title,
          description: habit.description,
          category: habit.category,
          user: {
            connect: { userId: tokenPayload },
          },
        },
      });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }

  // habitId로 습관 삭제하기
  @Delete('/:habitId')
  public async deleteHabit(@CurrentUser() tokenPayload: any, @Params() id: ID, @Res() res: Response) {
    try {
      const paramErrors = await validate(id);
      if (paramErrors.length > 0) throw new BadRequestError(paramErrors);
      if (tokenPayload === null) throw new BadRequestError('AccesToken이 없습니다.');
      if (tokenPayload === false) throw new BadRequestError('Token 형식이 올바르지 않습니다.');
      if (tokenPayload instanceof TokenExpiredError || tokenPayload instanceof JsonWebTokenError)
        throw new AuthError(tokenPayload);

      const findHabit = await this.prisma.user
        .findOne({
          where: { userId: tokenPayload },
        })
        .Habit({
          where: { habitId: id.habitId },
        });

      if (findHabit === null) throw new NotFoundError('사용자를 찾을 수 없습니다.');
      else if (findHabit.length === 0) throw new NotFoundError('습관을 찾을 수 없습니다.');
      await this.prisma.habit.delete({
        where: {
          habitId: id.habitId,
        },
      });

      return res.status(200).send({ message: 'success' });
    } catch (err) {
      if (err instanceof HttpError) return res.status(err.httpCode).send(err);
      throw new HttpError(err);
    }
  }
}
