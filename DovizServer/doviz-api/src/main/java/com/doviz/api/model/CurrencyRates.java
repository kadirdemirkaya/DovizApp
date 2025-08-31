package com.doviz.api.model;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CurrencyRates {

    private String base; // Örn: "eur"

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate date;

    private Map<String, Double> rates = new HashMap<>();

    @JsonAnySetter
    public void handleDynamic(String key, Object value) {
        if ("date".equals(key)) {
            this.date = LocalDate.parse(value.toString());
        } else {
            // JSON altındaki base currency (örneğin "eur") içindeki tüm kurları map'e koy
            if (value instanceof Map<?, ?> map) {
                map.forEach((k, v) -> rates.put(k.toString(), Double.parseDouble(v.toString())));
                this.base = key; // Dinamik base currency olarak key'i kaydet
            }
        }
    }
}
