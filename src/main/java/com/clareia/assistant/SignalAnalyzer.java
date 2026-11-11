package com.clareia.assistant;

import com.clareia.assistant.AssistantModels.AnalysisResult;
import com.clareia.assistant.AssistantModels.SignalHit;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Assistente de sinais do Clareia, agora no backend.
 *
 * Analisa o texto colado pelo usuario e aponta SINAIS observaveis, PERGUNTAS de
 * verificacao e PASSOS do metodo CLAREIA. REGRA ABSOLUTA: nunca afirma, sugere ou
 * estima se o conteudo e verdadeiro, falso, golpe ou confiavel. E uma heuristica
 * deterministica (sem IA generativa), o que torna o resultado transparente e
 * reproduzivel - alinhado ao principio de "nenhum veredito automatizado".
 */
@Component
public class SignalAnalyzer {

    private static final int MAX_LEN = 8000;
    private static final String DISCLAIMER =
            "Isto não é um veredito. O Clareia aponta sinais e perguntas de verificação; "
            + "quem decide, depois de conferir as fontes, é você.";

    private static final Pattern PERCENT = Pattern.compile("\\b\\d{2,3}\\s?%");
    private static final Pattern CAPS = Pattern.compile("\\b[A-ZÁÉÍÓÚÂÊÔÃÕÇ]{5,}\\b");
    private static final Pattern URL = Pattern.compile(
            "\\b(?:https?://)?(?:[a-z0-9-]+\\.)+[a-z]{2,}(?:\\.br)?(?:/[\\w./?=&%-]*)?",
            Pattern.CASE_INSENSITIVE);

    private static final String[] URGENCY = {
            "urgente", "urgencia", "urgência", "repasse", "repassem", "compartilhe", "compartilhem",
            "espalhe", "espalhem", "antes que apaguem", "antes que tirem", "corra", "ultima chance",
            "última chance", "so hoje", "só hoje", "somente hoje", "prazo", "expira", "acaba hoje",
            "ate meia-noite", "até meia-noite", "imediatamente", "agora mesmo"
    };
    private static final String[] MONEY_DATA = {
            "pix", "transferencia", "transferência", "deposito", "depósito", "dados bancarios",
            "dados bancários", "senha", "cartao", "cartão", "clique no link", "clique aqui",
            "informe seus dados", "cadastr", "premio", "prêmio", "ganhe", "receba", "liberado",
            "liberados", "resgate", "saque", "r$"
    };
    private static final String[] VAGUE_SOURCE = {
            "um medico", "um médico", "cientistas", "especialistas", "pesquisadores",
            "medicos dizem", "médicos dizem", "fontes seguras", "segundo especialistas",
            "estudos comprovam", "esta comprovado", "está comprovado", "foi comprovado"
    };
    private static final String[] SHOCK = {
            "chocante", "inacreditavel", "inacreditável", "voce nao vai acreditar",
            "você não vai acreditar", "milagre", "milagroso", "bomba", "revelado",
            "ninguem esta mostrando", "ninguém está mostrando", "a midia nao mostra",
            "a mídia não mostra", "nao querem que voce saiba", "não querem que você saiba",
            "bom demais", "cura definitiva", "100%"
    };
    private static final String[] FORWARDED = {
            "encaminhada", "encaminhado", "recebi", "mandaram", "numero desconhecido",
            "número desconhecido", "sem fonte"
    };
    private static final String[] MEDIA = {
            "video de", "vídeo de", "audio de", "áudio de", "foto de", "imagem de",
            "mensagem de voz", "print"
    };

    public AnalysisResult analyze(String rawText) {
        String text = rawText.length() > MAX_LEN ? rawText.substring(0, MAX_LEN) : rawText;
        String lower = text.toLowerCase(Locale.ROOT);

        List<SignalHit> signals = new ArrayList<>();
        Set<String> usedExcerpts = new LinkedHashSet<>();
        LinkedHashSet<String> steps = new LinkedHashSet<>();
        LinkedHashSet<String> questions = new LinkedHashSet<>();

        // Passos e perguntas basicos, validos para qualquer texto.
        steps.add("C");
        steps.add("A");
        steps.add("R");
        questions.add("Quem publicou isto primeiro? Há um veículo, um autor e uma data?");
        questions.add("A mesma informação aparece em fontes oficiais ou na imprensa conhecida?");

        // 1. Urgencia e pedido de repasse
        String hit = firstMatch(lower, text, URGENCY);
        if (add(signals, usedExcerpts, hit, "alerta",
                "Pressa e pedido de repasse tentam impedir que você pare para verificar.")) {
            steps.add("I");
        }

        // 2. Dinheiro, dados ou cadastro
        hit = firstMatch(lower, text, MONEY_DATA);
        if (add(signals, usedExcerpts, hit, "alerta",
                "Pedido de dinheiro, dados ou cadastro por link é marca registrada de golpes.")) {
            steps.add("I");
            questions.add("O pedido de dinheiro, dados ou cadastro chegou por um canal oficial que você consegue confirmar?");
        }

        // 3. Fonte vaga
        hit = firstMatch(lower, text, VAGUE_SOURCE);
        if (add(signals, usedExcerpts, hit, "atencao",
                "Fonte genérica, sem nome, instituição ou link para conferir.")) {
            questions.add("Dá para identificar o nome e a instituição da fonte citada?");
        }

        // 4. Choque e exagero
        hit = firstMatch(lower, text, SHOCK);
        if (hit == null) {
            Matcher mp = PERCENT.matcher(text);
            if (mp.find()) hit = mp.group();
        }
        if (add(signals, usedExcerpts, hit, "alerta",
                "Linguagem de choque ou número exagerado mira a emoção e costuma não se sustentar na fonte.")) {
            steps.add("L");
        }

        // 5. Links e dominios
        addLinkSignals(text, signals, usedExcerpts, steps, questions);

        // 6. Encaminhamento e midia sem contexto
        hit = firstMatch(lower, text, FORWARDED);
        add(signals, usedExcerpts, hit, "atencao",
                "Conteúdo encaminhado ou sem origem precisa ter a fonte rastreada antes de acreditar.");

        hit = firstMatch(lower, text, MEDIA);
        if (add(signals, usedExcerpts, hit, "atencao",
                "Imagem, vídeo ou áudio sem contexto (data, local, origem) pede busca reversa.")) {
            steps.add("E");
            questions.add("Você consegue encontrar a imagem, o vídeo ou o áudio original com busca reversa?");
        }

        // 7. Maiusculas (sinal fraco)
        Matcher mc = CAPS.matcher(text);
        while (signals.size() < 8 && mc.find()) {
            if (add(signals, usedExcerpts, mc.group(), "atencao",
                    "Palavras em maiúsculas buscam emoção, não informação.")) {
                break;
            }
        }

        // Ordena os passos na ordem canonica do metodo CLAREIA.
        List<String> orderedSteps = new ArrayList<>();
        for (String letter : List.of("C", "L", "A", "R", "E", "I")) {
            if (steps.contains(letter)) orderedSteps.add(letter);
        }

        if (signals.size() > 8) {
            signals = new ArrayList<>(signals.subList(0, 8));
        }

        return new AnalysisResult(signals, new ArrayList<>(questions), orderedSteps, DISCLAIMER);
    }

    private void addLinkSignals(String text, List<SignalHit> signals, Set<String> used,
                                LinkedHashSet<String> steps, LinkedHashSet<String> questions) {
        Matcher m = URL.matcher(text);
        boolean anyLink = false;
        while (m.find() && signals.size() < 8) {
            String url = m.group();
            String host = url.replaceFirst("(?i)^https?://", "");
            int slash = host.indexOf('/');
            if (slash >= 0) host = host.substring(0, slash);
            String hostLower = host.toLowerCase(Locale.ROOT);

            // Precisa ter um ponto para ser um dominio plausivel.
            if (!hostLower.contains(".")) continue;
            anyLink = true;

            boolean shortener = hostLower.matches("(bit\\.ly|goo\\.gl|tinyurl\\.com|encurta\\.com.*|t\\.co|is\\.gd|cutt\\.ly)");
            boolean officialLooking = hostLower.contains("gov") || hostLower.contains("receita")
                    || hostLower.contains("inss") || hostLower.contains("bolsa") || hostLower.contains("prefeitura");

            boolean added;
            if (hostLower.endsWith(".gov.br")) {
                added = add(signals, used, host, "confianca", "Endereço oficial: termina em .gov.br.");
            } else if (shortener) {
                added = add(signals, used, host, "alerta",
                        "Link encurtado esconde o destino real. Veja para onde ele leva antes de abrir.");
                if (added) steps.add("I");
            } else if (officialLooking) {
                added = add(signals, used, host, "alerta",
                        "Endereço imita um site oficial. Os oficiais do governo terminam em .gov.br.");
                if (added) steps.add("I");
            } else {
                added = add(signals, used, host, "atencao", "Confira para onde este link leva antes de clicar.");
            }
            if (added) steps.add("E");
        }
        if (anyLink) {
            questions.add("Para onde o link realmente leva? Quando se diz oficial, o endereço termina em .gov.br?");
        }
    }

    /** Adiciona um sinal se houver trecho e ele ainda nao foi usado. Retorna true se adicionou. */
    private boolean add(List<SignalHit> signals, Set<String> used, String excerpt, String type, String explanation) {
        if (excerpt == null || excerpt.isBlank() || signals.size() >= 8) return false;
        String key = excerpt.toLowerCase(Locale.ROOT);
        if (!used.add(key)) return false;
        signals.add(new SignalHit(excerpt, type, explanation));
        return true;
    }

    /** Retorna o trecho original (preservando o caso) do primeiro termo encontrado, ou null. */
    private String firstMatch(String lower, String original, String[] keywords) {
        int best = Integer.MAX_VALUE;
        String bestExcerpt = null;
        for (String kw : keywords) {
            int i = lower.indexOf(kw.toLowerCase(Locale.ROOT));
            if (i >= 0 && i < best) {
                best = i;
                bestExcerpt = original.substring(i, Math.min(original.length(), i + kw.length()));
            }
        }
        return bestExcerpt;
    }
}
