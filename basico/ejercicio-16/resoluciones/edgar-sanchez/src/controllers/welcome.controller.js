import {
  getHealthResponse,
  getWelcomeResponse,
} from '../services/welcome.service.js';

export function welcomeController(_request, response) {
  response.status(200).json(getWelcomeResponse());
}

export function healthController(_request, response) {
  response.status(200).json(getHealthResponse());
}