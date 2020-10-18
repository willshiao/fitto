import mysql.connector
from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit
from random import random
from preprocessing import to_timeseries, DTW, get_avg_dist, crop_dict, get_part_to_move
import re
import ujson

YT_REGEX = re.compile(r'^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*')

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# DB behind ACL, kinda okay to expose pass
mydb = mysql.connector.connect(
  host="10.67.16.3",
  user="root",
  password="oBY8AF6p8L3ZqLXNAeXv",
  database='fitto'
)

select_sql = 'SELECT pose_info FROM poses WHERE timestamp >= %s AND timestamp <= %s AND video_str=%s'
def get_timeseries(video_url, start_time, end_time):
    print('get_timeseries called with: ', (video_url, start_time, end_time))
    match = YT_REGEX.search(video_url)
    yt_id = match.group(1)
    print('got id: ', yt_id)
    cursor = mydb.cursor()
    cursor.execute(select_sql, (start_time, end_time, yt_id))
    result = cursor.fetchall()

    data_list = []
    for x in result:
        data = x[0]
        if data == '{}':
            continue
        data = ujson.loads(data)
        data_list.append(data)
    return to_timeseries(data_list)


@socketio.on('poses:req')
def handle_poses(poses):
    print('Got pose request')
    vid_url = poses['videoUrl']
    cropped_dicts = [crop_dict(x) for x in poses['poseBatch'] if x is not None]
    user_pose_timeseries = to_timeseries(cropped_dicts)
    print('Got user timeseries, getting good timeseries')
    good_timeseries = get_timeseries(vid_url, poses['startTime'], poses['endTime'])
    print('Got good timeseries, running DTW')
    dtw_dists = DTW(user_pose_timeseries, good_timeseries, normalize_user=True)
    print('Got DTW distances:', dtw_dists)

    # print('Pose timeseries:', pose_timeseries)
    # ujson.dumps(sorted(dtw_dists.items(), key=lambda x: x[1]))
    emit('poses:res', { 'score': get_avg_dist(dtw_dists), 'hint': get_part_to_move(dtw_dists) })

@socketio.on('connect')
def test_connect():
    print('Connected!')

@socketio.on('disconnect')
def test_disconnect():
    print('Disconnected!')

if __name__ == '__main__':
    socketio.run(app)
