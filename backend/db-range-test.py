import mysql.connector
from pose_extractor import PoseExtractor
from preprocessing import normalize
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

sql = 'SELECT pose_info FROM poses WHERE timestamp >= %s AND timestamp <= %s AND video_str=%s'
mycursor = mydb.cursor()
mycursor.execute(sql, (0, 1, 'test_video'))
myresult = mycursor.fetchall()

data_list = []
for x in myresult:
    data = x[0]
    if data == '{}':
      continue
    data = ujson.loads(data)
    data_list.append(data)

print(data_list)
