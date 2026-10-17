package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Empleado;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmpleadoRepository extends JpaRepository<Empleado, Long> {
    Optional<Empleado> findByUsuario(String usuario);
}
