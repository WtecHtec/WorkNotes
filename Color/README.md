1. 引用  <script src="./js/color.js"></script>
2. 定义方法：

function enterRGB2(s) {
				
				if (s && s.match(/^\s*[0-9a-fA-F]{6}\s*$/)) {
					var r = hex2dec(s.substring(0,2))
					var g = hex2dec(s.substring(2,4));
					var b = hex2dec(s.substring(4,6));
					var rgb = new RGB(r,g,b);
					Palette.setScheme('m1')
					var hsv = ColorWheel.getColorByRGB(rgb);
					Palette.setHSV(hsv);
			
					}
				}
}
3. 使用 
enterRGB2('FF0000')

ps:
 setScheme: 
参数： m1 
返回: 	Palette.Primary 主色

参数： m2 
返回: 	Palette.Primary 主色
	   Palette.Compl  互补色
	
参数： m3 
返回: 	Palette.Primary 主色
       Palette.Sec1 辅助色 
      Palette.Sec2 辅助色 
	  
	  
参数： m4
返回: 	Palette.Primary 主色
       Palette.Sec1 辅助色 
      Palette.Sec2 辅助色 	  
	  Palette.Compl  互补色
	  
参数： m5
返回: 	Palette.Primary 主色
       Palette.Sec1 辅助色 
      Palette.Sec2 辅助色 	  
	  
参数： m6
返回: 	Palette.Primary 主色
       Palette.Sec1 辅助色 
      Palette.Sec2 辅助色 	
	  Palette.Compl  互补色	  
	