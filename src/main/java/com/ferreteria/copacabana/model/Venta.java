package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter @Setter
public class Venta extends BaseEntity {
    private LocalDateTime fecha = LocalDateTime.now();

    @ManyToOne
    private Cliente cliente;

    @ManyToOne
    private Empleado empleado;

    private BigDecimal total = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    private MetodoPago metodoPago;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "venta_id")
    private List<DetalleVenta> detalles = new ArrayList<>();
}
