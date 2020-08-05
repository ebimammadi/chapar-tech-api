
const messagingApi = require("@cmdotcom/text-sdk");
const myMessageApi = new messagingApi.MessageApiClient(process.env.CMDOTCOM_PRODUCT_TOKEN)

const { Sms } = require("../models/sms")

const logSmsInDb = async (number, message, result) =>{
  console.log("SMS sent, check the mongoDB logs")
  const sms_log = new Sms({ result, number, message })
  try {
    await sms_log.save()
  } catch(err) {
    console.log(err.message)
    return err
  }
}

const sendSms = (receivingNumber, text) => {
  return new Promise ( (resolve, reject ) => {
    const numbers = []
    numbers[0] = receivingNumber    
    const smsResponse = myMessageApi.sendTextMessage( numbers, process.env.APP_NAME, text )
    smsResponse
      .then( result => {  
        resolve(result)
      })
      .catch( error => {
        reject(error) 
      })
  })
}

module.exports = { sendSms, logSmsInDb }