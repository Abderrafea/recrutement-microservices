package com.recruitment.applicationservice.mapper;

import com.recruitment.applicationservice.domain.JobApplication;
import com.recruitment.applicationservice.dto.ApplicationResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ApplicationMapper {

    default ApplicationResponse toResponse(JobApplication application,
                                           String candidateName,
                                           String candidateEmail,
                                           String candidateCvUrl,
                                           String jobTitle,
                                           String company,
                                           String cvFileName) {
        return new ApplicationResponse(
                application.getId(),
                application.getCandidateId(),
                candidateName,
                candidateEmail,
                candidateCvUrl,
                application.getJobId(),
                jobTitle,
                company,
                application.getCoverLetter(),
                application.getStatus(),
                application.getAppliedAt(),
                application.getUpdatedAt(),
                application.getEmployerNote(),
                cvFileName);
    }
}
