from langchain_ollama import OllamaEmbeddings
from langchain_ollama import OllamaLLM

from AI.create_data import create_data_chroma_db
from AI.search_data import search_data_chroma_db
from AI.mood_analyzer import check_mood

from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


# модель векторизации Ollama
def get_ollama_embeddings():
    return OllamaEmbeddings(
        base_url="http://localhost:11434",
        model="nomic-embed-text"
    )


# модель Llama2 через Ollama
def get_llama2_llm():
    ollama = OllamaLLM(
        base_url='http://localhost:11434',
        model="llama2:7b-chat",
        temperature=0.7,
        options={
            'num_ctx': 4096,
            'system': "Отвечай только на русском языке. Все ответы должны быть на русском."
        }
    )
    return ollama


# создаём объекты моделей
embeddings = get_ollama_embeddings()    # модель для векторизации
llm = get_llama2_llm()                  # генеративный ИИ

@app.route('/api/ai/status', methods=['GET'])
def api_status():
    return jsonify({"status": "online"})

@app.route('/api/ai/chat', methods=['POST'])
def api_chat():
    data = request.get_json()

    if 'message' not in data:
        return jsonify({"error": "No message provided"}), 400

    question = data['message']
    answer = search_data_chroma_db(llm, embeddings, question, "./market_chroma_db")
    
    return jsonify({
        "reply": answer,
        "model": "llama2:7b-chat"
    })

@app.route('/api/v1/create', methods=['POST'])
def api_create():
    create_data_chroma_db(embeddings,
                          "/home/alexey/PycharmProjects/AIDemo/info.txt",
                          "./market_chroma_db")
    create_response = {"result": "Success!"}

    return jsonify(create_response)


@app.route('/api/v1/search', methods=['POST'])
def api_search():
    data = request.get_json()

    if 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    # Получаем текст из запроса
    question = data['text']
    answer = search_data_chroma_db(llm, embeddings, question, "./market_chroma_db")
    answer_response = {"answer": answer}

    return jsonify(answer_response)


@app.route('/api/v1/mood', methods=['POST'])
def api_mood():
    data = request.get_json()

    if 'text' not in data:
        return jsonify({"error": "No text provided"}), 400

    # Получаем текст из запроса
    question = data['text']

    answer = check_mood(llm, embeddings, question)

    answer_response = {"answer": answer}

    return jsonify(answer_response)


if __name__ == '__main__':
    app.run(debug=True)
