
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

let rootDirComponent = 'componenttest'
let  Component = '自定义组件'
let rootNodeNameComponent = '自定义组件根目录'



// if (D.getFileNode(A)) return void gP(S("editor.filenameconflict"), A, function() {});
// D.request("mkdir", A, function(P) {})

// Used in config-handleEvent.js
function createComponentTab(editor) {


      
    console.log('getFileNode(rootDirComponent): ', ht) 

    let pointsTabComponent = new ht.Tab();
    pointsTabComponent.setName(Component);
    editor.leftTopTabView.getTabModel().add(pointsTabComponent,2);

    console.log('editor.leftTopTabView.getTabModel():',editor)

    pointsTabComponent.setView(createPointsExplorerComponent(editor, true));

   
    // pointsTabDiy._dataModel.clear()
    console.log('createDiyTab pointsTabDiy', pointsTabComponent)
    // console.log('createDiyTab editor.symbols', editor.symbols)
    // console.log('createDiyTab editor.symbols.list', editor.symbols.list)
    // console.log('createDiyTab editor',  editor.symbols.list.menu)
    // console.log('createDiyTab editor', editor.symbols.rootNode)
    // console.log('createDiyTab', editor.symbols.tree.menu._items[0].action)
    pointsTabComponent.prototype =  {}
    pointsTabComponent.prototype['LoadComponentFiles'] =  LoadComponentFiles
    return pointsTabComponent;
}

/**
 *  菜单生成时调用；config-handleEvent 保存事件时调用。
 * @param { } pointsExplorerComponent 
 *  从目录（rootDir）加载，目录下的资源
 *  window.editor.request 可实现
 *   将 请求到的资源进行数据格式化 （自定义格式化函数 setDiySymbolData ）
 *  通过 parse 函数
 */
function LoadComponentFiles (pointsExplorerComponent){
  
    // pointsExplorerComponent.dataModel.clear()
    // 加载数据
    window.editor.request("explore", '/' +  rootDirComponent, function(D) {
        console.log('pointsExplorerComponent request',D)
        // window.editor.insertLocalJSONFile(pointsExplorerComponent,D)
        let result = {}
        // 数据格式化
        setDiyComponentData(D,result)

        console.log('setDiySymbolData result: ',result)
        requestAnimationFrame(function(){
            console.log('setDiySymbolData result: ',pointsExplorerComponent.rootNode)
            pointsExplorerComponent.rootNode._name  = rootNodeNameComponent
        })
       
        
        pointsExplorerComponent.parse(result);
    },100)
}

/**
 *  创建  Explorer 
 *  以及 右击事件 实现 （新增文件夹，新增图标，删除等 （pointsExplorerDiy.__proto__ 下可看到函数））
 * @param {*} editor 
 * @param {*} draggable 
 */
function createPointsExplorerComponent(editor,draggable) {
   
    let pointsExplorerComponent = new hteditor.Explorer(editor,  rootDirComponent, false);

 
   



    let HTTPService = hteditor.HTTPService.prototype
    
   // 加载数据
   LoadComponentFiles(pointsExplorerComponent)



    console.log('pointsExplorerComponent hteditor : ',HTTPService)
    console.log('pointsExplorerComponent  rootNode: ', pointsExplorerComponent.getFileListView())

   
    


    var contextmenu = new ht.widget.ContextMenu();
   
   console.log(' pointsExplorerComponent.tree.editable', pointsExplorerComponent.tree.editable)


   /**
    *    上方右击事件 tree
    *      设置   pointsExplorerComponent.tree.editable = true 才可显示
    *      addLocateTreeFileItem 等（pointsExplorerDiy.__proto__ 下可看到函数）： 新增文件夹
    *       pointsExplorerComponent.tree.menu.addTo(pointsExplorerComponent.tree.getView())
    *            pointsExplorerComponent.tree.menu 为 ht 组件
    *            菜单显示 在  pointsExplorerComponent.tree.getView()区域
    */
   pointsExplorerComponent.tree.editable = true
   // 新建图标 事件
   pointsExplorerComponent.treeMenuItems.push({
    id: "newComponentDiy",
    label: '新建组件',
    action: function() {
        var data = pointsExplorerComponent.tree.sm().ld();
        // console.log('新建图标',  data)
        //  修改图标路径


        editor.componentView['diyPath'] = data.url
        // editor.components['diyPath'] = data.url
        editor.newComponent()
        editor.save()

    }
})

console.log(' pointsExplorerComponent:', pointsExplorerComponent)
//    pointsExplorerComponent.addLocateTreeFileItem( pointsExplorerComponent.treeMenuItems, pointsExplorerComponent.tree)
pointsExplorerComponent.addNewFolderItem( pointsExplorerComponent.treeMenuItems, pointsExplorerComponent.tree)
pointsExplorerComponent.addRenameItem( pointsExplorerComponent.treeMenuItems, pointsExplorerComponent.tree)
pointsExplorerComponent.addDeleteItem( pointsExplorerComponent.treeMenuItems, pointsExplorerComponent.tree)
//    pointsExplorerComponent.addCopyItem( pointsExplorerComponent.treeMenuItems, pointsExplorerComponent.tree)
//    pointsExplorerComponent.addExportItem( pointsExplorerComponent.treeMenuItems, pointsExplorerComponent.tree)
//    pointsExplorerComponent.addPasteItem( pointsExplorerComponent.treeMenuItems, pointsExplorerComponent.tree)
pointsExplorerComponent.tree.menu.addTo(pointsExplorerComponent.tree.getView())


 


   
   /**
    *    下方右击事件 list
    *      设置   pointsExplorerComponent.list.editable = true 才可显示
    * addLocateTreeFileItem 等（pointsExplorerDiy.__proto__ 下可看到函数）： 新增文件夹
    *     
    *    pointsExplorerComponent.list.menu.addTo(pointsExplorerComponent.list.getView() )
    *             pointsExplorerComponent.list.menu 为 ht 组件
    *            菜单显示 在  pointsExplorerComponent.list.getView() 区域
    *     
    *   新建图标改源码设置，保存路径，（ editor.symbols['diyPath'] = data.url）
    *    自定义一个 右击菜单事件， 
    *     editor.newSymbolView()
    *       editor.save()
    *    源码修改处在 client.js （注释为‘ 修改源码新建图标 ’处）
    *    找到  P.editor.fireEvent("componentViewSaved", S))  处  添加 
    *     ,this['diyPath'] = ''
    *  找到    var i = this.inspectorPane.v("path"), 处 添加
    *        if (this['diyPath']) {
                            i = this['diyPath']
                        }
    *    pointsExplorerComponent.tree.sm().ld()
    *    当前点击 的文件，获取路径url
    */

   pointsExplorerComponent.list.editable =  true

   // 新建图标 事件
   pointsExplorerComponent.listMenuItems.push({
        id: "newComponentDiy",
        label: '新建组件',
        action: function() {
            var data = pointsExplorerComponent.tree.sm().ld();
            // console.log('新建图标',  data)
            //  修改图标路径
            editor.componentView['diyPath'] = data.url
            editor.newComponent()
            editor.save()

        }
    })

    pointsExplorerComponent.addNewFolderItem( pointsExplorerComponent.listMenuItems, pointsExplorerComponent.list)
    pointsExplorerComponent.addRenameItem( pointsExplorerComponent.listMenuItems, pointsExplorerComponent.list)


    // action: function() {
    //     // var data = pointsExplorerComponent.tree.sm().ld();
    //     // console.log('新建图标',  data)
    //     //  修改图标路径
    //     console.log('拷贝：', pointsExplorerComponent)
      
    //     if(pointsExplorerComponent.copyFileInfos.length > 0) {
    //         editor.components.copyFileInfos = []
    //         editor.components.copyFileInfos =  pointsExplorerComponent.copyFileInfos
    //     }
    //     editor.copyFiles()
        
        
    // },

    // 拷贝
    pointsExplorerComponent.listMenuItems.push({
        id: "copyComponentDiy",
        label: '拷贝',
        action: function() {
          
            // console.log('新建图标',  data)
            //  修改图标路径
            // console.log('拷贝：', pointsExplorerDisplay)
          
            // if(pointsExplorerDisplay.copyFileInfos.length > 0) {
            //     editor.displays.copyFileInfos = []
            //     editor.displays.copyFileInfos =  pointsExplorerDisplay.copyFileInfos
            // }

            var pastedata = pointsExplorerComponent.tree.sm().ld();
            var data = pointsExplorerComponent.list.sm().ld();
    
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
                    editor.components.copyFileInfos = []
                    editor.components.copyFileInfos.push(data)
    
                    pointsExplorerComponent.copyFileInfos = []
                
                    pointsExplorerComponent.copyFileInfos.push(data)
    
                    editor.copyFiles()
                })
                
              
            })
            
            
        } , visible: function(){
            var data = pointsExplorerComponent.list.sm().ld();
            if(data) return true
            return false

        }
    })

    // 粘贴
    pointsExplorerComponent.listMenuItems.push({
        id: "pasteComponentDiy",
        label: '粘贴',
        action: function() {
            // var data = pointsExplorerComponent.tree.sm().ld();
            // console.log('新建图标',  data)
            //  修改图标路径
            // console.log('拷贝：', pointsExplorerComponent)
          
            pointsExplorerComponent.copyFileInfos =    editor.components.copyFileInfos
            editor.pasteFiles()
            
            
        }
    })
   

//    pointsExplorerComponent.addLocateTreeFileItem( pointsExplorerComponent.listMenuItems, pointsExplorerComponent.list)

   pointsExplorerComponent.addDeleteItem( pointsExplorerComponent.listMenuItems, pointsExplorerComponent.list)
//    pointsExplorerComponent.addCopyItem( pointsExplorerComponent.listMenuItems, pointsExplorerComponent.list)
//    pointsExplorerComponent.addExportItem( pointsExplorerComponent.listMenuItems, pointsExplorerComponent.list)
//    pointsExplorerComponent.addPasteItem( pointsExplorerComponent.listMenuItems, pointsExplorerComponent.list)

  
   pointsExplorerComponent.list.menu.addTo(pointsExplorerComponent.list.getView() )



console.log('addNewFolderItem jsonTreeItem', pointsExplorerComponent.tree)
console.log('addNewFolderItem jsonTreeItem', editor.symbols)

    
  
    // data.path = 'storage/testdemo'
    pointsExplorerComponent.tree.sm().ms(function(event) {
        console.log( window.editor)
        console.log( pointsExplorerComponent.list )
        var data = pointsExplorerComponent.tree.sm().ld();
    });

    if (draggable) {
        //  开启  组件允许 拖进 图纸 
        pointsExplorerComponent.list.isDroppableToSymbolView = true;
        pointsExplorerComponent.list.handleDropToEditView = function(view, fileNode, point, event) {
            console.log(' pointsExplorerComponent.tree.sm() fileNode',view)
            if(fileNode.fileType === 'component') {
                // ht.Default.parse(fileNode)
                // {
                //     type: P.url,
                //     rect :[D ? D.x : (this.dm.a("width") || 0) / 2, D ? D.y : (this.dm.a("height") || 0) / 2, -1, -1]
                // }

                // var node = new ht.Node({
                //     type:fileNode.url,
                //     rect: [0,0,100,100]
                // });


                // 组件 拖进 图纸 函数 
                window.editor.$98$(fileNode,point)
                view.graphView.setFocus()

                // pointsExplorerComponent.removeSelection()
                // console.log(node)
                
                // node.type = fileNode.url,
                // node.setImage(fileNode.url);

                // node.setImage('editor.comp');
                // node.p(point);
                // node.setDisplayName(fileNode.getName());
                // view.addData(node);
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

    // console.log('pointsExplorerComponent._rightView._view',pointsExplorerComponent._rightView._view)
    // editor.symbols.tree.menu.addTo(pointsExplorerComponent._leftView._view)
    // contextmenu.addTo(pointsExplorerComponent._leftView._view)
    // editor.symbols.list.menu.addTo(pointsExplorerComponent._rightView._view)
    return pointsExplorerComponent;
}



// 格式化图标
function setDiyComponentData(D,result,path){
   let keys = Object.keys(D)
   let  name = ''
   for(let i = 0; i < keys.length; i++){
        if(!keys[i])continue
        if(/(.json)$/.test(keys[i])) {
            console.log('路径', path)
            name =  keys[i].split('.')[0]
            // fileType =  keys[i].split('.')[1]
            result[keys[i]] = {
                fileType: 'component',
                path: rootDirComponent +   ( path? '/' + path  : '' ),
                rootDirComponent: rootDirComponent,
                url: '/'+ rootDirComponent +'/' + ( path?path + '/' + keys[i] :   keys[i] ),
                value: true,
                id: '/' + rootDirComponent +'/' + ( path?path + '/' + keys[i] :   keys[i] ),
                image: '/' + rootDirComponent + '/' + ( path?path + '/' + name +'.png' :  name +'.png' ) ,
                name:   keys[i],
                fileIcon: '/'+ rootDirComponent +'/' + ( path?path + '/' + name +'.png' :  name +'.png' )  + '?t=' + new  Date().getTime()
            }
        }  else if( JSON.stringify( D[keys[i]]) === '{}'){
            result[keys[i]] = {
                fileType: 'dir'
            }
            // console.log('路径', result)
        } else if( D[keys[i]] instanceof Object) {
            console.log('路径',  keys[i] )
            result[keys[i]] = {}
            setDiyComponentData(D[keys[i]], result[keys[i]] , (path ? path + '/' :'') + keys[i])
        } 
   }
}

