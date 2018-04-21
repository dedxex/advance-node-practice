const AWS = require('aws-sdk');
const uuid = require('uuid');
const keys = require('../config/keys');
const requireLogin = require('../middlewares/requireLogin');

const S3 = new AWS({
    assessKeyId : keys.accessKeyId,
    secretAccessKey : keys.secretAccessKey
})

module.exports = app => {
    app.get('/api/upload',requireLogin,(req,res) => {
        const key = `${req.user.id}/${uuid()}.jpeg`;
        S3.getSignedUrl("putObject",{
            Bucket : "taranjeet-singh",
            contentType : "jpeg",
            Key : key,
        },
        (err,url) => res.send({key,url})
    )
    })
}