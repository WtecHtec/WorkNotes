package com.example.demo;

import org.mybatis.spring.annotation.MapperScan;
import org.quartz.*;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

@SpringBootApplication

@MapperScan("com.example.demo.dao.mapper")
public class DemoApplication extends  WebMvcConfigurerAdapter{

	public static void main(String[] args) throws SchedulerException{
		SpringApplication.run(DemoApplication.class, args);
		System.out.print("开始");
//		// 创建一个JobDetail实例
//		JobDetail jobDetail = JobBuilder.newJob(QuartzJob.class)
//				// 指定JobDetail的名称和组名称
//				.withIdentity("job1", "group1").build();
//
//		// 创建一个CronTrigger，规定Job每隔一秒执行一次
//		CronTrigger trigger = TriggerBuilder.newTrigger()
//				// 指定Trigger名称和组名称
//				.startNow().withIdentity("trigger1", "group1")
//				// 设置cron运行规则，定义每秒执行一次
//				.withSchedule(CronScheduleBuilder.cronSchedule("*/2 * * * * ?")).build();
//		// 得到Scheduler调度器实例
//		Scheduler scheduler = new StdSchedulerFactory().getScheduler();
//		scheduler.scheduleJob(jobDetail, trigger); // 绑定JobDetail和Trigger
//		scheduler.start();                         // 开始任务调度

	}
	// 跨域
	@Override
	public void addCorsMappings(CorsRegistry registry) {
 
		registry.addMapping("/**")
				.allowCredentials(true)
				.allowedHeaders("*")
				.allowedOrigins("*")
				.allowedMethods("*");
	
	}




}
