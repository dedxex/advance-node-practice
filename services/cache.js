const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = async function(params) {
    //make key
    const key = JSON.stringify(Object.assign({},this.getQuery(),{ collection : this.mongooseCollection.name }))
    
    const cachedValue = await client.get(key);
    if(cachedValue) {
        const doc = JSON.parse(cachedValue);
        console.log("doc is")
        return Array.isArray(doc)
        ? doc.map(d => new this.model(d))
        : new this.model(doc)
    }
    //else execute original mongoose exec 
    console.log("exec outside"); 
    const result = await exec.apply(this,arguments);
    client.set(key,JSON.stringify(result));
    return result;

}

