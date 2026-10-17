package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.Empleado;
import com.ferreteria.copacabana.repository.EmpleadoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/** Solo accesible para ADMIN (ver SecurityConfig). */
@RestController
@RequestMapping("/api/empleados")
@RequiredArgsConstructor
public class EmpleadoController {
    private final EmpleadoRepository repo;
    private final PasswordEncoder encoder;

    @GetMapping
    public List<Empleado> all() {
        return repo.findAll();
    }

    @PostMapping
    public Empleado create(@RequestBody Empleado e) {
        if (e.getPassword() == null || e.getPassword().isBlank())
            throw new IllegalArgumentException("La contraseña es obligatoria");
        e.setId(null);
        e.setUsuario(e.getUsuario().trim());
        e.setPassword(encoder.encode(e.getPassword()));
        return repo.save(e);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Empleado> update(@PathVariable Long id, @RequestBody Empleado e) {
        return repo.findById(id).map(old -> {
            old.setNombre(e.getNombre());
            old.setUsuario(e.getUsuario().trim());
            old.setRol(e.getRol());
            old.setActivo(e.isActivo());
            if (e.getPassword() != null && !e.getPassword().isBlank())
                old.setPassword(encoder.encode(e.getPassword()));
            return ResponseEntity.ok(repo.save(old));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
