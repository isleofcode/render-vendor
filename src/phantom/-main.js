import system from 'system';

const Server = require(`${phantom.libraryPath}/server`).default;
const Logger = require(`${phantom.libraryPath}/utils/logger`).default;
const PhantomError = require(`${phantom.libraryPath}/utils/error`).default;

const logger = new Logger('Main');
const server = new Server();

phantom.onError = function onError(msg, trace) {
  let error = new PhantomError(msg, trace);

  phantom.exit(1);
  logger.error(error);
};

try {
  let buffer = system.stdin.readLine();
  let json = JSON.parse(buffer.toString() || '');

  switch (json.command) {
    case 'startServer':
      server.start(json.options);
      break;
    default:
      throw new Error('could not interpret command');
  }
} catch (error) {
  logger.error(error);
  phantom.exit(1);
}
