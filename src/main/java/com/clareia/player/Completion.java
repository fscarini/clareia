package com.clareia.player;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

/**
 * Registro de que um jogador ja concluiu uma atividade (chave).
 * Garante que os pontos de cada atividade sejam creditados uma unica vez.
 */
@Entity
@Table(name = "completion",
        uniqueConstraints = @UniqueConstraint(columnNames = {"player_id", "activity_key"}))
public class Completion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "player_id", nullable = false)
    private String playerId;

    @Column(name = "activity_key", nullable = false)
    private String activityKey;

    protected Completion() {}

    public Completion(String playerId, String activityKey) {
        this.playerId = playerId;
        this.activityKey = activityKey;
    }

    public Long getId() { return id; }
    public String getPlayerId() { return playerId; }
    public String getActivityKey() { return activityKey; }
}
