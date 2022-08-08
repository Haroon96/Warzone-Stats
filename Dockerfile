FROM node:latest

# User configurable environment variables
ENV TOKEN=ADD_YOUR_DISCORD_BOT_TOKEN_HERE


# Fixed environment variables
ENV MONGO_DBNAME=warzone-stats
ENV MONGO_URI=mongodb://mongo:27017/
ENV PATH=/app:$PATH


# Copy dependencies over
WORKDIR /app
ADD ["src", "./src"]
ADD ["res", "./res"]
COPY ["package.json", "tsconfig.json", "./"]


# Download and install dependencies
RUN ["npm", "install"]
RUN ["apt", "update"]
RUN ["apt", "install", "-y", "firefox-esr"]
RUN ["wget", "https://github.com/mozilla/geckodriver/releases/download/v0.31.0/geckodriver-v0.31.0-linux32.tar.gz"]
RUN ["tar", "xvf", "geckodriver-v0.31.0-linux32.tar.gz"]


# Build the app
RUN ["npm", "run", "build"]


# Start the app
CMD ["npm", "start"]
