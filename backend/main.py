from flask import Flask
import youtube_dl

import video_download
app = Flask(__name__)

@app.route('/')
def index():
    return 'bleh'
    # render_template('index.html')

@app.route('/session')
def hello():
    return 'return session page'

@app.route('/video')
def video():
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

if __name__ == '__main__':
    app.run(debug=True)


    # make path so when its called with url, downloads youtue video without audio