package com.recruitment.applicationservice.repository;

import java.util.List;

import com.recruitment.applicationservice.domain.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    boolean existsByCandidateIdAndJobId(Long candidateId, Long jobId);

    List<JobApplication> findAllByCandidateIdOrderByAppliedAtDesc(Long candidateId);

    List<JobApplication> findAllByJobIdOrderByAppliedAtDesc(Long jobId);
}
