package org.egov.service;

import java.util.LinkedHashMap;

import org.egov.utils.JsonPathConstant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.jayway.jsonpath.DocumentContext;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class SignOutService {

	@Autowired
	private RestTemplate restTemplate;

	@Value("${egov.coexistence.hostname}")
	private String coexistencehost;

	@Value("${egov.coexistence.singout.uri}")
	private String coexistencelogoutUri;

	public void callFinanceForSignOut(DocumentContext documentContext) {
		log.info("Inside callFinanceForSignOut()");
		ResponseEntity<?> response = null;
		String accessToken = documentContext.read(JsonPathConstant.signOutAccessToken);
		documentContext = documentContext.delete(JsonPathConstant.userInfo);
		documentContext = documentContext.put(JsonPathConstant.requestInfo, "authToken", accessToken);
		LinkedHashMap<String, Object> jsonRequest = documentContext.read(JsonPathConstant.request);
		
		log.info("accessToken: "+accessToken);
		log.info("finance logout uri: "+coexistencehost + coexistencelogoutUri);

		response = restTemplate.exchange(coexistencehost + coexistencelogoutUri, HttpMethod.POST,
				new HttpEntity<>(jsonRequest), ResponseEntity.class);
		log.info("SignOutService response :" + response.getStatusCode());
	}

}
