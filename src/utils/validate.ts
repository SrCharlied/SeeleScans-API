import { z, type ZodSchema } from 'zod';
import { badRequest } from './errors';

const formatIssue = (issue: z.ZodIssue): string => {
  const path = issue.path.length > 0 ? issue.path.join('.') + ': ' : '';
  return `${path}${issue.message}`;
};

export const validateBody = <T extends ZodSchema>(schema: T, data: unknown): z.infer<T> => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw badRequest(formatIssue(result.error.issues[0]!));
  }
  return result.data as z.infer<T>;
};

export const validateQuery = <T extends ZodSchema>(schema: T, query: unknown): z.infer<T> => {
  const result = schema.safeParse(query);
  if (!result.success) {
    throw badRequest(formatIssue(result.error.issues[0]!));
  }
  return result.data as z.infer<T>;
};

export const validateParams = <T extends ZodSchema>(schema: T, params: unknown): z.infer<T> => {
  const result = schema.safeParse(params);
  if (!result.success) {
    throw badRequest(formatIssue(result.error.issues[0]!));
  }
  return result.data as z.infer<T>;
};
