import { CustomError } from './custom-error';

export class DatabaseConnectionError extends CustomError {
  public statusCode = 500;
  public reason = 'Error connecting to database';

  constructor() {
    super('Error connecting to database');

    // Only because we are extending a built-in class
    Object.setPrototypeOf(this, DatabaseConnectionError.prototype);
  }

  public serializeErrors() {
    return [{ message: this.reason }];
  }
}
