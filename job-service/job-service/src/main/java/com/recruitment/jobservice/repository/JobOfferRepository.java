package com.recruitment.jobservice.repository;

import java.util.List;

import com.recruitment.jobservice.domain.JobOffer;
import com.recruitment.jobservice.domain.JobStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JobOfferRepository extends JpaRepository<JobOffer, Long>, JpaSpecificationExecutor<JobOffer> {
    List<JobOffer> findAllByEmployerIdOrderByPublishedAtDesc(Long employerId);

    long countByStatus(JobStatus status);
}
