package com.recruitment.applicationservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "messaging.recruitment")
public record MessagingProperties(
        String exchange,
        RoutingKeys routingKeys
) {
    public record RoutingKeys(
            String applicationCreated,
            String applicationStatusChanged,
            String interviewReminder
    ) {
    }
}
