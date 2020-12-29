
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

let rootDirDisplay = 'displaytest'
let  TabDiyNmaeDisplay = '自定义图纸'
let rootNodeNameDisplay = '自定义图纸根目录'



// if (D.getFileNode(A)) return void gP(S("editor.filenameconflict"), A, function() {});
// D.request("mkdir", A, function(P) {})

// Used in config-handleEvent.js
function createDisplayTab(editor) {


      
    console.log('getFileNode(rootDirDisplay): ', ht) 

    let pointsTabDisplay = new ht.Tab();
    pointsTabDisplay.setName(TabDiyNmaeDisplay);
    editor.leftTopTabView.getTabModel().add(pointsTabDisplay, 0);

    console.log('editor.leftTopTabView.getTabModel():',editor)

    pointsTabDisplay.setView(createPointsExplorerDisplay(editor, false ));

   
    // pointsTabDiy._dataModel.clear()
    console.log('createDiyTab pointsTabDiy', pointsTabDisplay)
    // console.log('createDiyTab editor.symbols', editor.symbols)
    // console.log('createDiyTab editor.symbols.list', editor.symbols.list)
    // console.log('createDiyTab editor',  editor.symbols.list.menu)
    // console.log('createDiyTab editor', editor.symbols.rootNode)
    // console.log('createDiyTab', editor.symbols.tree.menu._items[0].action)
    pointsTabDisplay.prototype =  {}
    pointsTabDisplay.prototype['LoadDisplayFiles'] =  LoadDisplayFiles
    return pointsTabDisplay;
}

/**
 *  菜单生成时调用；config-handleEvent 保存事件时调用。
 * @param { } pointsExplorerDisplay 
 *  从目录（rootDir）加载，目录下的资源
 *  window.editor.request 可实现
 *   将 请求到的资源进行数据格式化 （自定义格式化函数 setDiySymbolData ）
 *  通过 parse 函数
 */
function LoadDisplayFiles (pointsExplorerDisplay){
  
    // pointsExplorerDisplay.dataModel.clear()
    // 加载数据
    window.editor.request("explore", '/' +  rootDirDisplay, function(D) {
        console.log('pointsExplorerDisplay request',D)
        // window.editor.insertLocalJSONFile(pointsExplorerDisplay,D)
        let result = {}
        // 数据格式化
        setDiyDisplayData(D,result)

        console.log('setDiySymbolData result: ',result)
        requestAnimationFrame(function(){
            console.log('setDiySymbolData result: ',pointsExplorerDisplay.rootNode)
            pointsExplorerDisplay.rootNode._name  = rootNodeNameDisplay
        })
       
        
        pointsExplorerDisplay.parse(result);
    },100)
}

/**
 *  创建  Explorer 
 *  以及 右击事件 实现 （新增文件夹，新增图标，删除等 （pointsExplorerDiy.__proto__ 下可看到函数））
 * @param {*} editor 
 * @param {*} draggable 
 */
function createPointsExplorerDisplay(editor,draggable) {
   
    let pointsExplorerDisplay = new hteditor.Explorer(editor,  rootDirDisplay, false);

 
   
   console.log( window.editor)
   console.log( pointsExplorerDisplay)

    let HTTPService = hteditor.HTTPService.prototype
    
   // 加载数据
   LoadDisplayFiles(pointsExplorerDisplay)



    console.log('pointsExplorerDisplay hteditor : ',HTTPService)
    console.log('pointsExplorerDisplay  rootNode: ', pointsExplorerDisplay.getFileListView())

   
    


    var contextmenu = new ht.widget.ContextMenu();
   
   console.log(' pointsExplorerDisplay.tree.editable', pointsExplorerDisplay.tree.editable)


   /**
    *    上方右击事件 tree
    *      设置   pointsExplorerDisplay.tree.editable = true 才可显示
    *      addLocateTreeFileItem 等（pointsExplorerDiy.__proto__ 下可看到函数）： 新增文件夹
    *       pointsExplorerDisplay.tree.menu.addTo(pointsExplorerDisplay.tree.getView())
    *            pointsExplorerDisplay.tree.menu 为 ht 组件
    *            菜单显示 在  pointsExplorerDisplay.tree.getView()区域
    */
   pointsExplorerDisplay.tree.editable = true
   // 新建图标 事件
   pointsExplorerDisplay.treeMenuItems.push({
    id: "newDisplayDiy",
    label: '新建图纸',
    action: function() {
        var data = pointsExplorerDisplay.tree.sm().ld();
        // console.log('新建图标',  data)
        //  修改图标路径
        editor.displays['diyPath'] = data.url
        editor.newDisplayView()
        editor.save()

    }
})

console.log(' pointsExplorerDisplay:', pointsExplorerDisplay)
//    pointsExplorerDisplay.addLocateTreeFileItem( pointsExplorerDisplay.treeMenuItems, pointsExplorerDisplay.tree)
pointsExplorerDisplay.addNewFolderItem( pointsExplorerDisplay.treeMenuItems, pointsExplorerDisplay.tree)
pointsExplorerDisplay.addRenameItem( pointsExplorerDisplay.treeMenuItems, pointsExplorerDisplay.tree)
pointsExplorerDisplay.addDeleteItem( pointsExplorerDisplay.treeMenuItems, pointsExplorerDisplay.tree)
//    pointsExplorerDisplay.addCopyItem( pointsExplorerDisplay.treeMenuItems, pointsExplorerDisplay.tree)
//    pointsExplorerDisplay.addExportItem( pointsExplorerDisplay.treeMenuItems, pointsExplorerDisplay.tree)
//    pointsExplorerDisplay.addPasteItem( pointsExplorerDisplay.treeMenuItems, pointsExplorerDisplay.tree)
pointsExplorerDisplay.tree.menu.addTo(pointsExplorerDisplay.tree.getView())


 


   
   /**
    *    下方右击事件 list
    *      设置   pointsExplorerDisplay.list.editable = true 才可显示
    * addLocateTreeFileItem 等（pointsExplorerDiy.__proto__ 下可看到函数）： 新增文件夹
    *     
    *    pointsExplorerDisplay.list.menu.addTo(pointsExplorerDisplay.list.getView() )
    *             pointsExplorerDisplay.list.menu 为 ht 组件
    *            菜单显示 在  pointsExplorerDisplay.list.getView() 区域
    *     
    *   新建图标改源码设置，保存路径，（ editor.displays['diyPath'] = data.url）
    *    自定义一个 右击菜单事件， 
    *     editor.newSymbolView()
    *       editor.save()
    *    源码修改处在 client.js （注释为‘ 修改源码新建图标 ’处）
    *    找到 symbolViewSaved  处  添加 
    *     i.editor.displays['diyPath'] = ''
    *  找到 editor.displays.currentDir 处 添加
    *      if(this.editor.displays['diyPath']) {
                A = this.editor.displays['diyPath']
            }
    *    pointsExplorerDisplay.tree.sm().ld()
    *    当前点击 的文件，获取路径url
    */

   pointsExplorerDisplay.list.editable =  true

   // 新建图标 事件
   pointsExplorerDisplay.listMenuItems.push({
        id: "newDisplayDiy",
        label: '新建图纸',
        action: function() {
            var data = pointsExplorerDisplay.tree.sm().ld();
            // console.log('新建图标',  data)
            //  修改图标路径
            editor.displays['diyPath'] = data.url
            editor.newDisplayView()
            editor.save()

        }
    })

    pointsExplorerDisplay.addNewFolderItem( pointsExplorerDisplay.listMenuItems, pointsExplorerDisplay.list)
    pointsExplorerDisplay.addRenameItem( pointsExplorerDisplay.listMenuItems, pointsExplorerDisplay.list)

    // 拷贝
    pointsExplorerDisplay.listMenuItems.push({
        id: "copyDisplayDiy",
        label: '拷贝',
        action: function() {
          
            // console.log('新建图标',  data)
            //  修改图标路径
            // console.log('拷贝：', pointsExplorerDisplay)
          
            // if(pointsExplorerDisplay.copyFileInfos.length > 0) {
            //     editor.displays.copyFileInfos = []
            //     editor.displays.copyFileInfos =  pointsExplorerDisplay.copyFileInfos
            // }

            var pastedata = pointsExplorerDisplay.tree.sm().ld();
            var data = pointsExplorerDisplay.list.sm().ld();
    
            // console.log('新建图标',  data)
            //  修改图标路径
            console.log('拷贝：', data)
            
            let imgUrl =  data._image.split('?t')[0]
            data._icon = imgUrl
            data._image =  imgUrl
            data.value.fileIcon =  imgUrl
            data.image = true
           

            // console.log('拷贝 symbols ：', editor.symbols.copyFileInfos)
            // console.log('拷贝 pointsExplorerDiy：', pointsExplorerDisplay.copyFileInfos)
            
            editor.requestBase64(data.url,function(dataBase){
                console.log('requestBase64' , dataBase)
                data.content =  dataBase
                data.name =  data._name

                editor.requestBase64(imgUrl,function(imageBase){

                    data.image  = imageBase
                    editor.displays.copyFileInfos = []
                    editor.displays.copyFileInfos.push(data)
    
                    pointsExplorerDisplay.copyFileInfos = []
                
                    pointsExplorerDisplay.copyFileInfos.push(data)
    
                    editor.copyFiles()
                })
                
              
            })
            
            
        } , visible: function(){
            var data = pointsExplorerDisplay.list.sm().ld();
            if(data) return true
            return false

        }
    })

    // 粘贴
    pointsExplorerDisplay.listMenuItems.push({
        id: "pasteDisplayDiy",
        label: '粘贴',
        action: function() {
            // var data = pointsExplorerDisplay.tree.sm().ld();
            // console.log('新建图标',  data)
            //  修改图标路径
            // console.log('拷贝：', pointsExplorerDisplay)
          
            pointsExplorerDisplay.copyFileInfos =    editor.displays.copyFileInfos
            editor.pasteFiles()
            
            
        }
    })
   

//    pointsExplorerDisplay.addLocateTreeFileItem( pointsExplorerDisplay.listMenuItems, pointsExplorerDisplay.list)

   pointsExplorerDisplay.addDeleteItem( pointsExplorerDisplay.listMenuItems, pointsExplorerDisplay.list)
//    pointsExplorerDisplay.addCopyItem( pointsExplorerDisplay.listMenuItems, pointsExplorerDisplay.list)
//    pointsExplorerDisplay.addExportItem( pointsExplorerDisplay.listMenuItems, pointsExplorerDisplay.list)
//    pointsExplorerDisplay.addPasteItem( pointsExplorerDisplay.listMenuItems, pointsExplorerDisplay.list)

  
   pointsExplorerDisplay.list.menu.addTo(pointsExplorerDisplay.list.getView() )



console.log('addNewFolderItem jsonTreeItem', pointsExplorerDisplay.tree)
console.log('addNewFolderItem jsonTreeItem', editor.symbols)

    
  
    // data.path = 'storage/testdemo'
    pointsExplorerDisplay.tree.sm().ms(function(event) {
       
        var data = pointsExplorerDisplay.tree.sm().ld();
       
     
        if (data && data.a('needToLoad')) {
            data.a('needToLoad', false);
        }
    });


    if (draggable) {
        pointsExplorerDisplay.list.isDroppableToDisplayView = true;
        pointsExplorerDisplay.list.handleDropToEditView = function(view, fileNode, point, event) {
            console.log(' pointsExplorerDisplay.tree.sm() fileNode', fileNode,point)
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

    // console.log('pointsExplorerDisplay._rightView._view',pointsExplorerDisplay._rightView._view)
    // editor.symbols.tree.menu.addTo(pointsExplorerDisplay._leftView._view)
    // contextmenu.addTo(pointsExplorerDisplay._leftView._view)
    // editor.symbols.list.menu.addTo(pointsExplorerDisplay._rightView._view)
    return pointsExplorerDisplay;
}



// 格式化图标
function setDiyDisplayData(D,result,path){
   let keys = Object.keys(D)
   let  name = ''
   for(let i = 0; i < keys.length; i++){
        if(!keys[i])continue
        if(/(.json)$/.test(keys[i])) {
            console.log('路径', path)
            name =  keys[i].split('.')[0]
            // fileType =  keys[i].split('.')[1]
            result[keys[i]] = {
                fileType: 'display',
                path: rootDirDisplay +   ( path? '/' + path  : '' ),
                rootDirDisplay: rootDirDisplay,
                url: '/'+ rootDirDisplay +'/' + ( path?path + '/' + keys[i] :   keys[i] ),
                value: true,
                id: '/' + rootDirDisplay +'/' + ( path?path + '/' + keys[i] :   keys[i] ),
                image: '/' + rootDirDisplay + '/' + ( path?path + '/' + name +'.png' :  name +'.png' ) ,
                name:   keys[i],
                fileIcon: '/'+ rootDirDisplay +'/' + ( path?path + '/' + name +'.png' :  name +'.png' )  + '?t=' + new  Date().getTime()
            }
        }  else if( JSON.stringify( D[keys[i]]) === '{}'){
            result[keys[i]] = {
                fileType: 'dir'
            }
            // console.log('路径', result)
        } else if( D[keys[i]] instanceof Object) {
            console.log('路径',  keys[i] )
            result[keys[i]] = {}
            setDiyDisplayData(D[keys[i]], result[keys[i]] , (path ? path + '/' :'') + keys[i])
        } 
   }
}

