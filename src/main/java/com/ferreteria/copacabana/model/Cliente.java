package com.ferreteria.copacabana.model;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Cliente extends BaseEntity {
    private String nombre;
    private String ciNit;
    private String telefono;
    private String direccion;
}
