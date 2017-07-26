import _ from 'lodash';
import assert from 'assert';
import { expect } from 'chai';

const {
  isError,
  isFunction,
  isString
} = _;

export default function testAsyncFunctionThrows(errorType, fn) {
  let error;

  if (isFunction(errorType)) {
    fn = errorType;
    errorType = null;
  }

  assert.ok(isFunction(fn));

  beforeEach(async function() {
    try {
      await fn();
    } catch (err) {
      error = err;
    }
  });

  if (isError(errorType)) {
    it (`throws the provided ${errorType.constructor.name}`, function() {
      expect(error).to.equal(errorType);
    });
  } else if (isString(errorType)) {
    it(`throws an ${errorType}`, function() {
      expect(isError(error)).to.equal(true);
      expect(error.constructor.name).to.equal(errorType);
    });
  } else {
    it('throws', function() {
      expect(isError(error)).to.equal(true);
    });
  }
}


