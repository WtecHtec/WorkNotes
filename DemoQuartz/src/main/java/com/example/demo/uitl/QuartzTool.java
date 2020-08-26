package com.example.demo.uitl;

import org.quartz.*;
import org.quartz.impl.StdSchedulerFactory;
import org.springframework.stereotype.Component;

@Component
public class QuartzTool {

    private static SchedulerFactory schedulerFactory = new StdSchedulerFactory();
    /**
     *  新增一个时间调度器
     * @param triggerName
     * @param triggerGroupName
     * @param jobClass
     * @param cron
     * @return
     */
    public Boolean  AddQuartz(String triggerName, String triggerGroupName,Class jobClass ,String cron){
        try {
        // 创建一个JobDetail实例
        JobDetail jobDetail = JobBuilder.newJob(jobClass).build();
            // 创建一个CronTrigger，规定Job每隔一秒执行一次
            CronTrigger trigger = TriggerBuilder.newTrigger()
                    // 指定Trigger名称和组名称
                    .startNow().withIdentity(triggerName, triggerGroupName)
                    // 设置cron运行规则，定义每秒执行一次
                    .withSchedule(CronScheduleBuilder.cronSchedule(cron)).build();
            // 得到Scheduler调度器实例
            Scheduler scheduler = null;

            scheduler = new StdSchedulerFactory().getScheduler();
            scheduler.scheduleJob(jobDetail, trigger); // 绑定JobDetail和Trigger
            scheduler.start(); // 开始任务调度
            return true;
        } catch (SchedulerException e) {
            e.printStackTrace();
            return  false;
        }
    }


    /**
     *  修改一个时间调度器
     * @param triggerName
     * @param triggerGroupName
     * @param cron
     * @return
     */
    public  Boolean modifyQuartz(String triggerName, String triggerGroupName, String cron) {
        try {
            Scheduler scheduler = schedulerFactory.getScheduler();
            TriggerKey triggerKey = TriggerKey.triggerKey(triggerName, triggerGroupName);
            CronTrigger trigger = (CronTrigger) scheduler.getTrigger(triggerKey);
            if (trigger == null) {
                return false ;
            }
            String oldTime = trigger.getCronExpression();
            if (!oldTime.equalsIgnoreCase(cron)) {
                // 触发器
                TriggerBuilder<Trigger> triggerBuilder = TriggerBuilder.newTrigger();
                // 触发器名,触发器组
                triggerBuilder.withIdentity(triggerName, triggerGroupName);
                triggerBuilder.startNow();
                // 触发器时间设定
                triggerBuilder.withSchedule(CronScheduleBuilder.cronSchedule(cron));
                // 创建Trigger对象
                trigger = (CronTrigger) triggerBuilder.build();
                // 修改一个任务的触发时间
                scheduler.rescheduleJob(triggerKey, trigger);
            }
            return true ;
        } catch (Exception e) {
            e.printStackTrace();
            return false ;
        }
    }


    /**
     *  移除一个定时器
     * @param triggerName
     * @param triggerGroupName
     */
    public  Boolean removeQuartz(String triggerName, String triggerGroupName) {
        try {
            Scheduler scheduler = schedulerFactory.getScheduler();

            TriggerKey triggerKey = TriggerKey.triggerKey(triggerName,triggerGroupName);
            // 停止触发器
            scheduler.pauseTrigger(triggerKey);
            // 移除触发器
            scheduler.unscheduleJob(triggerKey);
            return  true;
        } catch (Exception e) {
            e.printStackTrace();
            return  false;
        }
    }

    /**
     *
     * 启动所有定时任务
     */
    public  Boolean startJobs() {
        try {
            Scheduler scheduler = schedulerFactory.getScheduler();
            scheduler.start();
            return  true;
        } catch (Exception e) {
            e.printStackTrace();
            return  false;
        }
    }

    /**
     * 功能：关闭所有定时任务
     */
    public Boolean shutdownJobs() {
        try {
            Scheduler scheduler = schedulerFactory.getScheduler();
            if (!scheduler.isShutdown()) {
                scheduler.shutdown();
            }
            return  true;
        } catch (Exception e) {
            e.printStackTrace();
            return  false;
        }
    }
}
