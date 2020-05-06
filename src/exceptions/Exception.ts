import { HttpError } from 'routing-controllers';

const reg = new RegExp('(/.*.js)');

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

// 500번대 에러
export class InternalServerError extends HttpError {
  public message: string;
  constructor(msg: string) {
    super(500);
    Object.setPrototypeOf(this, InternalServerError.prototype);
    this.name = this.constructor.name;
    this.message = msg.replace(reg, '*');
    this.stack = undefined;
  }
}
