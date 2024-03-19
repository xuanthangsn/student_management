const MINIMUM_LOCK_TIME = 1; // 1 MILISECOND
const ACQUIRE_LOCK_RETRY_AFTER = 30; // 30 MILISECONDS
const MAXIMUM_ACQUIRE_LOCK_RETRY = 4;
const RELEASE_LOCK_RETRY_AFTER = 2;
const MAXIMUM_RELEASE_LOCK_RETRY = 2;

/*
 * if lock.get(lockName) == false means a lock names 'lockName' is help and cannot be released
 * if lock.get(lockName) == true means a lock names 'lockName' is help and can be released
 * if lock doesn't have a key names 'lockName' then a lock names 'lockName' is not help
 */
const lock = new Map();

const wait = require("./wait.js");


// acquire the lock and hold it for at least MINIMUM_LOCK_TIME
const acquireLock = (lockName) => {
  if (!lock.has(lockName)) {
    lock.set(lockName, false);
    setTimeout(() => {
      lock.set(lockName, true);
    }, MINIMUM_LOCK_TIME);

    return true;
  }
  return false;
};

const acquireLockWithRetry = async (lockName) => {
  return new Promise(async (res, rej) => {
    let attempt = 0;
    while (attempt < MAXIMUM_ACQUIRE_LOCK_RETRY) {
      if (acquireLock(lockName)) {
        return res();
      } else {
        attempt++;
        if (attempt === MAXIMUM_ACQUIRE_LOCK_RETRY) break;
        await wait(ACQUIRE_LOCK_RETRY_AFTER);
      }
    }

    return rej(new Error(`Failed to acquire lock "${lockName}"`));
  });
};

const releaseLock = async (lockName) => {
  return new Promise(async (resolve, reject) => {
    if (!lock.has(lockName)) return resolve();

    let attmept = 0;

    while (attmept < MAXIMUM_RELEASE_LOCK_RETRY) {
      if (lock.get(lockName)) {
        lock.delete(lockName);
        return resolve();
      } else {
        attmept++;
        if (attmept === MAXIMUM_RELEASE_LOCK_RETRY) {
          break;
        }
        await wait(RELEASE_LOCK_RETRY_AFTER);
      }
    }

    return reject(new Error("Failed to release lock"));
  });
};

module.exports = {
  acquireLockWithRetry,
  releaseLock,
};

