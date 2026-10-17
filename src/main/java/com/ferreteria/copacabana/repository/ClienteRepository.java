package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {
}
