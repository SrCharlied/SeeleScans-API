export class AppError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
  }
}

export const badRequest = (message: string): AppError => {
  return new AppError(message, 400);
};

export const notFound = (message: string): AppError => {
  return new AppError(message, 404);
};

export const serverError = (message: string): AppError => {
  return new AppError(message, 500);
};