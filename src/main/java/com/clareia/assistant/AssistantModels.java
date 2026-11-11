package com.clareia.assistant;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public final class AssistantModels {

    private AssistantModels() {}

    /** Texto colado pelo usuario para a analise de sinais. */
    public record AnalyzeRequest(
            @NotBlank(message = "Cole um texto para analisar")
            @Size(min = 12, message = "Cole um texto um pouco maior")
            String text
    ) {}

    /** Um sinal encontrado no texto. type: "alerta" | "atencao" | "confianca". */
    public record SignalHit(String excerpt, String type, String explanation) {}

    /**
     * Resultado da analise. Nunca contem veredito (verdadeiro/falso): apenas
     * sinais observaveis, perguntas de verificacao e passos do metodo CLAREIA.
     */
    public record AnalysisResult(
            List<SignalHit> signals,
            List<String> questions,
            List<String> steps,
            String disclaimer
    ) {}
}
