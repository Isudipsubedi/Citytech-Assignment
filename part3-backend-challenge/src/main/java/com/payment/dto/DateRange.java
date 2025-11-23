package com.payment.dto;

import io.micronaut.serde.annotation.Serdeable;

import java.time.Instant;

/**
 * DTO for date range
 */
@Serdeable
public class DateRange {

    private Instant start;
    private Instant end;

    // Constructors
    public DateRange() {
    }

    public DateRange(Instant start, Instant end) {
        this.start = start;
        this.end = end;
    }

    // Getters and Setters
    public Instant getStart() {
        return start;
    }

    public void setStart(Instant start) {
        this.start = start;
    }

    public Instant getEnd() {
        return end;
    }

    public void setEnd(Instant end) {
        this.end = end;
    }
}

