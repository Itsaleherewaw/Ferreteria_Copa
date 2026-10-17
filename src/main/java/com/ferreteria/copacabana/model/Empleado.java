package com.ferreteria.copacabana.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter @Setter
public class Empleado extends BaseEntity {
    private String nombre;

    @Column(unique = true, nullable = false)
    private String usuario;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Enumerated(EnumType.STRING)
    private Rol rol = Rol.EMPLEADO;

    private boolean activo = true;
}
