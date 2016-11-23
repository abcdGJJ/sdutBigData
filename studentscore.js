const superagent = require('superagent');
const mongoose = require('mongoose')
const async=require("async");
mongoose.Promise = global.Promise
const SchemaTypes = mongoose.Schema.Types
const studentDb = mongoose.createConnection('mongodb://localhost/student')
const scoreDb = mongoose.createConnection('mongodb://localhost/score')
const studentSchema = new mongoose.Schema({
    id: {
        type: SchemaTypes.ObjectId,
        ref: 'Id'
    },
    xh: String,
    name: String,
    sex: String,
    grade: Number,
    profession: String,
    class: String,
    level: String,
    studyTime: Number
}, {
    versionKey: false
})
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
let Student = studentDb.model('Student', studentSchema)
let Score = scoreDb.model('score', scoreSchema)
let url = ''
let currentCount = 0
Student.find().select('xh name').exec(function (err, res) {
    dataHandle(res)
})
function dataHandle (res) {
    async.mapLimit(res, 50, function(result, callback) {
        currentCount++
        console.log(`当前并发数：${currentCount}`)
        superagent.post(url).send({
            post_xuehao: result.xh
        }).set({
            'Content-Type': 'application/x-www-form-urlencoded'
        }).end(function(err, res) {
            if (err) {
                return console.error(err)
            }
            let info = res.text
            info = info.match(/&nbsp;(.*)<\/td>/g) //正则获取所需数据
            let finalInfo = info.map(function(value) { // 数据处理函数,去除空格和</td>标签
                value = value.replace(/&nbsp;/ig, '')
                value = value.replace(/<\/td>/ig, '')
                return value
            })
            finalInfo = finalInfo.slice(17,-2)
            // console.log(result[j])
            for(let i = 0, l = finalInfo.length; i < l; i+=16) {
                let my = new Score({
                    xh: result.xh,
                    name: result.name,
                    year: finalInfo[i + 1],
                    semester: finalInfo[i + 2],
                    categroy: finalInfo[i + 3],
                    className: finalInfo[i + 5],
                    credit: finalInfo[i + 7],
                    oriScore: finalInfo[i + 10],
                    bukaoScore: finalInfo[i + 11]
                })
                my.save(function(err) {
                    if (err) {
                        console.log(err)
                    }
                })
            }
            currentCount--
            console.log(`${result.name}同学的数据已保存`)
            callback(null, null)
        })
    }, function (err, results) {})
}