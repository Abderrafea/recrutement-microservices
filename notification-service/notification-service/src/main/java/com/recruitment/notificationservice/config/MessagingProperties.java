package com.recruitment.notificationservice.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "messaging.recruitment")
public record MessagingProperties(
        String exchange,
        Queues queues,
        RoutingKeys routingKeys
) {
    public record Queues(
            String applicationCreated,
            String applicationStatus,
            String interviewReminder
    ) {
    }

    public record RoutingKeys(
            String applicationCreated,
            String applicationStatusChanged,
            String interviewReminder
    ) {
    }
}
