from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
from random import random

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")


@socketio.on('poses:req')
def handle_poses(poses):
    print('Got pose request', poses)
    emit('poses:res', { 'score': random() })

@socketio.on('connect')
def test_connect():
    print('Connected!')

@socketio.on('disconnect')
def test_disconnect():
    print('Disconnected!')

if __name__ == '__main__':
    socketio.run(app)
