import datetime
day = datetime.datetime.today()
print(day.strftime("%a"))
# while True:
#     day = datetime.datetime.now()
date = day.strftime("%m/%d/%Y")
time = day.strftime("%H:%M:%S")
print(time)
#     if time=='10:16:40':
#         print("yes")
# print(str(day).split(" ")[1].split("."))
# t1="11:53:55"
# t2=str(day).split(" ")[1].split(".")[0]
# print(t2)
# print(t1)
# print(t2<t1)
# print(day.strftime("HH:MM:SS"))

# Mon
# 10:30 - 12:30 Lect1 Teacher 1
# 1:15 - 2:15 Lect2  Teacher 2
# 2:15 - 3:15 Lect3  Teacher 1
# 3:30 - 5:30 Lect4  Teacher 2
# @app.route("/api", methods=['POST', 'GET'])
# def index():
#     data = request.get_json()
#     res = data['data']
#     resp = "Nobody"
#     directory = "./Stranger"
#     if data:
#         if os.path.exists(directory):
#             shutil.rmtree(directory)

#         if not os.path.exists(directory):
#             try:
#                 os.mkdir(directory)
#                 time.sleep(1)
#                 result = data['data']
#                 b = bytes(result, "utf-8")
#                 image = b[b.find(b'/9'):]
#                 im = Image.open(io.BytesIO(base64.b64decode(image)))
#                 im.save(directory+'/Stranger.jpeg')
#                 unknown = cv2.imread("Stranger/Stranger.jpeg")
#                 facesCurFrame = face_locations(unknown)
#                 encodesCurFrame = face_encodings(unknown, facesCurFrame)

#                 for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
#                     matches = compare_faces(encodeList, encodeFace)
#                     faceDis = face_distance(encodeList, encodeFace)
#                     # print("diff=> ",faceDis)
#                     matchIndex = np.argmin(faceDis)

#                     print(faceDis)
#                     print(matches)
#                     if matches[matchIndex]:
#                         name = classNames[matchIndex]
#                         return name
#                         print("match")
#                     else:
#                         print("not match!")

#                 return "hi"
#             except Exception as e:
#                 print(e)
#                 return "hello"
