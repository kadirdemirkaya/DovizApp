package com.doviz.api.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExchangeRate {
    private String base;
    private String target;
    private BigDecimal rate;
    private LocalDate date;
    private Long timestamp;
}