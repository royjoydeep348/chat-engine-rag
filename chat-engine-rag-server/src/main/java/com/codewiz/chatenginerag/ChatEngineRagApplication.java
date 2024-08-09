package com.codewiz.chatenginerag;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.ExtractedTextFormatter;
import org.springframework.ai.reader.pdf.PagePdfDocumentReader;
import org.springframework.ai.reader.pdf.config.PdfDocumentReaderConfig;
import org.springframework.ai.transformer.splitter.TokenTextSplitter;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.jdbc.core.JdbcTemplate;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@SpringBootApplication
@RequiredArgsConstructor
@Slf4j
public class ChatEngineRagApplication {

	//private static final Logger log = LoggerFactory.getLogger(ChatEngineRagApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(ChatEngineRagApplication.class, args);
	}

	@Bean
	ApplicationRunner applicationRunner(
			JdbcTemplate jdbcTemplate,
			VectorStore vectorStore,
			@Value("${documents.directory.path}") String directoryPath
	)
	{
		return args -> {
			log.info("directoryPath :"+directoryPath);
			Path directory = Paths.get(directoryPath);
			try(var paths = Files.list(directory)){
				paths.filter(Files::isRegularFile)
						.forEach(path -> {
                            try {
								String fileName = path.getFileName().toString();
								log.info("fileName :"+fileName);
								//String sql = "SELECT count(*) FROM vector_store WHERE metadata->>'file_name' = ?";
								String sql = "SELECT count(*) FROM vector_store";
								Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
								//String sql = "SELECT count(*) FROM vector_store WHERE 'file_name' = ?";
								//Integer count = jdbcTemplate.queryForObject(sql, new Object[]{fileName}, Integer.class);
								if(count == 0) {
									Resource resource = new UrlResource(path.toUri());
									log.info("Reading PDF: {}", resource.getFilename());
									int startTime = (int) System.currentTimeMillis();
									PagePdfDocumentReader pdfReader = new PagePdfDocumentReader(resource,
											PdfDocumentReaderConfig.builder()
													.withPageTopMargin(0)
													.withPageExtractedTextFormatter(ExtractedTextFormatter.builder()
															.withNumberOfTopTextLinesToDelete(0)
															.build())
													.withPagesPerDocument(1)
													.build());

									var textSplitter = new TokenTextSplitter();
									var docs = textSplitter.apply(pdfReader.get());
									List<Document> docsList = docs;
									log.info("Loading PDF: {}", resource.getFilename());
									//vectorStore.accept(docs);
									docsList.forEach(doc -> log.debug("Document: {}", doc));
									vectorStore.add(docsList);
									log.info("Loaded PDF complete: {}", resource.getFilename());
									int endTime = (int) System.currentTimeMillis();
									log.info("Time taken to load PDF: {} ms", endTime - startTime);
								}

							} catch (MalformedURLException e) {
								throw new RuntimeException(e);
							}



						});
			}

		};
	}

}
