/* global describe */
/* global test */
/* global expect */
/* global beforeEach */
const chrome = require('sinon-chrome/extensions');
const auth = require('../src/shared/js/auth');


describe('auth', () => {
  beforeEach(() => {
    global.chrome = chrome;
  });

  test('should be an object', () => {
    expect(auth).toBeInstanceOf(Object);
  });

  test('setStateInStorage is working', async () => {
    expect.assertions(1);
    await auth.setStateInStorage({
      val: '0000',
      expiresAt: Date.now(),
    }).then((state) => {
      expect(state).toBeInstanceOf(Object);
    }).catch((error) => {
      expect(error).toBeInstanceOf(Error);
    });
  });

  test('should have function getAuthState', () => {
    expect(auth).toHaveProperty('getAuthState');
    expect(auth.getAuthState).toBeInstanceOf(Function);
  });

  describe('auth.getAuhState', () => {
    const goodState = {
      val: '0000',
      expiresAt: Date.now(),
    };

    test('should resolve as a Promise', async () => {
      await expect(auth.getAuthState()).toBeInstanceOf(Promise);
      await expect(auth.getAuthState()).toBeInstanceOf(Promise);
    });

    test('should resolve if good previousState object', async () => {
      expect.assertions(2);
      await auth.getAuthState(goodState).then((state) => {
        expect(state).toHaveProperty('val');
        expect(state).toHaveProperty('expiresAt');
      });
    });

    test('should resolve if previousState undefined', async () => {
      expect.assertions(2);
      await auth.getAuthState().then((state) => {
        expect(state).toHaveProperty('val');
        expect(state).toHaveProperty('expiresAt');
      });
    });

    test('should reject as an Error if previousState is not an object', async () => {
      await expect(auth.getAuthState('badstate')).rejects.toBeInstanceOf(Error);
      await expect(auth.getAuthState(1234)).rejects.toBeInstanceOf(Error);
    });
  });

  test('should return a promise', () => {
    expect(auth.getAuthState()).toBeInstanceOf(Promise);
  });

  test('should have function getAuthToken', () => {
    expect(auth).toHaveProperty('getAuthToken');
    expect(auth.getAuthToken).toBeInstanceOf(Function);
  });
});
