export declare function setDate(timestamp:number, nanosecs:number): number
const addon = require('./build/Release/setDate')
module.exports.setDate = addon.setDate