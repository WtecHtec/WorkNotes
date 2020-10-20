package org.remonde.saasBack.util;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.Charset;
import java.security.cert.CertificateException;
import java.security.cert.X509Certificate;
import java.util.Map;

import javax.net.ssl.SSLContext;
import javax.servlet.http.HttpServletRequest;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.conn.ssl.NoopHostnameVerifier;
import org.apache.http.entity.ContentType;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.ssl.SSLContexts;
import org.apache.http.ssl.TrustStrategy;
import org.apache.http.util.EntityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import com.alibaba.fastjson.JSONObject;

public class HttpUtil {
	private static final Logger logger = LoggerFactory.getLogger(HttpUtil.class);

	public static String readJSONString(HttpServletRequest request) {
		String method = request.getMethod();
		if (method == "GET") {
			return request.getQueryString();
		} else {
			StringBuffer json = new StringBuffer();
			String line = null;
			try {
				BufferedReader reader = request.getReader();
				while ((line = reader.readLine()) != null) {
					json.append(line);
				}
			} catch (Exception e) {
				System.out.println(e.toString());
			}
			return json.toString();
		}
	}

	public static JSONObject readJSONParam(HttpServletRequest request) {
		String method = request.getMethod();
		if (method == "GET") {
			return JSONObject.parseObject(request.getQueryString());
		} else {
			StringBuffer json = new StringBuffer();
			String line = null;
			try {
				BufferedReader reader = request.getReader();
				while ((line = reader.readLine()) != null) {
					json.append(line);
				}
			} catch (Exception e) {
				System.out.println(e.toString());
			}
			return JSONObject.parseObject(json.toString());
		}
	}

	public static ResponseEntity<String> GetResponseEntity(String result) {
		HttpHeaders responseHeaders = new HttpHeaders();
		MediaType mediaType = new MediaType("text", "html", Charset.forName("UTF-8"));
		responseHeaders.setContentType(mediaType);
		return new ResponseEntity<String>(result, responseHeaders, HttpStatus.OK);
	}

	/**
	 * 获得一个忽略证书的HttpClient
	 * 
	 * @return
	 * @throws Exception
	 */
	public static HttpClient getCertificateValidationIgnoredHttpClient() throws Exception {
		SSLContext sslContext = SSLContexts.custom()
				// 忽略掉对证书的校验
				.loadTrustMaterial(new TrustStrategy() {
					@Override
					public boolean isTrusted(X509Certificate[] chain, String authType) throws CertificateException {
						return true;
					}
				}).build();
		CloseableHttpClient client = HttpClients.custom().setSSLContext(sslContext)
				.setSSLHostnameVerifier(new NoopHostnameVerifier()).build();
		return client;
	}

	public static JSONObject doGetRequest(String requestUrl) {
		JSONObject jsonObject = null;
		StringBuffer buffer = new StringBuffer();
		try {

			URL url = new URL(requestUrl);
			// http协议传输
			HttpURLConnection httpUrlConn = (HttpURLConnection) url.openConnection();

			httpUrlConn.setDoOutput(true);
			httpUrlConn.setDoInput(true);
			httpUrlConn.setUseCaches(false);
			// 设置请求方式（GET/POST）
			httpUrlConn.setRequestMethod("GET");

			httpUrlConn.connect();

			// 将返回的输入流转换成字符串
			InputStream inputStream = httpUrlConn.getInputStream();
			InputStreamReader inputStreamReader = new InputStreamReader(inputStream, "utf-8");
			BufferedReader bufferedReader = new BufferedReader(inputStreamReader);

			String str = null;
			while ((str = bufferedReader.readLine()) != null) {
				buffer.append(str);
			}
			bufferedReader.close();
			inputStreamReader.close();
			// 释放资源
			inputStream.close();
			inputStream = null;
			httpUrlConn.disconnect();
			jsonObject = JSONObject.parseObject(buffer.toString());
		} catch (Exception e) {
			e.printStackTrace();
		}
		return jsonObject;
	}

	/**
	 * post请求
	 * 
	 * @param url
	 * @param json
	 * @return
	 */
	public static JSONObject doPostRequest(String requestUrl, JSONObject json) {
		CloseableHttpClient client = HttpClientBuilder.create().build();
		HttpPost post = new HttpPost(requestUrl);
		JSONObject response = null;
		try {
			// ContentType contentType =
			// ContentType.create(ContentType.DEFAULT_TEXT,Charsets.UTF_8);
			StringEntity s = new StringEntity(json.toString(), ContentType.APPLICATION_JSON);
			s.setContentEncoding("UTF-8");
			s.setContentType("application/json");// 发送json数据需要设置contentType
			post.setEntity(s);
			HttpResponse res = client.execute(post);
			if (res.getStatusLine().getStatusCode() == org.apache.http.HttpStatus.SC_OK) {
				HttpEntity entity = res.getEntity();
				String result = EntityUtils.toString(res.getEntity());// 返回json格式：
				response = JSONObject.parseObject(result);
			}
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
		return response;
	}

	/**
	 * 返回byte[] 字节数据 post 请求
	 * 
	 * @param requestUrl
	 * @param json
	 * @return
	 */
	public static byte[] doPostRequestByte(String requestUrl, JSONObject json) throws Exception {
		DefaultHttpClient client = new DefaultHttpClient();
		HttpPost post = new HttpPost(requestUrl);

		byte[] result = null;
		try {
			logger.info("数据 post 请求");
			// ContentType contentType =
			// ContentType.create(ContentType.DEFAULT_TEXT,Charsets.UTF_8);
			StringEntity s = new StringEntity(json.toString(), ContentType.APPLICATION_JSON);
			s.setContentEncoding("UTF-8");
			s.setContentType("application/json");// 发送json数据需要设置contentType
			post.setEntity(s);
			logger.info("数据 post 请求1");
			HttpResponse res = client.execute(post);
			logger.info("结果：" + res.getStatusLine().getStatusCode());
			logger.info("结果：" + res);
			if (res.getStatusLine().getStatusCode() == org.apache.http.HttpStatus.SC_OK) {
				HttpEntity entity = res.getEntity();
				result = EntityUtils.toByteArray(res.getEntity());// 返回图片二进制格式：
			}
		} catch (Exception e) {
			logger.info("post错误" + e);
			throw new RuntimeException(e);
		}
		logger.info("fanhui", result);
		return result;
	}

}
