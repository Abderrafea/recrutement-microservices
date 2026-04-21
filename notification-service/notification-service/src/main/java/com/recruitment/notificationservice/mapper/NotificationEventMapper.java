package com.recruitment.notificationservice.mapper;

import java.util.Map;

import com.recruitment.notificationservice.dto.event.ApplicationCreatedEvent;
import com.recruitment.notificationservice.dto.event.ApplicationStatusChangedEvent;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NotificationEventMapper {

    default Map<String, Object> toCandidateReceivedModel(ApplicationCreatedEvent event) {
        return Map.of(
                "candidateName", event.candidateName(),
                "jobTitle", event.jobTitle(),
                "company", event.employerCompany());
    }

    default Map<String, Object> toEmployerNewApplicationModel(ApplicationCreatedEvent event) {
        return Map.of(
                "candidateName", event.candidateName(),
                "jobTitle", event.jobTitle(),
                "company", event.employerCompany());
    }

    default Map<String, Object> toStatusChangedModel(ApplicationStatusChangedEvent event) {
        return Map.of(
                "jobTitle", event.jobTitle(),
                "status", event.newStatus(),
                "company", event.employerCompany());
    }

    default Map<String, Object> toInterviewInvitationModel(ApplicationStatusChangedEvent event) {
        return Map.of(
                "jobTitle", event.jobTitle(),
                "company", event.employerCompany());
    }
}
