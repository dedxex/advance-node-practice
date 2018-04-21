const AWS = require('aws-sdk');
const uuid = require('uuid');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

AWS.config.update({
    accessKeyId: keys.accessKeyId,
    secretAccessKey: keys.secretAccessKey,
    signatureVersion: 'v4',
    region: 'ap-south-1'
  });

const S3 = new AWS.S3({})

module.exports = app => {
    app.get('/api/upload',requireLogin,(req,res) => {
        const key = `${req.user.id}/${uuid()}.jpeg`;
        S3.getSignedUrl("putObject",{
            Bucket : "taranjeet-singh",
            ContentType : "image/jpeg",
            Key : key,
        },
        (err,url) => res.send({key,url})
    )
    })
}