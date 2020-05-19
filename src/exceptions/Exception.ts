import { JsonWebTokenError, NotBeforeError, TokenExpiredError } from 'jsonwebtoken';
import { HttpError } from 'routing-controllers';

// 200번대 -> 에러가 아님 메시지만 !
export class NoContent extends HttpError {
  public message: string;
  public names: string;
  constructor(msg: string) {
    super(204);
    Object.setPrototypeOf(this, NoContent.prototype);
    this.names = this.constructor.name;
    this.message = msg;
  }
}

// 400번대 에러
export class BadRequestError extends HttpError {
  public message: string;
  constructor(msg: string) {
    super(400);
    Object.setPrototypeOf(this, BadRequestError.prototype);
    this.name = this.constructor.name;
    this.message = msg;
  }
}

export class NotFoundError extends HttpError {
  public message: string;
  constructor(msg: string) {
    super(404);
    Object.setPrototypeOf(this, NotFoundError.prototype);
    this.name = this.constructor.name;
    this.message = msg;
  }
}

export class AuthError extends HttpError {
  public err!: Error;
  constructor(err: Error) {
    if(err instanceof TokenExpiredError){
      super(401);
      Object.setPrototypeOf(this, NotFoundError.prototype);
      this.name = this.constructor.name;
      this.message = err.message;
    }
    if(err instanceof JsonWebTokenError){
      super(401);
      Object.setPrototypeOf(this, NotFoundError.prototype);
      this.name = this.constructor.name;
      this.message = err.message;
    }
    if(err instanceof NotBeforeError){
      super(401);
      Object.setPrototypeOf(this, NotFoundError.prototype);
      this.name = this.constructor.name;
      this.message = err.message;
    }
  }
}

// 500번대 에러
export class InternalServerError extends HttpError {
  public message: string;
  constructor(msg: string) {
    super(500);
    Object.setPrototypeOf(this, InternalServerError.prototype);
    this.name = this.constructor.name;
    this.message = msg;
  }
}
