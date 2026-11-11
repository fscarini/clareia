package com.clareia.player;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/**
 * Um "jogador" anonimo. Guarda apenas a pontuacao de pratica (XP).
 * Sem cadastro e sem dados pessoais, em linha com o compromisso de privacidade do Clareia.
 */
@Entity
@Table(name = "player")
public class Player {

    @Id
    private String id;

    @Column(nullable = false)
    private int xp;

    @Column(nullable = false)
    private Instant createdAt;

    protected Player() {}

    public Player(String id) {
        this.id = id;
        this.xp = 0;
        this.createdAt = Instant.now();
    }

    public void addXp(int points) {
        this.xp = Math.max(0, this.xp + points);
    }

    public String getId() { return id; }
    public int getXp() { return xp; }
    public Instant getCreatedAt() { return createdAt; }
}
