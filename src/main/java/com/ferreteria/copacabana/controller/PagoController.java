package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Pago;
import com.ferreteria.copacabana.repository.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoController {
    private final PagoRepository repo;

    @GetMapping
    public List<Pago> all() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }
}
