FROM node:20

WORKDIR /app

# Copy server files
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install

# Copy rest of server code
COPY server/ .
RUN npm run build

EXPOSE 7860

# Ensure the server knows which port to use via env var
ENV PORT=7860

# Start from the server directory
CMD ["npm", "start"]
