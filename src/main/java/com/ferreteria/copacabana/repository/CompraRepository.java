package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface CompraRepository extends JpaRepository<Compra, Long> {
    List<Compra> findAllByOrderByIdDesc();

    @Query("select coalesce(sum(c.total), 0) from Compra c")
    BigDecimal totalCompras();
}
