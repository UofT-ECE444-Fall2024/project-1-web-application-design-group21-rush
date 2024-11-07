from flask import Flask
from elasticsearch import Elasticsearch

es = Elasticsearch("http://elasticsearch:9200")

if es.ping():
    print("Connected to Elasticsearch!")
else:
    print("Could not connect to Elasticsearch.")

app = Flask(__name__)
app.config.from_pyfile('config.py')

@app.route('/')
def home():
    return 'Hello from search engine service'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
