const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
const keys = require('../config/keys');
//const redisUrl = "redis://127.0.0.1:6379";
const client = redis.createClient(keys.redisUrl);
client.hget = util.promisify(client.hget);
const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.useCache = function(options = {}) {
    this.isCached = true;
    this.hashkey = JSON.stringify(options.key || '')
    return this;
}

async function doRedisOperations() {
    //make key
    const key = JSON.stringify(Object.assign({},this.getQuery(),{ collection : this.mongooseCollection.name }))
    const cachedValue = await client.hget(this.hashkey,key);
    if(cachedValue) {
        const doc = JSON.parse(cachedValue);
        console.log("redis inside")
        return Array.isArray(doc) ? doc.map(d => new this.model(d)) : new this.model(doc)
    }
    //else execute original mongoose exec 
    console.log("exec outside redis"); 
    const result = await exec.apply(this,arguments);
    client.hset(this.hashkey,key,JSON.stringify(result));
    return result;
}

mongoose.Query.prototype.exec = async function() {
    if(this.isCached === true) return await doRedisOperations.apply(this)
    else return await exec.apply(this,arguments);
}

