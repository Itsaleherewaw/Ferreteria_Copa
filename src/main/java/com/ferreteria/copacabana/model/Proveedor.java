package com.ferreteria.copacabana.model;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Proveedor extends BaseEntity {
    private String nombre;
    private String telefono;
    private String email;
    private String direccion;
}
