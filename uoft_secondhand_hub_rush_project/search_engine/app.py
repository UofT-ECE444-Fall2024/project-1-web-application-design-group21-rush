from flask import Flask

app = Flask(__name__)
app.config.from_pyfile('config.py')

@app.route('/')
def home():
    return 'Hello from search engine service'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
