// Helper functions.
import dayjs from 'dayjs';
//Based on http://www.samliew.com/icval/
/* eslint-disable */
const validateNRIC = function(str) {
    if (str.length != 9) 
        return false;

    str = str.toUpperCase();

    var i, 
        icArray = [];
    for(i = 0; i < 9; i++) {
        icArray[i] = str.charAt(i);
    }

    icArray[1] = parseInt(icArray[1], 10) * 2;
    icArray[2] = parseInt(icArray[2], 10) * 7;
    icArray[3] = parseInt(icArray[3], 10) * 6;
    icArray[4] = parseInt(icArray[4], 10) * 5;
    icArray[5] = parseInt(icArray[5], 10) * 4;
    icArray[6] = parseInt(icArray[6], 10) * 3;
    icArray[7] = parseInt(icArray[7], 10) * 2;

    var weight = 0;
    for(i = 1; i < 8; i++) {
        weight += icArray[i];
    }

    var offset = (icArray[0] == "T" || icArray[0] == "G") ? 4:0;
    var temp = (offset + weight) % 11;

    var st = ["J","Z","I","H","G","F","E","D","C","B","A"];
    var fg = ["X","W","U","T","R","Q","P","N","M","L","K"];

    var theAlpha;
    if (icArray[0] == "S" || icArray[0] == "T") { theAlpha = st[temp]; }
    else if (icArray[0] == "F" || icArray[0] == "G") { theAlpha = fg[temp]; }

    return (icArray[8] === theAlpha);
}
/* eslint-enable */

// Set Session
const session = {
    setSession(key, value) {
        sessionStorage.setItem(key, JSON.stringify(value));
    },
    getSession(key) {
        return sessionStorage.getItem(key) ? JSON.parse(sessionStorage.getItem(key)) : false;
    },
    removeSession(key) {
        sessionStorage.removeItem(key);
    }
}

// Helper to find time difference.
const calculateTimeLeft = (val) => {
    let endDate = dayjs(val);
    let currentDate = dayjs();
    let difference = endDate.diff(currentDate);
    let timeLeft = {};

    if (difference > 0) {
        timeLeft = {
            days: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes: Math.floor((difference / 1000 / 60) % 60),
            seconds: Math.floor((difference / 1000) % 60),
            totalTimeLeftInSec : difference
        };
    }

    return timeLeft;
}

export { validateNRIC, session, calculateTimeLeft };