import { Response } from 'express';

interface SendResponseOptions<T = any> {
  res: Response;
  statusCode?: number;
  success?: boolean;
  message: string;
  data?: T;
  error?: any;
}

export function sendResponse<T>({
  res,
  statusCode = 200,
  success = true,
  message,
  data,
  error,
}: SendResponseOptions<T>) {
  return res.status(statusCode).json({
    success,
    message,
    data: data || null,
    error: error || null,
  });
}
