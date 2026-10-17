package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.*;
import com.ferreteria.copacabana.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReporteController {
    private final VentaRepository ventas;
    private final CompraRepository compras;
    private final ProductoRepository productos;

    private static boolean enRango(LocalDateTime f, LocalDate d, LocalDate h) {
        if (f == null) return true;
        LocalDate x = f.toLocalDate();
        return (d == null || !x.isBefore(d)) && (h == null || !x.isAfter(h));
    }

    private List<Venta> ventasEn(LocalDate d, LocalDate h) {
        return ventas.findAllByOrderByIdDesc().stream().filter(v -> enRango(v.getFecha(), d, h)).toList();
    }

    private static Map<String, Object> row(Object... kv) {
        Map<String, Object> m = new LinkedHashMap<>();
        for (int i = 0; i < kv.length; i += 2) m.put((String) kv[i], kv[i + 1]);
        return m;
    }

    @GetMapping("/reportes/resumen")
    public Map<String, Object> resumen() {
        return row("totalVentas", ventas.totalVentas(), "cantidadVentas", ventas.count(),
                "totalCompras", compras.totalCompras(), "productos", productos.count(),
                "stockBajo", productos.stockBajo().size());
    }

    @GetMapping("/inventario/alertas")
    public List<Producto> alertas() {
        return productos.stockBajo();
    }

    @GetMapping("/reportes/ventas")
    public List<Map<String, Object>> reporteVentas(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ventasEn(desde, hasta).stream().map(v -> row(
                "id", v.getId(), "fecha", v.getFecha(),
                "cliente", v.getCliente() != null ? v.getCliente().getNombre() : "Mostrador",
                "empleado", v.getEmpleado() != null ? v.getEmpleado().getNombre() : "-",
                "metodoPago", v.getMetodoPago(), "total", v.getTotal())).toList();
    }

    @GetMapping("/reportes/compras")
    public List<Map<String, Object>> reporteCompras(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return compras.findAllByOrderByIdDesc().stream().filter(c -> enRango(c.getFecha(), desde, hasta))
                .map(c -> row("id", c.getId(), "fecha", c.getFecha(),
                        "proveedor", c.getProveedor() != null ? c.getProveedor().getNombre() : "-",
                        "total", c.getTotal())).toList();
    }

    @GetMapping("/reportes/mas-vendidos")
    public List<Map<String, Object>> masVendidos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        Map<String, Integer> cant = new HashMap<>();
        Map<String, BigDecimal> ing = new HashMap<>();
        for (Venta v : ventasEn(desde, hasta))
            for (DetalleVenta d : v.getDetalles()) {
                String n = d.getProducto().getNombre();
                cant.merge(n, d.getCantidad(), Integer::sum);
                ing.merge(n, d.getSubtotal(), BigDecimal::add);
            }
        return cant.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue()).limit(20)
                .map(e -> row("producto", e.getKey(), "cantidad", e.getValue(), "ingresos", ing.get(e.getKey())))
                .toList();
    }

    @GetMapping("/reportes/ventas-por-empleado")
    public List<Map<String, Object>> porEmpleado(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return agrupar(ventasEn(desde, hasta), "empleado");
    }

    @GetMapping("/reportes/ventas-por-metodo")
    public List<Map<String, Object>> porMetodo(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return agrupar(ventasEn(desde, hasta), "metodo");
    }

    private List<Map<String, Object>> agrupar(List<Venta> lista, String por) {
        Map<String, Integer> n = new LinkedHashMap<>();
        Map<String, BigDecimal> t = new LinkedHashMap<>();
        for (Venta v : lista) {
            String k = por.equals("empleado")
                    ? (v.getEmpleado() != null ? v.getEmpleado().getNombre() : "-")
                    : String.valueOf(v.getMetodoPago());
            n.merge(k, 1, Integer::sum);
            t.merge(k, v.getTotal(), BigDecimal::add);
        }
        return n.keySet().stream().map(k -> row("grupo", k, "ventas", n.get(k), "total", t.get(k))).toList();
    }

    @GetMapping("/reportes/inventario")
    public List<Map<String, Object>> inventario() {
        return filasInventario(productos.findAll());
    }

    @GetMapping("/reportes/stock-bajo")
    public List<Map<String, Object>> stockBajo() {
        return filasInventario(productos.stockBajo());
    }

    private List<Map<String, Object>> filasInventario(List<Producto> lista) {
        return lista.stream().map(p -> row(
                "codigo", p.getCodigo(), "producto", p.getNombre(),
                "categoria", p.getCategoria() != null ? p.getCategoria().getNombre() : "-",
                "stock", p.getStock(), "stockMinimo", p.getStockMinimo(), "precioCompra", p.getPrecioCompra(),
                "valor", p.getPrecioCompra().multiply(BigDecimal.valueOf(p.getStock())))).toList();
    }
}