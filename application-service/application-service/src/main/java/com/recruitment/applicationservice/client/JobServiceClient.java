package com.recruitment.applicationservice.client;

import com.recruitment.applicationservice.config.ServiceClientsProperties;
import com.recruitment.applicationservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
@RequiredArgsConstructor
public class JobServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceClientsProperties serviceClientsProperties;

    public JobSnapshot getJob(Long jobId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(serviceClientsProperties.jobServiceUrl() + "/api/jobs/internal/{id}", jobId)
                    .retrieve()
                    .bodyToMono(JobSnapshot.class)
                    .block();
        } catch (WebClientResponseException.NotFound exception) {
            throw new ResourceNotFoundException("Job offer with id " + jobId + " not found");
        }
    }

    public void adjustApplicationCount(Long jobId, int delta) {
        webClientBuilder.build()
                .patch()
                .uri(serviceClientsProperties.jobServiceUrl() + "/api/jobs/internal/{id}/application-count?delta={delta}",
                        jobId,
                        delta)
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    public record JobSnapshot(
            Long id,
            String title,
            String description,
            String company,
            String location,
            String contractType,
            String salary,
            String experienceLevel,
            java.util.List<String> requiredSkills,
            Long employerId,
            String status,
            java.time.LocalDateTime publishedAt,
            java.time.LocalDateTime expiresAt,
            int applicationCount
    ) {
    }
}
