FROM oven/bun:1

WORKDIR /app

# Copiar dependencias
COPY package.json bun.lock ./
RUN bun install

# Copiar código
COPY . .

# Exponer puerto
EXPOSE 3000

# Ejecutar app
CMD ["bun", "run", "src/index.ts"]