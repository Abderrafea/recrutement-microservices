package com.recruitment.jobservice.mapper;

import com.recruitment.jobservice.domain.JobOffer;
import com.recruitment.jobservice.dto.job.JobOfferDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface JobOfferMapper {
    JobOfferDto toDto(JobOffer jobOffer);
}
