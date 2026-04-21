package com.recruitment.applicationservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "services")
public record ServiceClientsProperties(
        String jobServiceUrl,
        String userServiceUrl
) {
}
