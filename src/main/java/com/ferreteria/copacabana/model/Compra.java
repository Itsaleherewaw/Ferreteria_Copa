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
public class Compra extends BaseEntity {
    private LocalDateTime fecha = LocalDateTime.now();

    @ManyToOne
    private Proveedor proveedor;

    private BigDecimal total = BigDecimal.ZERO;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "compra_id")
    private List<DetalleCompra> detalles = new ArrayList<>();
}
