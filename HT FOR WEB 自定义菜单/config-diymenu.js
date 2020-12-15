
/**  
 *  config-handleEvent .js
 *  1.
 *    if (type === 'editorCreated') {
            handleEditorCreated(editor);
            createPointsTab(editor);

            // 创建自定义图标菜单
            pointsTabDiy = createDiyTab(editor)
        }
    2. 
      // 文件修改
        if(type === 'fileChanged') {
            console.log('pointsTabDiy fileChanged',pointsTabDiy)
            pointsTabDiy.prototype.LoadFiles(pointsTabDiy.getView())
            // editor.reload()
        }
        
        rootDir： 指向\instance-enjoy\storage 下的目录。

 */
var rootDir = 'testdemo/测试'
var  TabDiyNmae = '自定义图标'
var rootNodeName = '自定义图标根目录'
// Used in config-handleEvent.js
function createDiyTab(editor) {



    let pointsTabDiy = new ht.Tab();
    pointsTabDiy.setName(TabDiyNmae);
    editor.leftTopTabView.getTabModel().add(pointsTabDiy);

    // console.log('editor.leftTopTabView.getTabModel():',pointsTabDiy.getView())

    pointsTabDiy.setView(createPointsExplorerDiy(editor, pointsTabDiy,true));

   
    // pointsTabDiy._dataModel.clear()
    console.log('createDiyTab pointsTabDiy', pointsTabDiy)
    // console.log('createDiyTab editor.symbols', editor.symbols)
    // console.log('createDiyTab editor.symbols.list', editor.symbols.list)
    // console.log('createDiyTab editor',  editor.symbols.list.menu)
    // console.log('createDiyTab editor', editor.symbols.rootNode)
    // console.log('createDiyTab', editor.symbols.tree.menu._items[0].action)
    pointsTabDiy.prototype =  {}
    pointsTabDiy.prototype['LoadFiles'] =  LoadFiles
    return pointsTabDiy;
}

/**
 *  菜单生成时调用；config-handleEvent 保存事件时调用。
 * @param { } pointsExplorerDiy 
 *  从目录（rootDir）加载，目录下的资源
 *  window.editor.request 可实现
 *   将 请求到的资源进行数据格式化 （自定义格式化函数 setDiySymbolData ）
 *  通过 parse 函数
 */
function LoadFiles (pointsExplorerDiy){
    
    // pointsExplorerDiy.dataModel.clear()
    // 加载数据
    window.editor.request("explore", '/' +  rootDir, function(D) {
        console.log('pointsExplorerDiy request',D)
        // window.editor.insertLocalJSONFile(pointsExplorerDiy,D)
        let result = {}
        // 数据格式化
        setDiySymbolData(D,result)

        console.log('setDiySymbolData result: ',result)
        requestAnimationFrame(function(){
            console.log('setDiySymbolData result: ',pointsExplorerDiy.rootNode)
            pointsExplorerDiy.rootNode._name  = rootNodeName
        })
       
        
        pointsExplorerDiy.parse(result);
    },100)
}

/**
 *  创建  Explorer 
 *  以及 右击事件 实现 （新增文件夹，新增图标，删除等 （pointsExplorerDiy.__proto__ 下可看到函数））
 * @param {*} editor 
 * @param {*} draggable 
 */
function createPointsExplorerDiy(editor,draggable) {
   
    var pointsExplorerDiy = new hteditor.Explorer(editor,  rootDir, false);

 
   
   console.log( window.editor)
   console.log( pointsExplorerDiy)

    let HTTPService = hteditor.HTTPService.prototype
    
   // 加载数据
   LoadFiles(pointsExplorerDiy)



    console.log('pointsExplorerDiy hteditor : ',HTTPService)
    console.log('pointsExplorerDiy  rootNode: ', pointsExplorerDiy.getFileListView())

   
    


    var contextmenu = new ht.widget.ContextMenu();
   
   console.log(' pointsExplorerDiy.tree.editable', pointsExplorerDiy.tree.editable)


   /**
    *    上方右击事件 tree
    *      设置   pointsExplorerDiy.tree.editable = true 才可显示
    *      addLocateTreeFileItem 等（pointsExplorerDiy.__proto__ 下可看到函数）： 新增文件夹
    *       pointsExplorerDiy.tree.menu.addTo(pointsExplorerDiy.tree.getView())
    *            pointsExplorerDiy.tree.menu 为 ht 组件
    *            菜单显示 在  pointsExplorerDiy.tree.getView()区域
    */
   pointsExplorerDiy.tree.editable = true
   // 新建图标 事件
   pointsExplorerDiy.treeMenuItems.push({
    id: "newSymbolDiy",
    label: '新建图标',
    action: function() {
        var data = pointsExplorerDiy.tree.sm().ld();
        // console.log('新建图标',  data)
        //  修改图标路径
        editor.symbols['diyPath'] = data.url
        editor.newSymbolView()
        editor.save()

    }
})

//    pointsExplorerDiy.addLocateTreeFileItem( pointsExplorerDiy.treeMenuItems, pointsExplorerDiy.tree)
   pointsExplorerDiy.addNewFolderItem( pointsExplorerDiy.treeMenuItems, pointsExplorerDiy.tree)
   pointsExplorerDiy.addRenameItem( pointsExplorerDiy.treeMenuItems, pointsExplorerDiy.tree)
   pointsExplorerDiy.addDeleteItem( pointsExplorerDiy.treeMenuItems, pointsExplorerDiy.tree)
//    pointsExplorerDiy.addCopyItem( pointsExplorerDiy.treeMenuItems, pointsExplorerDiy.tree)
//    pointsExplorerDiy.addExportItem( pointsExplorerDiy.treeMenuItems, pointsExplorerDiy.tree)
//    pointsExplorerDiy.addPasteItem( pointsExplorerDiy.treeMenuItems, pointsExplorerDiy.tree)
   pointsExplorerDiy.tree.menu.addTo(pointsExplorerDiy.tree.getView())


 


   
   /**
    *    下方右击事件 list
    *      设置   pointsExplorerDiy.list.editable = true 才可显示
    * addLocateTreeFileItem 等（pointsExplorerDiy.__proto__ 下可看到函数）： 新增文件夹
    *     
    *    pointsExplorerDiy.list.menu.addTo(pointsExplorerDiy.list.getView() )
    *             pointsExplorerDiy.list.menu 为 ht 组件
    *            菜单显示 在  pointsExplorerDiy.list.getView() 区域
    *     
    *   新建图标改源码设置，保存路径，（ editor.symbols['diyPath'] = data.url）
    *    自定义一个 右击菜单事件， 
    *     editor.newSymbolView()
    *       editor.save()
    *    源码修改处在 client.js （注释为‘ 修改源码新建图标 ’处）
    *    找到 symbolViewSaved  处  添加 
    *     i.editor.symbols['diyPath'] = ''
    *  找到 editor.symbols.currentDir 处 添加
    *      if(this.editor.symbols['diyPath']) {
                A = this.editor.symbols['diyPath']
            }
    *    pointsExplorerDiy.tree.sm().ld()
    *    当前点击 的文件，获取路径url
    */

   pointsExplorerDiy.list.editable = false

   // 新建图标 事件
   pointsExplorerDiy.listMenuItems.push({
        id: "newSymbolDiy",
        label: '新建图标',
        action: function() {
            var data = pointsExplorerDiy.tree.sm().ld();
            // console.log('新建图标',  data)
            //  修改图标路径
            editor.symbols['diyPath'] = data.url
            editor.newSymbolView()
            editor.save()

        }
    })

    // 拷贝
    pointsExplorerDiy.listMenuItems.push({
        id: "copySymbolDiy",
        label: '拷贝',
        action: function() {
            // var data = pointsExplorerDiy.tree.sm().ld();
            // console.log('新建图标',  data)
            //  修改图标路径
            console.log('拷贝：', pointsExplorerDiy)
          
            if(pointsExplorerDiy.copyFileInfos.length > 0) {
                editor.symbols.copyFileInfos = []
                editor.symbols.copyFileInfos =  pointsExplorerDiy.copyFileInfos
            }
            editor.copyFiles()
            
            
        }
    })

    // 粘贴
    pointsExplorerDiy.listMenuItems.push({
        id: "pasteSymbolDiy",
        label: '粘贴',
        action: function() {
            // var data = pointsExplorerDiy.tree.sm().ld();
            // console.log('新建图标',  data)
            //  修改图标路径
            // console.log('拷贝：', pointsExplorerDiy)
          
            pointsExplorerDiy.copyFileInfos =    editor.symbols.copyFileInfos
            editor.pasteFiles()
            
            
        }
    })
   

//    pointsExplorerDiy.addLocateTreeFileItem( pointsExplorerDiy.listMenuItems, pointsExplorerDiy.list)
   pointsExplorerDiy.addNewFolderItem( pointsExplorerDiy.listMenuItems, pointsExplorerDiy.list)
   pointsExplorerDiy.addRenameItem( pointsExplorerDiy.listMenuItems, pointsExplorerDiy.list)
   pointsExplorerDiy.addDeleteItem( pointsExplorerDiy.listMenuItems, pointsExplorerDiy.list)
//    pointsExplorerDiy.addCopyItem( pointsExplorerDiy.listMenuItems, pointsExplorerDiy.list)
   pointsExplorerDiy.addExportItem( pointsExplorerDiy.listMenuItems, pointsExplorerDiy.list)
//    pointsExplorerDiy.addPasteItem( pointsExplorerDiy.listMenuItems, pointsExplorerDiy.list)

  
   pointsExplorerDiy.list.menu.addTo(pointsExplorerDiy.list.getView() )



console.log('addNewFolderItem jsonTreeItem', pointsExplorerDiy.tree)
console.log('addNewFolderItem jsonTreeItem', editor.symbols)

    
  
    // data.path = 'storage/testdemo'
    pointsExplorerDiy.tree.sm().ms(function(event) {
       
        var data = pointsExplorerDiy.tree.sm().ld();
       
     
        if (data && data.a('needToLoad')) {
            data.a('needToLoad', false);
        }
    });

    if (draggable) {
        pointsExplorerDiy.list.isDroppableToDisplayView = true;
        pointsExplorerDiy.list.handleDropToEditView = function(view, fileNode, point, event) {
            console.log(' pointsExplorerDiy.tree.sm() fileNode', fileNode,point)
            if(fileNode.fileType === 'symbol') {
                var node = new ht.Node();
                node.setImage(fileNode.url);
                
                node.p(point);
                node.setDisplayName(fileNode.getName());
                view.addData(node);
            }

            // if (fileNode.getIcon() === textIcon) {
            //     var text = new ht.Text();
            //     text.s({
            //         'text': '##.#',
            //         'text.align': 'center'
            //     });
            //     text.setDataBindings({
            //         s: { text: { id: fileNode.getName() }  }
            //     });
            //     text.setDisplayName(fileNode.getName());
            //     text.p(point);
            //     view.addData(text);
            // }
            // else {
            //     var node = new ht.Node();
            //     node.setImage(fileNode.getImage());
            //     node.p(point);
            //     node.setDisplayName(fileNode.getName());
            //     view.addData(node);
            // }
        };
    }

    // console.log('pointsExplorerDiy._rightView._view',pointsExplorerDiy._rightView._view)
    // editor.symbols.tree.menu.addTo(pointsExplorerDiy._leftView._view)
    // contextmenu.addTo(pointsExplorerDiy._leftView._view)
    // editor.symbols.list.menu.addTo(pointsExplorerDiy._rightView._view)
    return pointsExplorerDiy;
}



// 格式化图标
function setDiySymbolData(D,result,path){
   let keys = Object.keys(D)
   let  name = ''
   for(let i = 0; i < keys.length; i++){
        if(!keys[i])continue
        if(/(.json)$/.test(keys[i])) {
            console.log('路径', path)
            name =  keys[i].split('.')[0]
            // fileType =  keys[i].split('.')[1]
            result[keys[i]] = {
                fileType: 'symbol',
                path: rootDir +   ( path? '/' + path  : '' ),
                rootDir: rootDir,
                url: '/'+ rootDir +'/' + ( path?path + '/' + keys[i] :   keys[i] ),
                value: true,
                id: '/' + rootDir +'/' + ( path?path + '/' + keys[i] :   keys[i] ),
                image: '/' + rootDir + '/' + ( path?path + '/' + name +'.png' :  name +'.png' ) ,
                name:   keys[i],
                fileIcon: '/'+ rootDir +'/' + ( path?path + '/' + name +'.png' :  name +'.png' )  + '?t=' + new  Date().getTime()
            }
        }  else if( JSON.stringify( D[keys[i]]) === '{}'){
            result[keys[i]] = {
                fileType: 'dir'
            }
            // console.log('路径', result)
        } else if( D[keys[i]] instanceof Object) {
            console.log('路径',  keys[i] )
            result[keys[i]] = {}
            setDiySymbolData(D[keys[i]], result[keys[i]] , (path ? path + '/' :'') + keys[i])
        } 
   }
}

