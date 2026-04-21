package com.recruitment.reportingservice.repository;

import java.util.Optional;

import com.recruitment.reportingservice.domain.ReportCache;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportCacheRepository extends JpaRepository<ReportCache, Long> {
    Optional<ReportCache> findByCacheKey(String cacheKey);
}
