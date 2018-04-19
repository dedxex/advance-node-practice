const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.exec = async function(params) {
    //make key
    const key = Object.assign({},this.getQuery(),{ collection : this.mongooseCollection.name })
    
    const cachedValue = await client.get(key);
    if(cachedValue) {
        console.log("redis cache")
        const doc = JSON.parse(cachedValue);
        return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(d)
    }

    console.log("outside redis")

    //else execute original mongoose exec
    const result = await exec.apply(this,this.arguments);
    client.set(key,JSON.stringify(result));
    return result;


}

