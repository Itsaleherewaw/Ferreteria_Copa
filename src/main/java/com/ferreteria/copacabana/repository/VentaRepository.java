package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.math.BigDecimal;
import java.util.List;

public interface VentaRepository extends JpaRepository<Venta, Long> {
    List<Venta> findAllByOrderByIdDesc();

    @Query("select coalesce(sum(v.total), 0) from Venta v")
    BigDecimal totalVentas();

    @Query("select d.producto.nombre, sum(d.cantidad) from Venta v join v.detalles d "
         + "group by d.producto.nombre order by sum(d.cantidad) desc")
    List<Object[]> masVendidos();
}
