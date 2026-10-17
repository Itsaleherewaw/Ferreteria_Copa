package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Venta;
import com.ferreteria.copacabana.repository.VentaRepository;
import com.ferreteria.copacabana.service.VentaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {
    private final VentaRepository repo;
    private final VentaService service;

    @GetMapping
    public List<Venta> all() {
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public Venta create(@RequestBody VentaService.Req req, Authentication auth) {
        return service.crear(req, auth.getName());
    }
}
