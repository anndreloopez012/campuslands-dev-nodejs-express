import dotenv from 'dotenv';

dotenv.config();

export const config = {
  puerto: process.env.PORT || 3000,
};
