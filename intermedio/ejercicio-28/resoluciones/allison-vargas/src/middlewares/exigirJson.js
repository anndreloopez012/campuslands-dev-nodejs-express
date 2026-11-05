import { UnsupportedMediaError } from '../utils/errors.js';

const JSON_TYPE = /^application\/json\s*(;|$)/i;

export const exigirJson = (req, res, next) => {
  if (JSON_TYPE.test(req.headers['content-type'] || '')) return next();
  return next(new UnsupportedMediaError());
};
