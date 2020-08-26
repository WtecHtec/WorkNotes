
这几天突然想弄一个，可以通过接口实现自定义定时任务，之前使用的是@Scheduled。 经查询quartz可实现。话不多说，直接上码。
[源码](https://github.com/WtecHtec/WorkNotes/tree/master/DemoQuartz)
# 引用
```
	<dependency>
			<groupId>org.quartz-scheduler</groupId>
			<artifactId>quartz</artifactId>
			<version>2.3.2</version>
		</dependency>
```
#  QuartzTool 类
实现新增，修改，删除等功能
```
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
```

# QuartzRequest 类
请求参数实体类
```

public class QuartzRequest {
    private String triggerName;
    private String triggerGroupName;
    private String cron;

    public String getTriggerName() {
        return triggerName;
    }

    public void setTriggerName(String triggerName) {
        this.triggerName = triggerName;
    }

    public String getTriggerGroupName() {
        return triggerGroupName;
    }

    public void setTriggerGroupName(String triggerGroupName) {
        this.triggerGroupName = triggerGroupName;
    }

    public String getCron() {
        return cron;
    }

    public void setCron(String cron) {
        this.cron = cron;
    }
}

```

# jobClass 类
定时任务中执行用的，这里创建QuartzJob 跟 QuartzJobTwo

```
public class QuartzJob implements Job{

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        // 任务逻辑代码
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");//设置日期格式
        System.out.print("QuartzJob" + df.format(new Date()));
        System.out.println();
    }

}
```
```
public class QuartzJobTwo implements Job{

    @Override
    public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
        // 任务逻辑代码
        SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");//设置日期格式
        System.out.print("QuartzJobTwo" + df.format(new Date()));
        System.out.println();
    }
    
}
```
# contronller 层类
```
@Controller
public class QuartContronller {

    @Autowired
    private QuartzTool quartzTool;

    @RequestMapping(value ="/addQuartz",method = RequestMethod.POST)
    @ResponseBody
    public BaseResponse<Boolean> AddQuartz(@RequestBody QuartzRequest quartzRequest){
        BaseResponse<Boolean> response = new BaseResponse<>();
        System.out.print(quartzRequest.getTriggerGroupName());
        Class jobClass = null;
        if ("QuartzJob".equals(quartzRequest.getTriggerName())) {
            jobClass = QuartzJob.class;
        } else if ("QuartzJobTwo".equals(quartzRequest.getTriggerName())) {
            jobClass = QuartzJobTwo.class;
        }
        Boolean b = quartzTool.AddQuartz(quartzRequest.getTriggerName(),
                quartzRequest.getTriggerGroupName(), jobClass, quartzRequest.getCron());
        response.setResponseData(b);
        return  response;
    }

    @RequestMapping(value ="/modifyQuartz",method = RequestMethod.POST)
    @ResponseBody
    public BaseResponse<Boolean> modifyQuartz(@RequestBody QuartzRequest quartzRequest){
        BaseResponse<Boolean> response = new BaseResponse<>();
        Boolean b = quartzTool.modifyQuartz(quartzRequest.getTriggerName(), quartzRequest.getTriggerGroupName(), quartzRequest.getCron());
        response.setResponseData(b);
        return  response;
    }

    @RequestMapping(value ="/removeQuartz",method = RequestMethod.POST)
    @ResponseBody
    public BaseResponse<Boolean> removeQuartz(@RequestBody QuartzRequest quartzRequest){
        BaseResponse<Boolean> response = new BaseResponse<>();
        Boolean b = quartzTool.removeQuartz(quartzRequest.getTriggerName(), quartzRequest.getTriggerGroupName());
        response.setResponseData(b);
        return  response;
    }
}

```

# 测试
### 新增

添加  QuartzJob
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631502.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631442.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)
添加  QuartzJobTwo
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631563.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631434.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)
## 修改


修改 QuartzJobTwo 定时时间

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631560.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631558.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)

### 移除
移除 QuartzJobTwo 
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631561.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200826112631436.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3dlaXhpbl80MjQyOTIyMA==,size_16,color_FFFFFF,t_70#pic_center)

# 资料
cron 参数可参考 [cron 参数在线生成](https://www.matools.com/cron/)
