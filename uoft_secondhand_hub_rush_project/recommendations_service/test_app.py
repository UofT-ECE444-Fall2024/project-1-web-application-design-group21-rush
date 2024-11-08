import pytest
from app import app, db, Product, UserProductInteraction
from flask import json
from ..authentication_service import app as auth_app, db as auth_db, User

@pytest.fixture(scope='module')
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            db.session.add(Product(name="Product1", category="Category1"))
            db.session.add(Product(name="Product2", category="Category1"))
            db.session.commit()
        yield client
        with app.app_context():
            db.drop_all()

@pytest.fixture(scope='module')
def auth_client():
    auth_app.config['TESTING'] = True
    auth_app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with auth_app.test_client() as client:
        with auth_app.app_context():
            auth_db.create_all()
        yield client
        with auth_app.app_context():
            auth_db.drop_all()

@pytest.fixture
def auth_token(auth_client):
    auth_client.post('/register', json={'username': 'testuser', 'password': 'testpass'})
    response = auth_client.post('/login', json={'username': 'testuser', 'password': 'testpass'})
    data = json.loads(response.data)
    return data['access_token']

def test_get_recommendations_unauthorized(client):
    response = client.get('/recommendations')
    assert response.status_code == 401

def test_get_recommendations_authorized(client, auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    response = client.get('/recommendations', headers=headers)
    assert response.status_code == 200
    assert 'recommendations' in json.loads(response.data)

def test_add_interaction(client, auth_token):
    headers = {'Authorization': f'Bearer {auth_token}'}
    data = {'user_id': 1, 'product_id': 1, 'interaction_type': 'viewed'}
    response = client.post('/interactions', headers=headers, json=data)
    assert response.status_code == 201
    assert json.loads(response.data)['message'] == "Interaction added"
