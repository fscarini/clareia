package com.clareia.content;

import java.util.List;

/**
 * Modelos (DTOs) do conteudo educativo servido ao frontend.
 * Todos os casos sao ficticios e criados para ensinar.
 */
public final class ContentModels {

    private ContentModels() {}

    /** Um passo do metodo CLAREIA. */
    public record MethodStep(String letter, String title, String description) {}

    /** Sinal exibido na analise de um caso. type: "a" alerta, "t" confianca, "c" atencao. */
    public record Signal(String type, String text) {}

    /** Caso do simulador "Voce compartilharia?". truth: "fab" | "ctx" | "real". */
    public record SimCase(
            int id,
            String kind,
            String who,
            String where,
            String avatar,
            String headline,
            String media,
            String truth,
            List<Signal> signals,
            List<Integer> steps,
            String note
    ) {}

    /** Trecho da mensagem do Caca-pistas. clue=true quando e um sinal a ser encontrado. */
    public record HuntSegment(String text, boolean clue, String explanation) {}

    /** Mensagem do jogo Caca-pistas. */
    public record HuntMessage(
            int id,
            String who,
            String where,
            String avatar,
            String kind,
            List<HuntSegment> segments
    ) {}

    /** Item da lista de Sinais de confiabilidade. good=true quando "sim" e o sinal de confianca. */
    public record CheckItem(int id, String question, boolean good) {}

    /** Questao do quiz de deepfakes. */
    public record QuizItem(int id, String question, List<String> options, int correct, String explanation) {}
}
