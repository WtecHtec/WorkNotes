package com.example.demo.contronller;


import com.example.demo.jobs.QuartzJob;
import com.example.demo.jobs.QuartzJobTwo;
import com.example.demo.requestparam.QuartzRequest;
import com.example.demo.uitl.BaseResponse;
import com.example.demo.uitl.QuartzTool;
import jdk.nashorn.internal.objects.annotations.Getter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

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
