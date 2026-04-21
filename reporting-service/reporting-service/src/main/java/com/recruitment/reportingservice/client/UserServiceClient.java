package com.recruitment.reportingservice.client;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.recruitment.reportingservice.config.ServiceClientsProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

@Component
@RequiredArgsConstructor
public class UserServiceClient {

    private final WebClient.Builder webClientBuilder;
    private final ServiceClientsProperties serviceClientsProperties;

    public UserStatisticsSnapshot getStatistics() {
        return webClientBuilder.build()
                .get()
                .uri(serviceClientsProperties.userServiceUrl() + "/api/users/internal/stats")
                .retrieve()
                .bodyToMono(UserStatisticsSnapshot.class)
                .block();
    }

    public EmployerSnapshot getEmployer(Long employerId) {
        return webClientBuilder.build()
                .get()
                .uri(serviceClientsProperties.userServiceUrl() + "/api/users/internal/employers/{id}", employerId)
                .retrieve()
                .bodyToMono(EmployerSnapshot.class)
                .block();
    }

    public List<UserSummarySnapshot> getUsers() {
        return webClientBuilder.build()
                .get()
                .uri(serviceClientsProperties.userServiceUrl() + "/api/users/internal/users")
                .retrieve()
                .bodyToFlux(UserSummarySnapshot.class)
                .collectList()
                .block();
    }

    public record UserStatisticsSnapshot(
            long totalUsers,
            long totalCandidates,
            long totalEmployers,
            Map<String, Long> registrationsByDate
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

    public record UserSummarySnapshot(
            Long id,
            String email,
            String firstName,
            String lastName,
            String role,
            LocalDateTime createdAt
    ) {
    }
}
