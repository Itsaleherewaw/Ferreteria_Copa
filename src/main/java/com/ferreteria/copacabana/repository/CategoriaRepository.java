package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
