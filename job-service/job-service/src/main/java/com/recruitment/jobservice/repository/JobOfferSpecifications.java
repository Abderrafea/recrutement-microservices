package com.recruitment.jobservice.repository;

import com.recruitment.jobservice.domain.ContractType;
import com.recruitment.jobservice.domain.ExperienceLevel;
import com.recruitment.jobservice.domain.JobOffer;
import com.recruitment.jobservice.domain.JobStatus;
import org.springframework.data.jpa.domain.Specification;

public final class JobOfferSpecifications {

    private JobOfferSpecifications() {
    }

    public static Specification<JobOffer> withFilters(String query,
                                                      String location,
                                                      ContractType contractType,
                                                      ExperienceLevel experienceLevel,
                                                      JobStatus status) {
        return Specification.where(matchesQuery(query))
                .and(matchesLocation(location))
                .and(matchesContractType(contractType))
                .and(matchesExperienceLevel(experienceLevel))
                .and(matchesStatus(status));
    }

    private static Specification<JobOffer> matchesQuery(String query) {
        if (query == null || query.isBlank()) {
            return Specification.where(null);
        }
        String like = "%" + query.trim().toLowerCase() + "%";
        return (root, ignoredQuery, cb) -> cb.or(
                cb.like(cb.lower(root.get("title")), like),
                cb.like(cb.lower(root.get("description")), like));
    }

    private static Specification<JobOffer> matchesLocation(String location) {
        if (location == null || location.isBlank()) {
            return Specification.where(null);
        }
        String like = "%" + location.trim().toLowerCase() + "%";
        return (root, ignoredQuery, cb) -> cb.like(cb.lower(root.get("location")), like);
    }

    private static Specification<JobOffer> matchesContractType(ContractType contractType) {
        return contractType == null ? Specification.where(null) : (root, ignoredQuery, cb) -> cb.equal(root.get("contractType"), contractType);
    }

    private static Specification<JobOffer> matchesExperienceLevel(ExperienceLevel experienceLevel) {
        return experienceLevel == null ? Specification.where(null) : (root, ignoredQuery, cb) -> cb.equal(root.get("experienceLevel"), experienceLevel);
    }

    private static Specification<JobOffer> matchesStatus(JobStatus status) {
        return status == null ? Specification.where(null) : (root, ignoredQuery, cb) -> cb.equal(root.get("status"), status);
    }
}
