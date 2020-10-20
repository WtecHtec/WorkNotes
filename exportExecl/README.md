
# 导入xlsx
npm install xlsx

[XLSX官网](https://www.npmjs.com/package/xlsx-import)
# 引用
import XLSX from xlsx

# H5 table 导出表格

1. 在页面创建table
```
<table border="" id="table">
    	<tbody>
		<tr>
			<td rowspan='2'>表头1</td>
			<td colspan="2">表头2</td>
		</tr>
		<tr >
		  <td>A1</td>
		  <td>B1</td>
		</tr>
		<tr>
		   <td>A2</td>
		   <td>B21</td>
                   <td>B22</td>
		</tr>
	</tbody>
</table>
```

2. 导出方法

```
 downloadExl () {
                // 初始化
                var workbook = XLSX.utils.book_new();
                // 数据
                var ws1 = XLSX.utils.table_to_sheet(document.getElementById('table'));
                // 这是  Sheet
                XLSX.utils.book_append_sheet(workbook, ws1, "Sheet1");
                XLSX.writeFile(workbook, 'table.xlsx');
                
          }
```

3.结果
得到如下图：

![202007311639.png](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9zcnEuY29vbC91cGxvYWQvMjAyMC83LzIwMjAwNzMxMTYzOS1hMmEyNjUzMjIxZTk0MDVlYjI5NjAzY2EzNDJkYWRmOS5wbmc?x-oss-process=image/format,png)

跟页面显示的一模一样的数据以及样式。

# 多个sheet表格导出

1. 在创建一个table2。
2. 导出方法
```
  function downloadExlSheelt () {
	  var workbook = XLSX.utils.book_new();
	   
	  var ws1 = XLSX.utils.table_to_sheet(document.getElementById('table'));
	  XLSX.utils.book_append_sheet(workbook, ws1, "Sheet1");
	  var ws2 = XLSX.utils.table_to_sheet(document.getElementById('table2'));
	  XLSX.utils.book_append_sheet(workbook, ws2, "Sheet2");
	  XLSX.writeFile(workbook, filename); //导出Excel
	   
	   }
```
3.结果得到2个Sheet不同数据。
#### 注
Sheet 的名称不可以一样


# 数组数据导出

到数据多时，页面table就需要分页，但是用table导出表格，会出现数据丢失。因此可考虑数组导出。
#### 例子方法
```
  function downloadExle () {
	var filename = "file.xlsx"; //文件名称
	        var data = [ ['表头1','表头2'],['','z','b'], [ 1,2,3],[true, false,"sheetjs"],["foo","bar",new Date("2014-02-19T14:30Z"), "0.3"], ["baz", null, "qux"]];  //数据，一定注意需要时二维数组
	        var ws_name = "Sheet1"; //Excel第一个sheet的名称
	        var wb = XLSX.utils.book_new(), 
	        var ws = XLSX.utils.aoa_to_sheet(data);
	        XLSX.utils.book_append_sheet(wb, ws, ws_name);  //将数据添加到工作薄
	        XLSX.writeFile(wb, filename); //导出Excel
	}

```
结果如图：
![202007311600.png](https://imgconvert.csdnimg.cn/aHR0cHM6Ly9zcnEuY29vbC91cGxvYWQvMjAyMC83LzIwMjAwNzMxMTYwMC00ZDcwMzQ4Y2Q0ODk0YTdhOTBiMzhiMzZlYzU5MWY5MC5wbmc?x-oss-process=image/format,png)

如果想导出都多个sheet的表格，可参考上一个方法

#### 注

导出数据格式为 二维数组，与导出的表格一一对应。

# Json 数据导出

1.下载 
```
npm install -S file-saver xlsx
npm install -D script-loader

```

2. 项目中新建一个文件夹：（vendor—名字任取）
里面放置两个文件Blob.js 和 Export2Excel.js。
下载地址: https://github.com/WtecHtec/WorkNotes.git

3.导出方法

```
export2Excel() {
　　　　　　require.ensure([], () => {
　　　　　　// 引用 步骤 2 文件夹
　　　　　　　 　const { export_json_to_excel } = require(‘../../vendor/Export2Excel’);
　　　　　　　 　//对应表格输出的title
　　　　　　　　const tHeader = [‘序号’, ‘IMSI’, ‘MSISDN’, ‘证件号码’, ‘姓名’];
// 对应表格输出的 tableData 数据, filterVal 属性字段
　　　　　　　　const filterVal = [‘ID’, ‘imsi’, ‘msisdn’, ‘address’, ‘name’];
　　　　　　　　const list = this.tableData;
　　　　　　　　const data = this.formatJson(filterVal, list);
　　　　　　　　　//对应下载文件的名字
　　　　　　　　export_json_to_excel({
                        header: tHeader,
                        data: data,
                        filename: filename,
                        sheetName: filename,
                       
                    });
　　　　　　})
　　　　},
　　　　formatJson(filterVal, jsonData) {
　　　　　　return jsonData.map(v => filterVal.map(j => v[j]))
　　　　}
```
#### 注
如果webpack报解析错误：
在build—-webpack.base.conf.js中resolve的alias加入 ‘vendor’: path.resolve(__dirname, ‘../src/vendor’),
即可解决

# 合并单元格
// ws 为  XLSX.utils.aoa_to_sheet|table_to_sheet 的对象

1. 方式1

```
var cell_address = { 
               s: {r:0 ,c:0} ,
		e : {r:1 ,c:0}
	}; 
			
	ws['!merges'].push(cell_address)
```
#### 释
s: 合并单元格起始位置
e:  合并单元格结束位置
ws['!merges']： 合并单元格参数

2. 方式2
```
var cell_address = XLSX.utils.decode_range('A1:A2') 
    ws['!merges'].push(cell_address)
```
####  方式2
decode_range:
 参数1： 合并单元格起始位置
参数2： 合并单元格结束位置

可查看excel表格格式。
