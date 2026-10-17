package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class Pago extends BaseEntity {
    private Long ventaId;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodo;

    private BigDecimal monto;
    private LocalDateTime fecha = LocalDateTime.now();
}
