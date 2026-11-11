package com.clareia.player;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CompletionRepository extends JpaRepository<Completion, Long> {
    boolean existsByPlayerIdAndActivityKey(String playerId, String activityKey);
}
