# Base image
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose port Vite
EXPOSE 5173

# Start Vite dev server
CMD ["npm", "run", "dev", "--", "--host"]
