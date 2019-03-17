'use strict';
var AWS = require('aws-sdk');
var S3 = new AWS.S3();
var Jimp = require('jimp');
module.exports.resize =  (event, context, callback) => {

  const s3Entity = event.Records[0].s3
  console.log('S3 Entity', s3Entity)

  const BUCKET = s3Entity.bucket.name
  const HEIGHT = 100
  const WIDTH = 100

  console.log('Bucket', BUCKET)

  var params = {
    Bucket: BUCKET,
    Key: s3Entity.object.key
  };  

S3.getObject(params, (err, imageResponse) => {
  Jimp.read(imageResponse.Body).then(image => {
    image = image.resize(HEIGHT, WIDTH).getBuffer(image.getMIME(), (err, resizedImage) => {
        var newName = getNewName(s3Entity.object.key)
        console.log('New Name Is', newName)
        S3.putObject({
            Bucket: BUCKET,
            Key: getNewName(s3Entity.object.key),
            Body: resizedImage,
            ContentType: 'image/jpg'
        }, (err, response) => {
            console.log('Data', response)
        })
    })
  }).catch(err => {
    console.log('Jimp Error', err)
  })
})
  

function getNewName (filename) {
  var parts = filename.split('.'),
      extension = parts.pop(),
      newName = parts.join('.').replace('images/originals/', 'images/thumbnails/');
      return newName + '.' + extension;
  }
};

