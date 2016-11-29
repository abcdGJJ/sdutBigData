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
    emit(this.className, {"count": 1, "categroy": this.categroy})
}
o.reduce = function(key, values) {
    var result = {
        "count": 0,
        "categroy": values[0].categroy
    }
    for (var i = 0; i < values.length; i++) {
        result.count += values[i].count
    }
    return result
}
// 过滤出挂科信息
// 由于oriScore字段是字符型，只能使用这种简陋的方式来实现（$where太费时）
o.query = {
    $or: [{$and: [{ "oriScore": { $lt: "60"}}, { "oriScore": { $ne: "100"}}]}, {"oriScore": "7"}, {"oriScore": "8"}, { "oriScore": "9"}]
}
o.out = 'fail' // 输出的表名
Score.mapReduce(o, function(err, res) {
    console.log('count done')
});