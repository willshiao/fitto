from os import path
from flask import Flask, request
import youtube_dl
import ujson
from pose_extractor import PoseExtractor
import mysql.connector
from preprocessing import normalize

VID_DIR='./videos'

pe = PoseExtractor()
# DB behind ACL, kinda okay to expose pass
mydb = mysql.connector.connect(
  host="35.233.247.13",
  user="root",
  password="oBY8AF6p8L3ZqLXNAeXv",
  database='fitto'
)
insert_sql = 'INSERT INTO poses (timestamp, video_str, pose_info) VALUES (%s, %s, %s)'

app = Flask(__name__)

@app.route('/')
def index():
    return 'bleh'
    # render_template('index.html')

@app.route('/session')
def hello():
    return 'return session page'

@app.route('/download')
def download():
    yt_url = input('URL here pls:')

    ydl = youtube_dl.YoutubeDL({'outtmpl': '%(id)s.%(ext)s', 'format': 'bestvideo'})

    with ydl:
        result = ydl.extract_info(
            yt_url,
            download=True
        )
    if 'entries' in result:
        # Can be a playlist or a list of videos
        video = result['entries'][0]
    else:
        # Just a video
        video = result

    print(video)
    video_url = video['url']
    print(video_url)

@app.route('/video', methods=['POST'])
def video_route():
    print(request.json['url'])
    if request.json is None:
        return 'ERROR: no JSON in request body'
    yt_url = request.json['url']
    if not yt_url.startswith('https://youtube.com/') and not yt_url.startswith('https://www.youtube.com/'):
        return { 'success': False, 'message': 'Invalid URL' }

    ydl = youtube_dl.YoutubeDL({'outtmpl': path.join(VID_DIR, '%(id)s.%(ext)s'), 'format': 'mp4'})
    with ydl:
        result = ydl.extract_info(
            yt_url,
            download=True
        )
    # Can be a playlist or a list of videos
    if 'entries' in result:
        video = result['entries'][0]
    else:
        video = result
    vid_id = result['id']
    filename = path.join(VID_DIR, f'{vid_id}.mp4')
    cursor = mydb.cursor()

    def process_frame(pose_scores, keypoint_scores, keypoint_coords, frame_num, fps, call_cnt):
        seconds = frame_num / fps
        normalized = normalize(pose_scores, keypoint_scores, keypoint_coords)
        if not normalized:
            return True
        print(f'Inserting #{call_cnt}')
        cursor.execute(insert_sql, (seconds, vid_id, ujson.dumps(normalized)))
        if frame_num % 1000 == 0:
            print('Committing...')
            mydb.commit()
    pe.get_poses_from_video(filename, process_frame, skip_every_frames=1, skip_first=0)
    mydb.commit()
    print('Done getting poses for {vid_id}')

    return { 'success': True }

if __name__ == '__main__':
    app.run(debug=True, port=3000)
