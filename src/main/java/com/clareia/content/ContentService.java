package com.clareia.content;

import com.clareia.content.ContentModels.CheckItem;
import com.clareia.content.ContentModels.HuntMessage;
import com.clareia.content.ContentModels.MethodStep;
import com.clareia.content.ContentModels.QuizItem;
import com.clareia.content.ContentModels.SimCase;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Fonte de todo o conteudo educativo do Clareia.
 * Os dados foram portados do prototipo original (single-file) para um recurso
 * JSON (content/content.json), de onde o frontend passa a consumi-los por REST.
 * Todos os casos sao ficticios e criados para ensinar.
 */
@Service
public class ContentService {

    /** Estrutura do arquivo content.json. */
    public record ContentBundle(
            List<MethodStep> method,
            List<SimCase> cases,
            List<HuntMessage> hunts,
            List<CheckItem> checklist,
            List<QuizItem> deepfakeQuiz
    ) {}

    private final ObjectMapper objectMapper;
    private ContentBundle bundle;

    public ContentService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void load() throws IOException {
        try (InputStream in = new ClassPathResource("content/content.json").getInputStream()) {
            this.bundle = objectMapper.readValue(in, ContentBundle.class);
        }
    }

    public List<MethodStep> getMethod() { return bundle.method(); }
    public List<SimCase> getCases() { return bundle.cases(); }
    public List<HuntMessage> getHunts() { return bundle.hunts(); }
    public List<CheckItem> getChecklist() { return bundle.checklist(); }
    public List<QuizItem> getDeepfakeQuiz() { return bundle.deepfakeQuiz(); }
}
