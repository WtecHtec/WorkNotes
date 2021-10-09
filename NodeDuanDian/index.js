const express = require('express');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const baseUrl = 'http://localhost:3000/file/doc/';
const dirPath = path.join(__dirname, '/static/')
const  app = express()
app.all('*', function (req, res, next) {

    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Content-Type')

    res.header('Access-Control-Allow-Methods', '*');

    res.header('Content-Type', 'application/json;charset=utf-8')

    next();

});

app.get('/', function (req, res) {
    res.send('hello world')
})
app.post('/small', function (req, res) {
    let form = formidable({
        multiples: true,
        uploadDir: dirPath + 'temp/'
    })
    form.parse(req, (err,fields, files)=> {
        if (err) {
            return res.json(err);
        }
        let newPath = dirPath+'doc/'+files.file.name;
        fs.rename(files.file.path, newPath, function(err) {
            if (err) {
                return res.json(err);
            }
            return res.json({
                code: 200,
                msg: 'get_succ',
                data: {
                    url: baseUrl + files.file.name
                }
            })
        })
    })
})

app.post('/big', async function (req, res){
    let type = req.query.type;
    let md5Val = req.query.md5Val;
    let total = req.query.total;
    let bigDir = dirPath + 'big/';
    let typeArr = ['check', 'upload', 'merge'];
    if (!type) {
        return res.json({
            code: 101,
            msg: 'get_fail',
            data: {
                info: '上传类型不能为空！'
            }
        })
    }

    if (!md5Val) {
        return res.json({
            code: 101,
            msg: 'get_fail',
            data: {
                info: '文件md5值不能为空！'
            }
        })
    }

    if (!total) {
        return res.json({
            code: 101,
            msg: 'get_fail',
            data: {
                info: '文件切片数量不能为空！'
            }
        })
    }

    if (!typeArr.includes(type)) {
        return res.json({
            code: 101,
            msg: 'get_fail',
            data: {
                info: '上传类型错误！'
            }
        })
    }
   if (type === 'check') {
       let filePath = `${bigDir}${md5Val}`;
       fs.readdir(filePath, (err, data) => {
           if (err) {
               fs.mkdir(filePath, (err) => {
                   if (err) {
                       return res.json({
                           code: 101,
                           msg: 'get_fail',
                           data: {
                               info: '获取失败！',
                               err
                           }
                       })
                   } else {
                       return res.json({
                           code: 200,
                           msg: 'get_succ',
                           data: {
                               info: '获取成功！',
                               data: {
                                   type: 'write',
                                   chunk: [],
                                   total: 0
                               }
                           }
                       })
                   }
               })
           } else {
               return res.json({
                   code: 200,
                   msg: 'get_succ',
                   data: {
                       info: '获取成功！',
                       data: {
                           type: 'read',
                           chunk: data,
                           total: data.length
                       }
                   }
               })
           }

       });

   } else if (type === 'upload') {

       let current = req.query.current;
       if (!current) {
           return res.json({
               code: 101,
               msg: 'get_fail',
               data: {
                   info: '文件当前分片值不能为空！'
               }
           })
       }

       let form = formidable({
           multiples: true,
           uploadDir: `${dirPath}big/${md5Val}/`,
       })

       form.parse(req, (err,fields, files)=> {
           if (err) {
               return res.json(err);
           }
           let newPath = `${dirPath}big/${md5Val}/${current}`;
           fs.rename(files.file.path, newPath, function(err) {
               if (err) {
                   return res.json(err);
               }
               return res.json({
                   code: 200,
                   msg: 'get_succ',
                   data: {
                       info: 'upload success!'
                   }
               })
           })

       });

   } else  {
       let ext = req.query.ext;
       if (!ext) {
           return res.json({
               code: 101,
               msg: 'get_fail',
               data: {
                   info: '文件后缀不能为空！'
               }
           })
       }

       let oldPath = `${dirPath}big/${md5Val}`;
       let newPath = `${dirPath}doc/${md5Val}.${ext}`;
       let data = await mergeFile(oldPath, newPath);
       if (data.code == 200) {
           return res.json({
               code: 200,
               msg: 'get_succ',
               data: {
                   info: '文件合并成功！',
                   url: `${baseUrl}${md5Val}.${ext}`
               }
           })
       } else {
           return res.json({
               code: 101,
               msg: 'get_fail',
               data: {
                   info: '文件合并失败！',
                   err: data.data.error
               }
           })
       }
   }


})



function mergeFile (filePath, newPath) {
    return new Promise((resolve, reject) => {
        let files = fs.readdirSync(filePath),
            newFile = fs.createWriteStream(newPath);
        let filesArr = arrSort(files).reverse();
        main();
        function main (index = 0) {
            let currentFile = filePath + '/'+filesArr[index];
            let stream = fs.createReadStream(currentFile);
            stream.pipe(newFile, {end: false});
            stream.on('end', function () {
                if (index < filesArr.length - 1) {
                    index++;
                    main(index);
                } else {
                    resolve({code: 200});
                }
            })
            stream.on('error', function (error) {
                reject({code: 102, data:{error}})
            })
        }
    })
}

function arrSort (arr) {
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr.length; j++) {
            if (Number(arr[i]) >= Number(arr[j])) {
                let t = arr[i];
                arr[i] = arr[j];
                arr[j] = t;
            }
        }
    }
    return arr;
}

app.listen(3000, ()=>{
    console.log('http://localhost:3000/')
})
