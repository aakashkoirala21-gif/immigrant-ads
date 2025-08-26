import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';

export const validate =
  (schema: ObjectSchema) => (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      res.status(422).json({
        success: false,
        message: 'Validation error',
        error: error.details.map((d) => d.message),
      });
      return; // ✅ this ensures the function returns void
    }
    next(); // ✅ next() returns void
  };
