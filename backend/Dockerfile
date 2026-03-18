FROM node:20-alpine

# OpenShift runs containers as arbitrary non-root UIDs.
# Grant the root group (which OpenShift assigns) write access.
WORKDIR /app

COPY package*.json ./
RUN npm install --production && npm cache clean --force

COPY . .

# Allow any UID assigned by OpenShift to run correctly
RUN chown -R root:root /app && chmod -R g=u /app

EXPOSE 5000

USER 1001

CMD ["node", "server.js"]
