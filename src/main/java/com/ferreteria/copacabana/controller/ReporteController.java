package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Producto;
import com.ferreteria.copacabana.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReporteController {
    private final VentaRepository ventas;
    private final CompraRepository compras;
    private final ProductoRepository productos;

    @GetMapping("/reportes/resumen")
    public Map<String, Object> resumen() {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalVentas", ventas.totalVentas());
        m.put("cantidadVentas", ventas.count());
        m.put("totalCompras", compras.totalCompras());
        m.put("productos", productos.count());
        m.put("stockBajo", productos.stockBajo().size());
        return m;
    }

    @GetMapping("/reportes/mas-vendidos")
    public List<Map<String, Object>> masVendidos() {
        return ventas.masVendidos().stream().limit(10)
                .map(r -> Map.<String, Object>of("producto", r[0], "cantidad", r[1]))
                .toList();
    }

    @GetMapping("/inventario/alertas")
    public List<Producto> alertas() {
        return productos.stockBajo();
    }
}
