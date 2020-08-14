//const path = require('path')

const regexUrl = new RegExp('^(https?:\\/\\/)?'+ // protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
  '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

const regexSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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

const toHex = (char = '') => char.charCodeAt(0).toString(16)

const encodeHex = (str = '') => str.split('').map(toHex).join('')

const decodeHex = (hex = '') => {
	const result = []
	for (let i = 0; i < hex.length; i += 2) {
		result.push(String.fromCharCode(parseInt(hex.substr(i, 2), 16)))
	}
	return result.join('')
}

module.exports = { 
  regexUrl, 
  regexSlug, 
  escapeText, 
  regex, 
  validateURL, 
  utcNow,
  encodeHex,
  decodeHex
}
