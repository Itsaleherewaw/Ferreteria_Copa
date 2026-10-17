package com.ferreteria.copacabana.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Getter @Setter
public class Producto extends BaseEntity {
    private String codigo;
    private String nombre;

    @ManyToOne
    private Categoria categoria;

    @ManyToOne
    private Proveedor proveedor;

    private BigDecimal precioCompra = BigDecimal.ZERO;
    private BigDecimal precioVenta = BigDecimal.ZERO;
    private int stock;
    private int stockMinimo;
}
