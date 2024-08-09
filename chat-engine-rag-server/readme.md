CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS hstore;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS vector_store (
id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
content text,
metadata json,
embedding vector(1536)
);

CREATE INDEX ON vector_store USING HNSW (embedding vector_cosine_ops);

alter table vector_store alter column embedding type vector(1024);

select * from vector_store
delete from vector_store

http://localhost:8080/chat

{
"message" : "Explain Lorem" , "conversationId":"12348"
}

Lorem Ipsum is a placeholder text commonly used in the publishing and typesetting industry. It's a dummy text that is used to demonstrate the graphic elements of a document or visual presentation. The words and phrases in Lorem Ipsum are random and have no meaning, derived from sections of a Latin text by the Roman philosopher Cicero. Its purpose is to allow designers to focus on layout without being distracted by meaningful content.