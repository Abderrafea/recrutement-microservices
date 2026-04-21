package com.recruitment.jobservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "services")
public record ServiceClientsProperties(String userServiceUrl) {
}
