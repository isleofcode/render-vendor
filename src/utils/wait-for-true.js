import _ from 'lodash';
import RSVP from 'rsvp';

import makeErrorType from './make-error-type';

const { isFinite } = _;
const { Promise } = RSVP;

const CHECK_INTERVAL = 50;

export const TimeoutError = makeErrorType('TimeoutError');

export default async function waitForTrue(callback, timeout) {
  let isTrue = callback();
  let didTimeout = false;
  let timeoutInterval = Number(timeout);

  if (isFinite(timeoutInterval) && timeoutInterval > 0) {
    setTimeout(() => didTimeout = true, timeoutInterval);
  }

  while (!isTrue && !didTimeout) {
    isTrue = await new Promise((resolve) => {
      setTimeout(() => resolve(callback(), CHECK_INTERVAL));
    });
  }

  if (didTimeout) {
    throw new TimeoutError();
  }
}
