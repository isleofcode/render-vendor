import system from 'system';

export class Logger {
  constructor(name) {
    this.name = name;
  }

  emit(sentinel, data = '') {
    system.stdout.write(`${sentinel}\n${data}`);
  }

  info(message) {
    this.print(message);
  }

  error(err) {
    let message = err.toString();

    if (typeof err.stack === 'string') {
      message = `${message}:\nStack: ${err.stack}`;
    }

    this.print(message, system.stderr);
  }

  print(message, stream = system.stdout) {
    stream.write(`RenderVendor (${this.name}): ${message}`);
  }
}

export default Logger;
