package com.clareia.content;

import com.clareia.content.ContentModels.CheckItem;
import com.clareia.content.ContentModels.HuntMessage;
import com.clareia.content.ContentModels.MethodStep;
import com.clareia.content.ContentModels.QuizItem;
import com.clareia.content.ContentModels.SimCase;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Expoe o conteudo educativo (somente leitura) consumido pelo frontend.
 */
@RestController
@RequestMapping("/api/content")
public class ContentController {

    private final ContentService content;

    public ContentController(ContentService content) {
        this.content = content;
    }

    /** Tudo de uma vez, para o frontend carregar em uma unica chamada. */
    @GetMapping
    public Map<String, Object> all() {
        return Map.of(
                "method", content.getMethod(),
                "cases", content.getCases(),
                "hunts", content.getHunts(),
                "checklist", content.getChecklist(),
                "deepfakeQuiz", content.getDeepfakeQuiz()
        );
    }

    @GetMapping("/method")
    public List<MethodStep> method() { return content.getMethod(); }

    @GetMapping("/cases")
    public List<SimCase> cases() { return content.getCases(); }

    @GetMapping("/hunts")
    public List<HuntMessage> hunts() { return content.getHunts(); }

    @GetMapping("/checklist")
    public List<CheckItem> checklist() { return content.getChecklist(); }

    @GetMapping("/deepfake-quiz")
    public List<QuizItem> deepfakeQuiz() { return content.getDeepfakeQuiz(); }
}
