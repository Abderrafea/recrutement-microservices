package com.recruitment.notificationservice.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(MessagingProperties.class)
public class RabbitConfig {

    @Bean
    TopicExchange recruitmentExchange(MessagingProperties properties) {
        return new TopicExchange(properties.exchange());
    }

    @Bean
    Queue applicationCreatedQueue(MessagingProperties properties) {
        return new Queue(properties.queues().applicationCreated(), true);
    }

    @Bean
    Queue applicationStatusQueue(MessagingProperties properties) {
        return new Queue(properties.queues().applicationStatus(), true);
    }

    @Bean
    Queue interviewReminderQueue(MessagingProperties properties) {
        return new Queue(properties.queues().interviewReminder(), true);
    }

    @Bean
    Binding applicationCreatedBinding(Queue applicationCreatedQueue,
                                      TopicExchange recruitmentExchange,
                                      MessagingProperties properties) {
        return BindingBuilder.bind(applicationCreatedQueue)
                .to(recruitmentExchange)
                .with(properties.routingKeys().applicationCreated());
    }

    @Bean
    Binding applicationStatusBinding(Queue applicationStatusQueue,
                                     TopicExchange recruitmentExchange,
                                     MessagingProperties properties) {
        return BindingBuilder.bind(applicationStatusQueue)
                .to(recruitmentExchange)
                .with(properties.routingKeys().applicationStatusChanged());
    }

    @Bean
    Binding interviewReminderBinding(Queue interviewReminderQueue,
                                     TopicExchange recruitmentExchange,
                                     MessagingProperties properties) {
        return BindingBuilder.bind(interviewReminderQueue)
                .to(recruitmentExchange)
                .with(properties.routingKeys().interviewReminder());
    }

    @Bean
    MessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
}
