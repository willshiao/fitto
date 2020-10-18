import mysql.connector
from pose_extractor import PoseExtractor
from preprocessing import Normalize as normalize
import ujson

pe = PoseExtractor()
# DB behind ACL, kinda okay to expose pass
mydb = mysql.connector.connect(
  host="35.233.247.13",
  user="root",
  password="oBY8AF6p8L3ZqLXNAeXv",
  database='fitto'
)
print(mydb)

sql = 'INSERT INTO poses (timestamp, video_str, pose_info) VALUES (%s, %s, %s)'
cnt = 0
def process_frame(pose_scores, keypoint_scores, keypoint_coords, frame_num, fps):
    global cnt
    seconds = frame_num / fps
    normalized = normalize(pose_scores, keypoint_scores, keypoint_coords)
    # print(normalized, seconds)
    cursor = mydb.cursor()
    print('Inserting...')
    cursor.execute(sql, (seconds, 'test_video2', ujson.dumps(normalized)))
    cnt += 1
    if cnt % 500 == 0:
        print('Committing...')
        mydb.commit()
mydb.commit()
pe.get_poses_from_video('./taichi.mp4', process_frame, skip_every_frames=1, skip_first=0)
mycursor = mydb.cursor()
mycursor.execute('SELECT * FROM poses')
myresult = mycursor.fetchall()

# for x in myresult:
#     print(x)
