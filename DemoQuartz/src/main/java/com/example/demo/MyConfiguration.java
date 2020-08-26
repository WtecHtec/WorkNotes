package com.example.demo;

import java.util.concurrent.TimeUnit;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;
@Configuration
public class MyConfiguration extends WebMvcConfigurerAdapter {
 
//    @Override
//    public void addResourceHandlers(ResourceHandlerRegistry registry) {
//        /**
//         * @Description: 对文件的路径进行配置, 创建一个虚拟路径/templates/** ，即只要在<img src="/templates/picName.jpg" />便可以直接引用图片
//         *这是图片的物理路径  "file:/+本地图片的地址"
//         */
//	spring.mvc.static-path-pattern=/**
	//		spring.resources.static-locations=file:E://IOTIF/demo/target/classes
//        registry.addResourceHandler("/templates/**").addResourceLocations
//                ("file:/E:/IdeaProjects/gaygserver/src/main/resources/static/");
////        registry.addResourceHandler("/templates/**").addResourceLocations("classpath:/static/");
//        super.addResourceHandlers(registry);
//    }
 
// 设置访问 资源 文件
	@Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        //和页面有关的静态目录都放在项目的static目录下
      //  registry.addResourceHandler("/static/").addResourceLocations("classpath:/static/");
        //上传的图片在D盘下的OTA目录下，访问路径如：http://localhost:8081/OTA/d3cf0281-bb7f-40e0-ab77-406db95ccf2c.jpg
        //其中OTA表示访问的前缀。"file:D:/OTA/"是文件真实的存储路径
      /*  registry.addResourceHandler("/**").addResourceLocations("file:E:/IOTIF/demo/target/classes");*/
		  String Path = (String.valueOf(Thread.currentThread().getContextClassLoader().getResource(""))).replaceAll("file:/", "").replaceAll("%20", " ").trim(); 
		registry.addResourceHandler("/**")
         .addResourceLocations("file:"+Path)
         .setCacheControl(CacheControl.maxAge(1, TimeUnit.HOURS).cachePublic());
		System.out.println(Path);
		
    }
    @Override
    	public void addInterceptors(InterceptorRegistry registry) {
    		// TODO Auto-generated method stub
    		super.addInterceptors(registry);
    		
    	}
}
