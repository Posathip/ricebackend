import { HttpException, InternalServerErrorException } from '@nestjs/common';

/**
 * Logs the error with its context and rethrows it as a NestJS HTTP exception.
 * Exceptions that are already HttpExceptions (NotFound, BadRequest, ...) pass through unchanged.
 */
export function rethrowAsHttpException(context: string, error: unknown): never {
  console.error(`[${context}]`, error);
  if (error instanceof HttpException) throw error;
  const message = error instanceof Error ? error.message : String(error);
  throw new InternalServerErrorException(message);
}
