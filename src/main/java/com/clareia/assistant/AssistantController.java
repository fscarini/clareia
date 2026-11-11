package com.clareia.assistant;

import com.clareia.assistant.AssistantModels.AnalysisResult;
import com.clareia.assistant.AssistantModels.AnalyzeRequest;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Assistente de sinais: recebe um texto e devolve sinais, perguntas e passos.
 * Nunca devolve veredito sobre o conteudo.
 */
@RestController
@RequestMapping("/api/assistant")
public class AssistantController {

    private final SignalAnalyzer analyzer;

    public AssistantController(SignalAnalyzer analyzer) {
        this.analyzer = analyzer;
    }

    @PostMapping("/signals")
    public AnalysisResult signals(@Valid @RequestBody AnalyzeRequest request) {
        return analyzer.analyze(request.text());
    }
}
