package com.clareia.player;

import com.clareia.common.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PlayerService {

    /** Teto de pontos por atividade, para evitar valores absurdos vindos do cliente. */
    private static final int MAX_POINTS_PER_ACTIVITY = 100;

    private final PlayerRepository players;
    private final CompletionRepository completions;

    public PlayerService(PlayerRepository players, CompletionRepository completions) {
        this.players = players;
        this.completions = completions;
    }

    @Transactional
    public Player create() {
        return players.save(new Player(UUID.randomUUID().toString()));
    }

    @Transactional(readOnly = true)
    public Player get(String id) {
        return players.findById(id)
                .orElseThrow(() -> new NotFoundException("Jogador nao encontrado: " + id));
    }

    /**
     * Credita pontos por uma atividade, de forma idempotente: se a atividade (chave)
     * ja foi concluida por este jogador, nada muda. Retorna o jogador atualizado.
     */
    @Transactional
    public Player award(String playerId, String activityKey, int points) {
        Player player = get(playerId);
        if (activityKey == null || activityKey.isBlank()) {
            return player;
        }
        if (completions.existsByPlayerIdAndActivityKey(playerId, activityKey)) {
            return player;
        }
        int clamped = Math.max(0, Math.min(points, MAX_POINTS_PER_ACTIVITY));
        completions.save(new Completion(playerId, activityKey));
        player.addXp(clamped);
        return players.save(player);
    }
}
