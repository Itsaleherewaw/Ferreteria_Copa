package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Getter @Setter
public class DetalleCompra extends BaseEntity {
    @ManyToOne
    private Producto producto;
    private int cantidad;
    private BigDecimal costoUnitario;
    private BigDecimal subtotal;
}
