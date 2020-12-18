(function() {



    // function testBtn(view,name){
    //     var items = view.menu.getItems();
       
    //     items.push({
    //         label: '测试按钮',
    //         visible: function() {
            
    //             return true
            
    //         },
    //         background: function() {
    //             return '#F7F7F7';
    //         },
    //         action: function(event) {
    //             console.log(name ,event);
                
    //         }
    //     });
    // }
    var eventProperty  = ''
    var dataS = {
       
        'base': {
            type: 'enum',
            values: [50, 40, 30, 20, 10, 0],
            labels: [
                '50','40','30','20','10','0'
            ]
        },
        'alerm': {
            type: 'enum',
            values: [500, 400, 300, 200, 100, 0],
            labels: [
                '500','400','300','200','100','0'
            ]
        },
        'order': {
            type: 'enum',
            values: [5, 4, 3, 2, 1, 0],
            labels: [
                '5','4','3','2','1','0'
            ]
        }
    }
    
    let  pointsTabDiy = null
    let tabDiyDisplays = null
    let tabDiyComponents = null
 


    window.hteditor_config.handleEvent = function(editor, type, params) {
      
       
      
    
    
        // 文件修改
        if(type === 'fileChanged') {
            console.log('pointsTabDiy fileChanged',pointsTabDiy)
            initDiyTab()
        }


        if(type === 'displayViewDataPropertyChanged'){
            if(params.event.property === "a:custom.server") {
                eventProperty = params.event.property  
            }
        }

        if(type === 'propertiesUpdated'){
        
                let elRows = editor.inspector.getRows()
                for(let i=0; i < elRows.length;i++){
                    if(elRows[i]['keys'] && elRows[i]['keys']['name'] && elRows[i]['keys']['name'] === 'custom.dataserver') {
                        console.log('editor.elRows ',  elRows[i])
                        let checkBox = elRows[i]['items'][1]
                        console.log('editor.elRows ',  checkBox)
                        let server =  editor.inspector.getPropertyValue('custom.server')
                        console.log('editor.elRows ',  server)
                        if(eventProperty) {
                            checkBox.element.setValue('')
                            editor.inspector.setPropertyValue('custom.dataserver','')
                            eventProperty = ''
                        }
                        if(server) {
                            checkBox.element.setLabels(  dataS[server].labels)
                            checkBox.element.setValues(  dataS[server].values)
                        } 
                    }
                }   
        }
       
     
        var S = hteditor.getString;
        if (type === 'editorCreated') {
            handleEditorCreated(editor);
            createPointsTab(editor);
          
            // 创建自定义图标菜单
            pointsTabDiy = createDiyTab(editor)

            // 创建自定义图纸菜单
            tabDiyDisplays = createDisplayTab(editor)


            // 创建自定义组件
            tabDiyComponents = createComponentTab(editor)
           

        }
        else if (type === 'displayViewCreated' || type === 'displayViewOpened') {
            addPrintSelectionItem(params.displayView.displayTree, 'editor.displayTree');
            addPrintSelectionItem(params.displayView.graphView, 'editor.displayView.graphView');
          
            addSkewTranlateItem(params.displayView.graphView, 'editor.displayView.graphView');
            // testBtn(params.displayView.graphView, 'editor.displayView.graphView')
            // params.displayView.graphView.getEditInteractor().setStyle('anchorVisible', false);
            // params.displayView.graphView.getEditInteractor().setStyle('connectGuideVisible', false);
        }
        else if (type === 'symbolViewCreated' || type === 'symbolViewOpened') {
            addPrintSelectionItem(params.symbolView.symbolList, 'editor.symbolList');
            addPrintSelectionItem(params.symbolView.graphView, 'editor.symbolView.graphView');
        }
        else if (type === 'displayViewSaving') {
            // if (!params.displayView.dm.size()) {
            //     window.alert(S('NothingToBeSaved'));
            //     params.preventDefault = true;
            // }
        }
        else if (type === 'symbolViewSaving') {
            // if (!params.symbolView.dm.size()) {
            //     window.alert(S('NothingToBeSaved'));
            //     params.preventDefault = true;
            // }
        }
        else if (type === 'paste') {
            params.datas.forEach(function(data) {
                var dataBindings = data.getDataBindings();
                if (dataBindings) {
                    // update attrs
                    for (var name in dataBindings.a) {
                        var db = dataBindings.a[name];
                        db.id = db.id + '_copied';
                    }
                    // update styles
                    for (var name in dataBindings.s) {
                        var db = dataBindings.s[name];
                        db.id = db.id + '_copied';
                    }
                    // update properties
                    for (var name in dataBindings.p) {
                        var db = dataBindings.p[name];
                        db.id = db.id + '_copied';
                    }
                }
            });
        }
    };

    function addPrintSelectionItem(view, name) {
        var items = view.menu.getItems();
        items.push('separator');
        items.push({
            icon: 'symbols/basic/ht.json',
            label: hteditor.getString('PrintSelection'),
            visible: function() {
                if (view instanceof ht.widget.TabView) {
                    return view.getTabModel().getSelectionModel().size() > 0;
                }
                else {
                    return view.getSelectionModel().size() > 0;
                }
            },
            background: function() {
                return '#F7F7F7';
            },
            action: function() {
                console.log(name + ' selection:[');
                if (view instanceof ht.widget.TabView) {
                    view.getTabModel().getSelectionModel().each(function(data) {
                        console.log(data);
                    });
                }
                else {
                    view.getSelectionModel().each(function(data) {
                        console.log(data);
                    });
                }
                console.log(']');
            }
        });
    }

    var skewImage = 'symbols/basic/skew-image.json';
    function addSkewTranlateItem(view) {
        var items = view.menu.getItems();
        items.splice(-1, 0, {
            label: '轴侧切换',
            visible: function() {
                return view.sm().size() > 0;
            },
            action: function() {
                view.sm().each(function(data) {
                    if (data.getClassName() === 'ht.Node' && !data.s('shape')) {
                        var image = data.getImage();
                        if (image === skewImage) {
                            data.setImage(data.a('skew.image') || 'node_image');
                        }
                        else {
                            data.a('skew.image', image);
                            data.setImage(skewImage);
                        }
                    }
                });
            }
        });

    }

    // 文件修改时,更新自定义菜单文件
    function initDiyTab(){
        pointsTabDiy.prototype.LoadFiles(pointsTabDiy.getView())
        // editor.reload()
        tabDiyDisplays.prototype.LoadDisplayFiles(tabDiyDisplays.getView())

        tabDiyComponents.prototype.LoadComponentFiles(tabDiyComponents.getView())
    }

    // 设置原始tab是否显示
    function setViewShowByDefault(editor){
        // editor.displaysTab.setDisabled(true)
        // editor.displaysTab.remove(0)
        // editor.leftTopTabView.remove(0)
        // editor.leftTopTabView.select(0)

          // 自定义路径清空
        editor.leftTopTabView.onTabChanged = function(g,h,p){
            console.log('onTabChanged editor',   editor.leftTopTabView)
            editor.componentView['diyPath'] = ''
            editor.symbols['diyPath'] = ''
            editor.displays['diyPath'] = ''
            // console.log('onTabChanged inspector', editor.inspector) 
        } 
    }


     // 设置图标右击菜单不显示
    function handleSymbolsMenu(editor){
        // editor.symbols.list.menu.pop()
        console.log('  editor.symbols',   editor.symbols)
        editor.symbols.list.menu.setItemVisible('newFolder', false);
        editor.symbols.list.menu.setItemVisible('newSymbolView', false);
        editor.symbols.list.menu.setItemVisible('locateFile', false);
        editor.symbols.list.menu.setItemVisible('paste', false);
        editor.symbols.list.menu.setItemVisible('rename', false);
        editor.symbols.list.menu.setItemVisible('delete', false);
        editor.symbols.list.menu.setItemVisible('export', false);
       
        editor.symbols.tree.menu.setItemVisible('newSymbolView', false);
        editor.symbols.tree.menu.setItemVisible('newFolder', false);
        editor.symbols.tree.menu.setItemVisible('locateFile', false);
        editor.symbols.tree.menu.setItemVisible('rename', false);
        editor.symbols.tree.menu.setItemVisible('delete', false);
    }
  

    // 设置组件 右击事件
    function handleComponentMenu(editor){
        // editor.symbols.list.menu.pop()
        console.log('  editor.symbols',   editor.symbols)
        editor.components.list.menu.setItemVisible('newFolder', false);
        editor.components.list.menu.setItemVisible('newSymbolView', false);
        editor.components.list.menu.setItemVisible('locateFile', false);
        editor.components.list.menu.setItemVisible('paste', false);
        editor.components.list.menu.setItemVisible('rename', false);
        editor.components.list.menu.setItemVisible('delete', false);
        editor.components.list.menu.setItemVisible('export', false);
       
        editor.components.tree.menu.setItemVisible('newSymbolView', false);
        editor.components.tree.menu.setItemVisible('newFolder', false);
        editor.components.tree.menu.setItemVisible('locateFile', false);
        editor.components.tree.menu.setItemVisible('rename', false);
        editor.components.tree.menu.setItemVisible('delete', false);
    }
  


    // 设置图标不能修改
    function handleSymbosEdit(editor){
        editor.symbols.tree.editable = false
        // editor.symbols.list.editable = fals

      
      
         // 点击事件
         editor.symbols.list.handleClick=  function(P, D){
            console.log('handleClick',P, D)
            // alert('默认图标不能修改！')
            console.log(editor.symbols)
            if (D['fileType'] ==='symbol') {
                D['fileType'] = 'point'
            }

            editor.symbols.list.handleDataDoubleSelect = function(P, D){
                console.log('handleDataDoubleSelect',P, D)
            }

            return false
        }
        // 双击事件
        editor.symbols.list.checkDoubleClickOnNote = function(P, D){
            console.log('checkDoubleClickOnNote',P, D)
            if (D['fileType'] ==='symbol') {
                D['fileType'] = 'point'
            }
            return false
        }
        // 拖拽
        editor.symbols.list.handleDropToEditView = function(view, fileNode, point, event){
            console.log('handleDropToEditView',fileNode)
            if (fileNode['fileType'] ==='point') {
                fileNode['fileType'] = 'symbol'
            }

            if(fileNode.fileType === 'symbol') {
                 // 组件 拖进 图纸 函数 
                window.editor.$100$(fileNode,point)
                view.graphView.setFocus()

                // var node = new ht.Node();
                // node.setImage(fileNode.url);
                
                // node.p(point);
                // node.setDisplayName(fileNode.getName());
                // view.addData(node);
            }
            return false
        }
    }

      // 设置组件不能修改
      function handleComponentEdit(editor){
        editor.components.tree.editable = false
        // editor.symbols.list.editable = fals

      
      
         // 点击事件
         editor.components.list.handleClick=  function(P, D){
            console.log('handleClick',P, D)
            // alert('默认图标不能修改！')
            console.log(editor.symbols)
            if (D['fileType'] ==='component') {
                D['fileType'] = 'point'
            }

            editor.components.list.handleDataDoubleSelect = function(P, D){
                console.log('handleDataDoubleSelect',P, D)
            }

            return false
        }
        // 双击事件
        editor.components.list.checkDoubleClickOnNote = function(P, D){
            console.log('checkDoubleClickOnNote',P, D)
            if (D['fileType'] ==='component') {
                D['fileType'] = 'point'
            }
            return false
        }

        // // 拖拽
        editor.components.list.handleDropToEditView = function(view, fileNode, point, event){
            console.log('handleDropToEditView',view ,fileNode)
            if (fileNode['fileType'] ==='point') {
                fileNode['fileType'] = 'component'
            }

            if(fileNode.fileType === 'component') {
                 // 组件 拖进 图纸 函数 
                window.editor.$100$(fileNode,point)
                view.graphView.setFocus()
            }
            return false
        }
    }


    function handleEditorCreated(editor) {
        // Prevent some files from being renamed, moved or deleted
        editor.addEventListener(function(event) {
            if (event.type === 'fileRenaming' ||
                event.type === 'fileMoving' ||
                event.type === 'fileDeleting') {
                if (event.params.url === 'symbols/basic/ht.json' ||
                    event.params.url === 'symbols/basic' ||
                    event.params.url === 'displays/basic') {
                    event.params.preventDefault = true;
                }
            }
        });

        handleComponentMenu(editor)
        handleSymbolsMenu(editor)

        handleSymbosEdit(editor)

        setViewShowByDefault(editor)

        handleComponentEdit(editor)

        editor.displays.list.menu.setItemVisible('open', false);
        editor.symbols.list.menu.setItemVisible('open', false);
        editor.symbols.list.menu.setItemVisible('insert', false);
        editor.components.list.menu.setItemVisible('open', false);
        editor.components.list.menu.setItemVisible('insert', false);
        editor.assets.list.menu.setItemVisible('insert', false);

        // Add print item
        addPrintSelectionItem(editor.displays.tree, 'editor.displays.tree');
        addPrintSelectionItem(editor.displays.list, 'editor.displays.list');
        addPrintSelectionItem(editor.symbols.tree, 'editor.symbols.tree');
        addPrintSelectionItem(editor.symbols.list, 'editor.symbols.list');
        addPrintSelectionItem(editor.components.tree, 'editor.components.tree');
        addPrintSelectionItem(editor.components.list, 'editor.components.list');
        addPrintSelectionItem(editor.assets.tree, 'editor.assets.tree');
        addPrintSelectionItem(editor.assets.list, 'editor.assets.list');
        addPrintSelectionItem(editor.mainTabView, 'editor.mainTabView');

        // // Remove components tab
        // editor.leftTopTabView.remove(editor.componentsTab);

        // // Rearrange toolbar items
        // var mainItems = editor.mainToolbar.getItems();
        // var rightItems = editor.rightToolbar.getItems();
        // editor.mainToolbar.setItems([mainItems[0], editor.rightToolbar.removeItemById('save')]);
        // editor.rightToolbar.setItems(mainItems.slice(1).concat(rightItems));

        // // Draw extra icon on file list
        // var fileList = editor.displays.list;
        // fileList.addTopPainter(function(g) {
        //     var htIcon = ht.Default.getImage('symbols/basic/ht.json');
        //     fileList.getDataModel().each(function(file) {
        //         if (fileList.isVisible(file)) {
        //             if (fileList.getLayoutType() === 'list') {
        //                 var x = 0;
        //                 var y = file.p().y - fileList.getRowHeight() / 2;
        //                 var width = fileList.getWidth();
        //                 var height = fileList.getRowHeight();
        //                 g.fillStyle = 'yellow';
        //                 g.beginPath();
        //                 g.rect(width - 16, y, 16, 16);
        //                 g.fill();
        //                 ht.Default.drawStretchImage(g, htIcon, 'uniform', width - 16, y, 16, 16);
        //             }
        //             else {
        //                 var rect = file.getRect();
        //                 g.fillStyle = 'yellow';
        //                 g.beginPath();
        //                 g.rect(rect.x + rect.width - 16, rect.y, 16, 16);
        //                 g.fill();
        //                 ht.Default.drawStretchImage(g, htIcon, 'uniform', rect.x + rect.width - 16, rect.y, 16, 16);
        //             }
        //         }
        //     });
        // });

        // Add a custom tab to show more information
        // addCustomTab(editor);

        // Disable symbol editing
        // var oldOpen = editor.open;
        // editor.open = function(fileNode) {
        //     if (fileNode && fileNode.fileType === 'symbol') {
        //         return;
        //     }
        //     oldOpen.apply(editor, arguments);
        // }
    }


    // function addCustomTab(editor) {
    //     var tabView = new ht.widget.TabView();
    //     var styleTab = new ht.Tab();
    //     styleTab.setName('Style Properties');
    //     styleTab.setView(editor.inspectorPane);
    //     tabView.getTabModel().add(styleTab);

    //     var customFormPane = new ht.widget.FormPane();
    //     var customTab = new ht.Tab();
    //     customTab.setName('Custom Properties');
    //     customTab.setView(customFormPane);
    //     tabView.getTabModel().add(customTab);

    //     tabView.getTabModel().sm().ss(styleTab);
    //     editor.rightTopBorderPane.setCenterView(tabView);

    //     var dm;
    //     var data;
    //     var updaters = [];
    //     editor.addEventListener(function(event) {
    //         if (event.type === 'tabUpdated') {
    //             if (dm) {
    //                 dm.sm().removeSelectionChangeListener(updateCustomFormPane);
    //                 dm.removeDataPropertyChangeListener(handlePropertyChange);
    //             }
    //             dm = editor.displayView ? editor.displayView.dm : null;
    //             if (dm) {
    //                 dm.sm().addSelectionChangeListener(updateCustomFormPane);
    //                 dm.addDataPropertyChangeListener(handlePropertyChange);
    //             }
    //             updateCustomFormPane();
    //         }
    //     });

    //     function updateCustomFormPane() {
    //         customFormPane.clear();
    //         if (dm) {
    //             data = dm.sm().ld();
    //             updates = [];
    //             if (data) {
    //                 // add Id row
    //                 var getter = function() {
    //                     return data.getId();
    //                 };
    //                 var setter = null;
    //                 createTextField('Id', getter, setter);

    //                 // Add name row
    //                 getter = function() {
    //                     if (data) {
    //                         return data.getDisplayName() || '';
    //                     }
    //                     return '';
    //                 };
    //                 setter = function(value) {
    //                     if (data) {
    //                         data.setDisplayName(value);
    //                     }
    //                 };
    //                 createTextField('Name', getter, setter);

    //                 var index = 0;
    //                 data.eachChild(function(child) {
    //                     createChildInfo(child, index++);
    //                 });
    //             }
    //         }
    //         updateProperties();
    //     }

    //     function createTextField(name, getter, setter) {
    //         var textField = new ht.widget.TextField();
    //         customFormPane.addRow([name, textField], [70, 0.1]);
    //         updaters.push(function() {
    //             textField.setValue(getter());
    //         });
    //         if (setter) {
    //             var input = textField.getElement();
    //             input.onblur = function() {
    //                 setter(input.value);
    //             };
    //             input.onkeydown = function(event) {
    //                 if (ht.Default.isEnter(event)) {
    //                     setter(input.value);
    //                 }
    //             };
    //         }
    //         else {
    //             textField.setEditable(false);
    //         }
    //     }

    //     function createChildInfo(child, index) {
    //         var title = { element: ' > Child-' + index, font: 'bold 12px arial, sans-serif' };
    //         customFormPane.addRow([title], [0.1], null, { background: '#F7F7F7' });

    //         // add Id row
    //         var getter = function() {
    //             return child.getId();
    //         };
    //         var setter = null;
    //         createTextField('Id', getter, setter);

    //         // Add name row
    //         getter = function() {
    //             return child.getDisplayName() || '';
    //         };
    //         setter = function(value) {
    //             child.setDisplayName(value);
    //         };
    //         createTextField('Name', getter, setter);
    //     }

    //     function handlePropertyChange(event) {
    //         if (event.data === data) {
    //             updateProperties();
    //         }
    //     }

    //     function updateProperties() {
    //         if (data) {
    //             updaters.forEach(function(updater) {
    //                 updater();
    //             });
    //         }
    //     }
    // }

})();
























