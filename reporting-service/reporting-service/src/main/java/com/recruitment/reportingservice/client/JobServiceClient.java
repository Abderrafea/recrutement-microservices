package com.recruitment.reportingservice.client;

import java.time.LocalDateTime;
import java.util.List;

import com.recruitment.reportingservice.config.ServiceClientsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class JobServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceClientsProperties serviceClientsProperties;

    public List<JobSnapshot> getAllJobs(Long employerId) {
        WebClient client = webClientBuilder.build();
        if (employerId == null) {
            return client.get()
                    .uri(serviceClientsProperties.jobServiceUrl() + "/api/jobs/internal/all")
                    .retrieve()
                    .bodyToFlux(JobSnapshot.class)
                    .collectList()
                    .block();
        }
        return client.get()
                .uri(uriBuilder -> uriBuilder
                        .path(serviceClientsProperties.jobServiceUrl() + "/api/jobs/internal/all")
                        .queryParam("employerId", employerId)
                        .build())
                .retrieve()
                .bodyToFlux(JobSnapshot.class)
                .collectList()
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
            List<String> requiredSkills,
            Long employerId,
            String status,
            LocalDateTime publishedAt,
            LocalDateTime expiresAt,
            int applicationCount
    ) {
    }
}
