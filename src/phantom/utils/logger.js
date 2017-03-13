import system from 'system';

export default class Logger {
  constructor(name) {
    this.name = name;
  }

  info(message) {
    system.stdout.write(this.print(message));
  }

  error(err) {
    let message = `Error: ${err.message}`;

    if (typeof err.stack === 'string') {
      message = `${message}\nStack: ${err.stack}`;
    }

    system.stderr.write(this.print(message));
  }

  print(message) {
    return `RenderVendor - ${this.name}: ${message}`;
  }
}
