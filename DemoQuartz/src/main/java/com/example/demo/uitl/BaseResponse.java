package com.example.demo.uitl;

/**
 * Response 基础类
 * 
 * @author HJR UPDATRE DATE 2017/12/11
 * @param <T>
 */
public class BaseResponse<T> {
	/**
	 * 业务操作成功
	 */
	private static final Integer RESPONSE_STATUS_CODE_SUCCESS = 200;

	/**
	 * 业务操作成功消息
	 */
	private static final String RESPONSE_STATUS_MSG_SUCCESS = "success";
	private Integer statusCode;
	private String statusMsg;
	private T responseData;

	public BaseResponse() {
		this.statusCode = RESPONSE_STATUS_CODE_SUCCESS;
		this.statusMsg = RESPONSE_STATUS_MSG_SUCCESS;
	}

	public Integer getStatusCode() {
		return statusCode;
	}

	public void setStatusCode(Integer statusCode) {
		this.statusCode = statusCode;
	}

	public String getStatusMsg() {
		return statusMsg;
	}

	public void setStatusMsg(String statusMsg) {
		this.statusMsg = statusMsg;
	}

	public T getResponseData() {
		return responseData;
	}

	public void setResponseData(T responseData) {
		this.responseData = responseData;
	}
}
