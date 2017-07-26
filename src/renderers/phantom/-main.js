import system from 'system';

const { Server } = require(`${phantom.libraryPath}/server`);
const { Logger } = require(`${phantom.libraryPath}/utils/logger`);
const { PhantomError } = require(`${phantom.libraryPath}/utils/error`);

const logger = new Logger('Main');
let server = new Server();

phantom.onError = function onError(msg, trace) {
  let error = new PhantomError(msg, trace);

  phantom.exit(1);
  logger.error(error);
};

try {
  while (!server.isBooted && !server.isBooting) {
    let port = system.stdin.readLine();
    server.boot(port);
  }
} catch (error) {
  logger.error(error);
  phantom.exit(1);
}
