const moment = require('moment');


// Format the data 
const formater = (username, msg) => {
    return {
        username,
        msg,
        date: moment().format('h:mm a')
    }
};

module.exports = formater;