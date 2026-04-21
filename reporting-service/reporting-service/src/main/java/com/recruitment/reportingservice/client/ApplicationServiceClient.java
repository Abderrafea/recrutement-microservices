package com.recruitment.reportingservice.client;

import java.time.LocalDateTime;
import java.util.List;

import com.recruitment.reportingservice.config.ServiceClientsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class ApplicationServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceClientsProperties serviceClientsProperties;

    public List<ApplicationSnapshot> getAllApplications() {
        return webClientBuilder.build()
                .get()
                .uri(serviceClientsProperties.applicationServiceUrl() + "/api/applications/internal/all")
                .retrieve()
                .bodyToFlux(ApplicationSnapshot.class)
                .collectList()
                .block();
    }

    public record ApplicationSnapshot(
            Long id,
            Long candidateId,
            String candidateName,
            String candidateEmail,
            String candidateCvUrl,
            Long jobId,
            String jobTitle,
            String company,
            String coverLetter,
            String status,
            LocalDateTime appliedAt,
            LocalDateTime updatedAt,
            String employerNote
    ) {
    }
}
