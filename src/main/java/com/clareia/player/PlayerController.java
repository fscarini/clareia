package com.clareia.player;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Jogadores anonimos e sua pontuacao de pratica.
 */
@RestController
@RequestMapping("/api/players")
public class PlayerController {

    /** Representacao publica de um jogador. */
    public record PlayerDto(String id, int xp) {
        static PlayerDto of(Player p) {
            return new PlayerDto(p.getId(), p.getXp());
        }
    }

    /** Pedido para creditar pontos de uma atividade concluida. */
    public record ScoreRequest(@NotBlank String activityKey, int points) {}

    private final PlayerService service;

    public PlayerController(PlayerService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlayerDto create() {
        return PlayerDto.of(service.create());
    }

    @GetMapping("/{id}")
    public PlayerDto get(@PathVariable String id) {
        return PlayerDto.of(service.get(id));
    }

    @PostMapping("/{id}/score")
    public PlayerDto score(@PathVariable String id, @Valid @RequestBody ScoreRequest body) {
        return PlayerDto.of(service.award(id, body.activityKey(), body.points()));
    }
}
