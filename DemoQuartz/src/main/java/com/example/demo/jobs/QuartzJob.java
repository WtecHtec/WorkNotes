package com.example.demo.jobs;


import org.quartz.*;
import org.quartz.Job;
import org.quartz.impl.StdSchedulerFactory;

import java.text.SimpleDateFormat;
import java.util.Date;

public class QuartzJob implements Job{

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        // 任务逻辑代码
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");//设置日期格式
        System.out.print("QuartzJob" + df.format(new Date()));
        System.out.println();
    }

}
