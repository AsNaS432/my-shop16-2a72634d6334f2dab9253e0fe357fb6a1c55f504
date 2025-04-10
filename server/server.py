import os
import json
from flask import Flask, request, jsonify
from langchain_community.llms import Ollama
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import CharacterTextSplitter
import logging

# AI Configuration
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'deepseek-r1')
KNOWLEDGE_BASE_FILE = os.path.join(os.path.dirname(__file__), 'data.txt')
CHROMA_DB_DIR = os.path.join(os.path.dirname(__file__), 'chroma_db')

llm = Ollama({
    'model': OLLAMA_MODEL,
    'temperature': 0.1,
    'top_p': 0.9,
    'repeat_penalty': 1.1
})

app = Flask(__name__)

# AI Status Check Endpoint
@app.route('/api/ai/status', methods=['GET'])
def ai_status():
    try:
        is_available = os.path.exists(KNOWLEDGE_BASE_FILE)
        return jsonify({'status': 'online' if is_available else 'offline'})
    except Exception as e:
        return jsonify({'status': 'offline', 'error': str(e)}), 503

# AI Chat Endpoint
@app.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    data = request.get_json()
    message = data.get('message')
    conversation = data.get('conversation', [])

    if not message:
        return jsonify({'error': 'Message is required'}), 400

    try:
        loader = TextLoader(KNOWLEDGE_BASE_FILE, 'utf-8')
        documents = loader.load()
        text_splitter = CharacterTextSplitter(chunk_size=800, chunk_overlap=150)
        texts = text_splitter.split_documents(documents)
        vectorstore = Chroma(texts, persist_directory=CHROMA_DB_DIR)

        context = "\n".join([f"{msg['sender']}: {msg['text']}" for msg in conversation])
        prompt = f"You are a helpful assistant. Context: {context}\nQuestion: {message}"

        result = llm.chat(prompt)
        return jsonify({'reply': result})
    except Exception as e:
        return jsonify({'error': 'Failed to process chat', 'details': str(e)}), 500

# Helper functions
def detect_question_type(question):
    question = question.lower()
    delivery_keywords = ["доставк", "самовывоз", "забрать", "получить", "курьер"]
    guarantee_keywords = ["гаранти", "подлинн", "качеств"]
    payment_keywords = ["оплат", "карт", "нал", "безнал"]
    return_keywords = ["возврат", "обмен", "вернуть"]

    if any(kw in question for kw in delivery_keywords):
        return "delivery"
    if any(kw in question for kw in guarantee_keywords):
        return "guarantee"
    if any(kw in question for kw in payment_keywords):
        return "payment"
    if any(kw in question for kw in return_keywords):
        return "return"
    return None

def clean_response(text):
    return text.replace('согласно (базе знаний|документации)', '').replace('на основании .* информации', '').strip()

if __name__ == '__main__':
    app.run(debug=True)
