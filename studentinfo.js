// 存储学生信息
const superagent = require('superagent');
const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')
mongoose.Promise = global.Promise
const SchemaTypes = mongoose.Schema.Types
const studentDb = mongoose.createConnection('mongodb://localhost/student')
// 初始化自增插件
autoIncrement.initialize(studentDb)
const studentSchema = new mongoose.Schema({
    id: {type: SchemaTypes.ObjectId, ref: 'Id'},
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
studentSchema.plugin(autoIncrement.plugin, {
    model: 'Student',
    startAt: 0
})
let Student = studentDb.model('Student', studentSchema)
let url = '';
let queryArr = ['131', '141', '151']
for(let j = 0, length = queryArr.length; j < length; j++) {
    superagent.post(url).send({
        post_xuehao: queryArr[j]
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
            if (value) {
                return value
            } else {
                return
            }
        })
        finalInfo = finalInfo.filter(function(element) {
            if (element) {
                return element
            }
        })
        for(let i = 0, l = finalInfo.length; i < l; i+=9) {
            let xh = finalInfo[i + 1].substring(0, 3)
            if (queryArr.indexOf(xh) > -1) {
                let my = new Student({
                    xh: finalInfo[i + 1],
                    name: finalInfo[i + 2],
                    sex: finalInfo[i + 3],
                    grade: finalInfo[i + 4],
                    profession: finalInfo[i + 5],
                    class: finalInfo[ i + 6],
                    level: finalInfo[i + 7],
                    studyTime: finalInfo[i + 8]
                })
                my.save(function(err) {
                    if (err) {
                        console.log(err)
                    } else{
                        console.log(`${finalInfo[i + 2]}同学的数据已保存`)
                    }
                })
            } else {
                continue
            }
        }
        // console.log(`已保存${finalInfo.length / 9}名学生数据`) //异步
    })
}
// mongoose.connection.close()