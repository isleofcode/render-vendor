import childProcess from 'child_process';
import path from 'path';
import phantomjs from 'phantomjs-prebuilt';

export default class Phantom {
  constructor({ args = [], bin = phantomjs.path } = {}) {
    let script = path.join(__dirname, 'phantom', '-main.js');
    let phantom = childProcess.spawn(bin, [].concat(args, [script]));

    /* eslint-disable no-console */
    phantom.stdout.on('data', (buffer) => {
      console.log(buffer.toString() || 'could not read buffer');
    });

    phantom.stderr.on('data', (buffer) => {
      console.error(buffer.toString() || 'could not read buffer');
    });
    /* eslint-enable no-console */

    phantom.on('exit', () => {
      this.phantom = null;
    });

    this.phantom = phantom;
  }

  startServer(options) {
    this._exec({
      command: 'startServer',
      options
    });

    return options.port;
  }

  shutdown() {
    let phantom = this.phantom;

    if (phantom === null || phantom === undefined) {
      return;
    }

    if (phantom.stdin !== null && phantom.stdin !== undefined) {
      phantom.stdin.end();
    }

    phantom.kill();
  }

  _exec(body = {}) {
    this.phantom.stdin.write(`${JSON.stringify(body)}\n`, 'utf8');
  }
}
