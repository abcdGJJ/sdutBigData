const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const options = {
    server: {
        socketOptions: {
            connectTimeoutMS: 300000,
            socketTimeoutMS: 3000000 // 防止数据库连接超时
        }
    }
}
const scoreDb = mongoose.createConnection('mongodb://localhost/score', options);
const scoreSchema = new mongoose.Schema({
    xh: String,
    name: String,
    year: String,
    semester: Number,
    categroy: String,
    className: String,
    credit: Number,
    oriScore: String,
    bukaoScore: String
}, {
    versionKey: false
})
let Score = scoreDb.model('score', scoreSchema)
let o = {};
o.map = function() {
    emit(this.className, 1)
}
o.reduce = function(key, values) {
    return Array.sum(values)
}
o.query = {}
o.out = 'count' // 输出的表名
Score.mapReduce(o, function(err, res) {
    console.log('count done')
});