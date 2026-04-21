package com.recruitment.reportingservice.mapper;

import com.recruitment.reportingservice.client.JobServiceClient;
import com.recruitment.reportingservice.dto.JobPerformanceDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ReportingMapper {

    default JobPerformanceDto toJobPerformance(JobServiceClient.JobSnapshot jobSnapshot, long applications) {
        return new JobPerformanceDto(jobSnapshot.id(), jobSnapshot.title(), applications, jobSnapshot.status());
    }
}
