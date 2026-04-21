package com.recruitment.applicationservice.service;

import com.recruitment.applicationservice.config.MessagingProperties;
import com.recruitment.applicationservice.dto.event.ApplicationCreatedEvent;
import com.recruitment.applicationservice.dto.event.ApplicationStatusChangedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ApplicationEventPublisher {

    private final RabbitTemplate rabbitTemplate;
    private final MessagingProperties messagingProperties;

    public void publishCreated(ApplicationCreatedEvent event) {
        rabbitTemplate.convertAndSend(
                messagingProperties.exchange(),
                messagingProperties.routingKeys().applicationCreated(),
                event);
    }

    public void publishStatusChanged(ApplicationStatusChangedEvent event) {
        rabbitTemplate.convertAndSend(
                messagingProperties.exchange(),
                messagingProperties.routingKeys().applicationStatusChanged(),
                event);
    }

    public void publishInterviewReminder(ApplicationStatusChangedEvent event) {
        rabbitTemplate.convertAndSend(
                messagingProperties.exchange(),
                messagingProperties.routingKeys().interviewReminder(),
                event);
    }
}
