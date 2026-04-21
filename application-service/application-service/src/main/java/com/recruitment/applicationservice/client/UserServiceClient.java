package com.recruitment.applicationservice.client;

import com.recruitment.applicationservice.config.ServiceClientsProperties;
import com.recruitment.applicationservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceClientsProperties serviceClientsProperties;

    public CandidateSnapshot getCandidate(Long candidateId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(serviceClientsProperties.userServiceUrl() + "/api/users/internal/candidates/{id}", candidateId)
                    .retrieve()
                    .bodyToMono(CandidateSnapshot.class)
                    .block();
        } catch (WebClientResponseException.NotFound exception) {
            throw new ResourceNotFoundException("Candidate with id " + candidateId + " not found");
        }
    }

    public EmployerSnapshot getEmployer(Long employerId) {
        try {
            return webClientBuilder.build()
                    .get()
                    .uri(serviceClientsProperties.userServiceUrl() + "/api/users/internal/employers/{id}", employerId)
                    .retrieve()
                    .bodyToMono(EmployerSnapshot.class)
                    .block();
        } catch (WebClientResponseException.NotFound exception) {
            throw new ResourceNotFoundException("Employer with id " + employerId + " not found");
        }
    }

    public record CandidateSnapshot(
            Long userId,
            String email,
            String firstName,
            String lastName,
            String fullName,
            String cvUrl
    ) {
    }

    public record EmployerSnapshot(
            Long employerId,
            String email,
            String firstName,
            String lastName,
            String companyName,
            String companyDescription,
            String website,
            String industry
    ) {
    }
}
