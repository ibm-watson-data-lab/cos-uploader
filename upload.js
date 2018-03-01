// built-in Node.js crypto library
const crypto = require('crypto');

// generates a random, 20 character UUID
const uuid = function() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  var bits = []
  for(var i = 0; i < 20; i++) {
    bits.push(chars[Math.floor(Math.random()*chars.length)])
  }
  return bits.join('')
}

// serverless function that generates a new Object Storage pre-signed URL that allows
// a file to be uploaded to Object Storage without knowing the secret key. Expects:
// access_key - the Object Storage public access key
// secret_key - the Object Storage private access key
// bucket - the Object Storage bucket to write to
// endpoint - the API endpoint to use e.g. 'https://s3.us-south.objectstorage.softlayer.net'
// content_type - the Mime type of the file that will be uploaded
const main = function(msg) {

  // pre-sign the request
  var extension = msg.content_type.split('/')[1] 
  var expires = '' + Math.floor(((new Date()).getTime()/1000) + 60)
  var path = '/' + msg.bucket + '/' + uuid() + '.' + extension
  var hmac = crypto.createHmac('sha1', msg.secret_key);
  hmac.update('PUT\n' + '\n' + msg.content_type +  '\n' + expires + '\n' + path)
  var signature = hmac.digest('base64')

  // generate URL
  var params = 'AWSAccessKeyId=' + encodeURIComponent(msg.access_key) + '&Signature=' + encodeURIComponent(signature) + '&Expires=' + encodeURIComponent(expires)
  var request_url = msg.endpoint + path + '?' + params
  return { url: request_url }
}

exports.main = main
