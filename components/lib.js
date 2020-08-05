const path = require('path')

const regexUrl = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

const regexSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

//new RegExp('/^[a-z0-9]+(?:-[a-z0-9]+)*$/')

//some custom functions
const escapeText = (text) => {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}

const regex = (text) => {
	return new RegExp(escapeText(text), 'gi')
}

const validateURL = str => {
  try {
    new URL(str)
  } catch (_) {
    return false
  }
  return true
}

const utcNow = () => { 
  const now = new Date()
  return now.toISOString()
}

module.exports = { regexUrl, regexSlug, escapeText, regex, validateURL, utcNow }
