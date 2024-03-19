const { acquireLockWithRetry, releaseLock} = require("./lockManager")

/*
* generate a unique number based on time
*/
const generateUniqueNumber = async () => {
    try {
        await acquireLockWithRetry('lock');
        const currentTimeInMilisecond = new Date().getTime();
        await releaseLock('lock');
        return currentTimeInMilisecond;
    } catch (err) {
        throw new Error("Failed to generate an unique number");
    } 
}

module.exports = generateUniqueNumber;