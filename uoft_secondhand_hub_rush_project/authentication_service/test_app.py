import pytest
from app import app, db, User
from flask import json

app.config['JWT_SECRET_KEY'] = "LSIUEDHICUHSLDKJNF"

@pytest.fixture(scope='module')
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_register(client):
    response = client.post('/register', json={'username': 'testuser', 'password': 'testpass'})
    data = json.loads(response.data)
    assert response.status_code == 201
    assert data['message'] == "User registered successfully"

def test_register_existing_user(client):
    client.post('/register', json={'username': 'testuser', 'password': 'testpass'})
    response = client.post('/register', json={'username': 'testuser', 'password': 'newpass'})
    data = json.loads(response.data)
    assert response.status_code == 400
    assert data['error'] == "User already exists"

def test_login(client):
    client.post('/register', json={'username': 'testuser', 'password': 'testpass'})
    response = client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    data = json.loads(response.data)
    assert response.status_code == 200
    assert 'access_token' in data

def test_login_invalid_credentials(client):
    response = client.post('/login', json={'username': 'wronguser', 'password': 'wrongpass'})
    data = json.loads(response.data)
    assert response.status_code == 401
    assert data['error'] == "Invalid credentials"
