package com.recruitment.reportingservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "services")
public record ServiceClientsProperties(
        String userServiceUrl,
        String jobServiceUrl,
        String applicationServiceUrl
) {
}
