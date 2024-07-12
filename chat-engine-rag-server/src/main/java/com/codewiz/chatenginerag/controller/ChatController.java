package com.codewiz.chatenginerag.controller;

import com.codewiz.chatenginerag.advisor.CustomChatMemoryAdvisor;
import com.codewiz.chatenginerag.model.ChatInput;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class ChatController {

    private final VectorStore vectorStore;
    private final ChatClient chatClient;

    public ChatController(VectorStore vectorStore, ChatClient.Builder chatClientBuilder) {
        this.vectorStore = vectorStore;
        this.chatClient = chatClientBuilder
                .defaultAdvisors(new SimpleLoggerAdvisor(), new CustomChatMemoryAdvisor(vectorStore))
                .build();
    }

    private static final String SYSTEM_PROMPT = """
            Your are helpful AI assistant who responds to queries primarily based on the documents section below.
            
            Documents:
            
            {documents}
            
            """;


    @PostMapping("/chat")
    public String chat(@RequestBody ChatInput chatInput) {
        List<Document> relatedDocuments = vectorStore.similaritySearch(chatInput.message());
        String documents = relatedDocuments.stream().map(Document::getContent)
                .collect(Collectors.joining(System.lineSeparator()));

        return this.chatClient
                .prompt()
                .system(s -> s.text(SYSTEM_PROMPT).params(Map.of("documents", documents)))
                .user(chatInput.message())
                .advisors(a -> {
                    a.param(CustomChatMemoryAdvisor.CHAT_MEMORY_CONVERSATION_ID_KEY, chatInput.conversationId());
                    a.param(CustomChatMemoryAdvisor.CHAT_MEMORY_RETRIEVE_SIZE_KEY, 10);
                })
                .call()
                .content();

    }
}
