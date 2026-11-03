import {
  getHealth,
  getMenuItem,
  getRoot,
  listMenu
} from "../controllers/menu.controller.js";

const allowedMethods = ["GET"];

export function resolveRoute(method, pathname) {
  if (pathname === "/") {
    return { handler: getRoot, allowedMethods };
  }

  if (pathname === "/health") {
    return { handler: getHealth, allowedMethods };
  }

  if (pathname === "/menu") {
    return { handler: listMenu, allowedMethods };
  }

  const menuItemMatch = pathname.match(/^\/menu\/([^/]+)$/);

  if (menuItemMatch) {
    return {
      handler: getMenuItem,
      args: [decodeURIComponent(menuItemMatch[1])],
      allowedMethods
    };
  }

  return null;
}