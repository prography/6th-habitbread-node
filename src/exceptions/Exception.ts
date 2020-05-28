import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { HttpError } from 'routing-controllers';

const reg = new RegExp('(/.*.js)');

// 200번대 -> 에러가 아님 메시지만 !
export class NoContent extends HttpError {
  public message: any;
  constructor(msg: any) {
    super(204);
    Object.setPrototypeOf(this, NoContent.prototype);
    this.name = this.constructor.name;
    this.message = msg;
    this.stack = undefined;
  }
}

// 400번대 에러
export class BadRequestError extends HttpError {
  public message: any;
  constructor(msg: any) {
    super(400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.name = this.constructor.name;
    this.message = msg;
    this.stack = undefined;
  }
}

export class UnauthorizedError extends HttpError {
  public message: any;
  constructor(msg: any) {
    super(401);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
    this.name = this.constructor.name;
    this.message = msg;
    this.stack = undefined;
  }
}

export class NotFoundError extends HttpError {
  public message: any;
  constructor(msg: any) {
    super(404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.name = this.constructor.name;
    this.message = msg;
    this.stack = undefined;
  }
}

export class AuthError extends HttpError {
  public err: any;
  constructor(err: any) {
    super(401);
    if (err instanceof TokenExpiredError) {
      Object.setPrototypeOf(this, AuthError.prototype);
      this.name = err.name;
      this.message = err.message;
      this.stack = undefined;
    }
    if (err instanceof JsonWebTokenError) {
      Object.setPrototypeOf(this, AuthError.prototype);
      this.name = err.name;
      this.message = err.message;
      this.stack = undefined;
    }
    if (err instanceof NotBeforeError) {
      Object.setPrototypeOf(this, AuthError.prototype);
      this.name = err.name;
      this.message = err.message;
      this.stack = undefined;
    }
  }
}

// 500번대 에러
export class InternalServerError extends HttpError {
  public message: any;
  constructor(msg: any) {
    super(500);
    Object.setPrototypeOf(this, InternalServerError.prototype);
    this.name = this.constructor.name;
    this.message = msg.replace(reg, '*');
    this.stack = undefined;
  }
}
