package com.recruitment.notificationservice.service;

import com.recruitment.notificationservice.dto.event.ApplicationCreatedEvent;
import com.recruitment.notificationservice.dto.event.ApplicationStatusChangedEvent;
import com.recruitment.notificationservice.mapper.NotificationEventMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final EmailNotificationService emailNotificationService;
    private final NotificationEventMapper notificationEventMapper;

    @RabbitListener(queues = "#{applicationCreatedQueue.name}")
    public void onApplicationCreated(ApplicationCreatedEvent event) {
        emailNotificationService.sendHtmlEmail(
                event.candidateEmail(),
                "Application received for " + event.jobTitle(),
                "application-received",
                notificationEventMapper.toCandidateReceivedModel(event));

        emailNotificationService.sendHtmlEmail(
                event.employerEmail(),
                "New application for " + event.jobTitle(),
                "new-application",
                notificationEventMapper.toEmployerNewApplicationModel(event));
    }

    @RabbitListener(queues = "#{applicationStatusQueue.name}")
    public void onApplicationStatusChanged(ApplicationStatusChangedEvent event) {
        if ("INTERVIEW".equalsIgnoreCase(event.newStatus())) {
            return;
        }
        emailNotificationService.sendHtmlEmail(
                event.candidateEmail(),
                "Application status updated to " + event.newStatus(),
                "application-status-changed",
                notificationEventMapper.toStatusChangedModel(event));
    }

    @RabbitListener(queues = "#{interviewReminderQueue.name}")
    public void onInterviewReminder(ApplicationStatusChangedEvent event) {
        emailNotificationService.sendHtmlEmail(
                event.candidateEmail(),
                "Interview invitation for " + event.jobTitle(),
                "interview-invitation",
                notificationEventMapper.toInterviewInvitationModel(event));
    }
}
