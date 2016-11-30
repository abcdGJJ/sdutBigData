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
    $or: [{$and: [{ "oriScore": { $lt: "60"}}, { "oriScore": { $ne: "100"}}]}, {"oriScore": "7"}, {"oriScore": "8"}, { "oriScore": "9"}, { "oriScore": "6.3"}, { "oriScore": "6.4"}, { "oriScore": "6.5"}, { "oriScore": "6.6"},{ "oriScore": "6.7"},{ "oriScore": "6.8"},{ "oriScore": "6.9"}, { "oriScore": "7.1"},{ "oriScore": "7.2"},{ "oriScore": "7.3"},{ "oriScore": "7.4"},{ "oriScore": "7.5"},{ "oriScore": "7.6"},{ "oriScore": "7.7"},{ "oriScore": "7.8"},{ "oriScore": "7.9"},{ "oriScore": "8.1"},{ "oriScore": "8.2"},{ "oriScore": "8.3"},{ "oriScore": "8.4"},{ "oriScore": "8.5"},{ "oriScore": "8.6"},{ "oriScore": "8.7"},{ "oriScore": "8.8"},{ "oriScore": "8.9"},{ "oriScore": "9.1"},{ "oriScore": "9.2"},{ "oriScore": "9.3"},{ "oriScore": "9.4"},{ "oriScore": "9.5"},{ "oriScore": "9.6"},{ "oriScore": "9.7"},{ "oriScore": "9.8"},{ "oriScore": "9.9"},{"oriScore": "不合格"}]
}
o.out = 'fail' // 输出的表名
Score.mapReduce(o, function(err, res) {
    console.log('count done')
});