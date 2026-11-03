# imagen chica con la version de node que pide package.json
FROM node:20-alpine

ENV NODE_ENV=production
WORKDIR /app

# primero solo package*.json: asi docker reusa la capa de dependencias si no cambian
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund

COPY src ./src

# no correr como root
USER node

EXPOSE 4029

# docker revisa solo si el proceso sigue vivo
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 4029) + '/health/live').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# node directo (no npm start) para que le lleguen las senales SIGTERM
CMD ["node", "src/index.js"]
