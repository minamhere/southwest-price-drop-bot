var plivo = require('plivo');

const { PLIVO_ID, PLIVO_TOKEN, PLIVO_NUMBER } = require('../constants.js');

const enabled = Boolean(PLIVO_ID && PLIVO_TOKEN && PLIVO_NUMBER);

async function sendSms (to, message, from = PLIVO_NUMBER) {
  if (!enabled || to == null) return false;

  var client = new plivo.Client(PLIVO_ID,PLIVO_TOKEN);

  return new Promise(resolve => {
    client.messages.create(
      PLIVO_NUMBER, 
      to, 
      message,
    ).then(function (response) {
        console.log(response);
    }, function (err) {
        console.error(err);
    }, resolve(
      response
      )
    );
    
  });
}


module.exports = {
  enabled,
  sendSms
};
