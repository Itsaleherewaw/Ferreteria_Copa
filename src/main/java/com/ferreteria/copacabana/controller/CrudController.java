package com.ferreteria.copacabana.controller;

import com.ferreteria.copacabana.model.BaseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

public abstract class CrudController<T extends BaseEntity> {

    protected abstract JpaRepository<T, Long> repo();

    @GetMapping
    public List<T> all() {
        return repo().findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<T> one(@PathVariable Long id) {
        return repo().findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public T create(@RequestBody T t) {
        t.setId(null);
        return repo().save(t);
    }

    @PutMapping("/{id}")
    public ResponseEntity<T> update(@PathVariable Long id, @RequestBody T t) {
        if (!repo().existsById(id)) return ResponseEntity.notFound().build();
        t.setId(id);
        return ResponseEntity.ok(repo().save(t));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        repo().deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
