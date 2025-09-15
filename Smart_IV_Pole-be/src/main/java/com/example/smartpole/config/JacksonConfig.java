package com.example.smartpole.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.hibernate6.Hibernate6Module;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class JacksonConfig {

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();

        // Hibernate module to handle lazy loading
        Hibernate6Module hibernate6Module = new Hibernate6Module();
        hibernate6Module.configure(Hibernate6Module.Feature.FORCE_LAZY_LOADING, false);
        hibernate6Module.configure(Hibernate6Module.Feature.SERIALIZE_IDENTIFIER_FOR_LAZY_NOT_LOADED_OBJECTS, true);
        mapper.registerModule(hibernate6Module);

        // Java Time module for LocalDateTime, LocalDate handling
        mapper.registerModule(new JavaTimeModule());

        // Disable timestamp format for dates
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        // Ignore empty beans
        mapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        return mapper;
    }
}