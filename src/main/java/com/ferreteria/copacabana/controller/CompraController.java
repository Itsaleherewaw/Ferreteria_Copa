package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Compra;
import com.ferreteria.copacabana.repository.CompraRepository;
import com.ferreteria.copacabana.service.CompraService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {
    private final CompraRepository repo;
    private final CompraService service;

    @GetMapping
    public List<Compra> all() {
        return repo.findAllByOrderByIdDesc();
    }

    @PostMapping
    public Compra create(@RequestBody CompraService.Req req) {
        return service.crear(req);
    }
}
