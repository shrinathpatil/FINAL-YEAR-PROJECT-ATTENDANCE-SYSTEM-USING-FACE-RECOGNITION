from flask import Flask, request, jsonify
from flask_pymongo import ObjectId
from flask_cors import CORS
import numpy as np
from PIL import Image
from face_recognition import face_encodings, face_locations, compare_faces, face_distance
import json
import cv2
import base64
import io
import os
import shutil
from datetime import datetime
import time
from database import getUserCollection, getClassesCollection, getTimeTableCollection

app = Flask(__name__)

# todo: mongoDB setup
User = getUserCollection()
Class = getClassesCollection()
TimeTable = getTimeTableCollection()


# todo: cors policy
CORS(app)

attendanceData = {
    'classNames': [],
    'classEncodings': [],
    'detected': []
}


def findEncodings(images):
    encodeList = []
    for img in images:
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        encode = face_encodings(img)[0]
        encodeList.append(encode)
    return encodeList


def getUserEncode(userId):
    encode = []
    userImg = cv2.imread(f"Users/{userId}.jpeg")
    userImg = cv2.cvtColor(userImg, cv2.COLOR_BGR2RGB)
    userEncode = face_encodings(userImg)[0]
    encode.append(userEncode)
    return encode


def makeAttendanceData(className):
    try:
        classImages = []
        classNames = []
        classList = os.listdir(className)
        for cl in classList:
            currImg = cv2.imread(f"{className}/{cl}")
            classImages.append(currImg)
            classNames.append(os.path.splitext(cl)[0])

        classEncodings = findEncodings(classImages)

        attendanceData['classNames'] = classNames
        attendanceData["classEncodings"] = classEncodings
    except Exception as e:
        print(e)




#  todo: register users
@app.route("/api/auth/register", methods=["POST"])
def register():
    body = request.get_json()
    result = body['img']
    b = bytes(result, "utf-8")
    image = b[b.find(b'/9'):]
    im = Image.open(io.BytesIO(base64.b64decode(image)))
    im.save("./Users"+'/Stranger.jpeg')
    unknown = cv2.imread("Users/Stranger.jpeg")
    facesCurFrame = face_locations(unknown)
    encodesCurFrame = face_encodings(unknown, facesCurFrame)
    if not facesCurFrame:
        os.remove("./Users/Stranger.jpeg")
        return jsonify({"success": False, "message": "Give Proper Image"}), 400
    else:
        os.remove("./Users/Stranger.jpeg")
        try:
            check = User.find_one({"email": body["email"]})
            if check:
                return jsonify({"success": False, "message": "Email already registered !"}), 400
            newUser = {
                "name": body["name"],
                "email": body["email"],
                "createdAt": datetime.utcnow()
            }
            saveUserId = User.insert_one(newUser).inserted_id
            if saveUserId:
                newUser['_id'] = str(saveUserId)
                im.save(f"./Users/{str(saveUserId)}.jpeg")
                return jsonify({"success": True, "message": "User registered successfully !", "user": newUser}), 201
            else:
                return jsonify({"success": False, "message": "unable to register now !"}), 400

        except Exception as e:
            print(e)
            return jsonify({"success": False, "message": "User validation failed!"}), 500

# todo: login user
@app.route("/api/auth/login", methods=["POST"])
def login():
    try:
        body = request.get_json()
        user = User.find_one({'name': body['name'], 'email': body['email']})
        if not user:
            return jsonify({"success": False, "message": "User Not Found !"}), 404
        else:
            data = {
                "_id": str(user['_id']),
                'name': user['name'],
                'email': user['email'],
            }
            return jsonify({"success": True, "message": "proceed", 'user': data}), 200
    except Exception as e:
        print(e)

# todo: verify user
@app.route("/api/auth/verify/<string:id>", methods=['POST'])
def verifyFace(id):
    try:
        body = request.get_json()
        userEncode = getUserEncode(id)
        result = body['img']
        b = bytes(result, "utf-8")
        image = b[b.find(b'/9'):]
        im = Image.open(io.BytesIO(base64.b64decode(image)))
        im.save("./Temp"+f'/{id}.jpeg')
        queryImg = cv2.imread(f"Temp/{id}.jpeg")
        facesCurFrame = face_locations(queryImg)
        encodesCurFrame = face_encodings(queryImg, facesCurFrame)
        if not facesCurFrame:
            os.remove(f"./Temp/{id}.jpeg")
            return jsonify({"success": False, "message": "Give Proper Image"}), 400
        for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
            matches = compare_faces(userEncode, encodeFace)
            faceDis = face_distance(userEncode, encodeFace)
            # print("diff=> ",faceDis)
            matchIndex = np.argmin(faceDis)
            if matches[0]:
                os.remove(f"./Temp/{id}.jpeg")
                return jsonify({"success": True, "message": "Login Successful"}), 200
        os.remove(f"./Temp/{id}.jpeg")
        return jsonify({"success": False, "message": "Face not matched!"}), 404
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "error"})


# todo: add class

@app.route("/api/users/class", methods=['POST'])
def createClass():
    try:
        body = request.get_json()
        print(body)
        className = body['name']
        userName = body['userName']
        students = body['students']
        userId = body['userId']
        check = Class.find_one(
            {'className': className, 'userId': ObjectId(userId)})
        if check:
            return jsonify({'success': False, 'message': "You can't create two classes with same name"}), 400
        directory = f"./{className}"
        os.mkdir(directory)
        time.sleep(1)
        classStudents = []
        for std in students:
            result = std['img']
            b = bytes(result, "utf-8")
            image = b
            im = Image.open(io.BytesIO(base64.b64decode(image)))
            im = im.convert("RGB")
            im.save(directory+f"/{std['enroll']}.jpeg")
            info = {
                'name': std['name'],
                'enroll': std['enroll'],
            }
            classStudents.append(info)

        newClassData = {
            'className': className,
            'userName': userName,
            'userId': ObjectId(userId),
            'students': classStudents,
            'attendance': []
        }
        newClass = Class.insert_one(newClassData).inserted_id
        if newClass:
            return jsonify({"success": True, "message": "Class Create Successfully!"}), 201
        else:
            return jsonify({"success": False, "message": "cannot create class now!"}), 400

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal server error, try again later!"}), 500


# todo: get classes
@app.route("/api/users/classes/<string:uid>", methods=['GET'])
def getUserClasses(uid):
    try:
        userClasses = Class.find({'userId': ObjectId(uid)})

        data = []
        for cls in userClasses:
            info = {
                '_id': str(cls['_id']),
                'className': cls['className'],
                'students': cls['students'],
                'attendance': cls['attendance'],
            }

            data.append(info)

        return jsonify({"success": True, "classes": data}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal server error!"})


# todo: get class
@app.route("/api/users/class/<string:id>", methods=["GET"])
def getOneClass(id):
    try:
        queryClass = Class.find_one({'_id': ObjectId(id)})
        if not queryClass:
            return jsonify({"success": False, "message": "Class not found"})

        data = {
            "_id": str(queryClass['_id']),
            'students': queryClass['students'],
            'className': queryClass['className'],
            'attendance': queryClass['attendance']
        }
        return jsonify({"success": True, 'reqClass': data}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal server error"}), 500

# todo: get all classes


@app.route("/api/classes/all", methods=["GET",])
def getAllClasses():
    try:
        classList = Class.find({})
        classes = []
        for cl in classList:
            info = {}
            info['className'] = cl['className']
            info['_id'] = str(cl['_id'])
            info['userName'] = cl['userName']
            info['userId'] = str(cl['userId'])
            classes.append(info)

        return jsonify({"success": True, "classes": classes}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal server error"}), 500

# todo: add student


@app.route("/api/users/class/add", methods=['PUT'])
def addStudentToClass():
    try:
        body = request.get_json()
        classId = body["classId"]
        className = body["className"]
        students = body['students']
        newData = []
        directory = f"./{className}"

        for std in students:
            result = std['img']
            b = bytes(result, "utf-8")
            image = b
            im = Image.open(io.BytesIO(base64.b64decode(image)))
            im = im.convert("RGB")
            im.save(directory+f"/{std['enroll']}.jpeg")
            info = {
                'name': std['name'],
                'enroll': std['enroll'],
            }
            newData.append(info)

        updateClass = Class.update_one({'_id': ObjectId(classId)}, {
            "$push": {
                "students": {"$each": newData
                             }
            }
        })
        return jsonify({"success": True, "message": "students added successfully !"})
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal server error!"})

# todo: get user


@app.route("/api/auth/me/<string:id>", methods=["GET"])
def getCurrentUser(id):
    currUser = User.find_one({"_id": ObjectId(id)})
    try:
        if not currUser:
            return jsonify({"success": False, "message": "No such user !"}), 404
        data = {
            "_id": str(currUser['_id']),
            'name': currUser['name'],
            "email": currUser['email'],
        }
        return jsonify({'success': True, 'user': data}), 200
    except Exception as e:
        return jsonify({'success': False, "message": "Internal Server Error"}), 500


# todo: start attendance

@app.route("/api/attendance/start", methods=["POST"])
def startAttendance():
    try:
        body = request.get_json()
        className = body["className"]
        attendanceData = makeAttendanceData(className)

        return jsonify({"success": True, "message": "Attendance Data created successfully!"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal Server Error"}), 500


@app.route("/api/attendance/stop", methods=["POST"])
def stopAttendance():
    try:
        attendanceData['classNames'] = []
        attendanceData['classEncodings'] = []
        attendanceData['detected'] = []
        return jsonify({"success": True, "message": "Attendance Data cleared successfully!"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal Server Error"}), 500


@app.route("/api/attendance/detect", methods=['POST'])
def detect():
    try:
        body = request.get_json()
        id = body['id']
        if os.path.exists(f"./Temp/{id}.jpeg"):
            os.remove(f"./Temp/{id}.jpeg")
        result = body['img']
        b = bytes(result, "utf-8")
        image = b[b.find(b'/9'):]
        im = Image.open(io.BytesIO(base64.b64decode(image)))
        im.save("./Temp"+f'/{id}.jpeg')
        unknown = cv2.imread(f"Temp/{id}.jpeg")
        facesCurFrame = face_locations(unknown)
        encodesCurFrame = face_encodings(unknown, facesCurFrame)

        for encodeFace, faceLoc in zip(encodesCurFrame, facesCurFrame):
            matches = compare_faces(
                attendanceData['classEncodings'], encodeFace)
            faceDis = face_distance(
                attendanceData['classEncodings'], encodeFace)
            matchIndex = np.argmin(faceDis)

            if matches[matchIndex]:
                roll = attendanceData['classNames'][matchIndex]
                if roll not in attendanceData['detected']:
                    attendanceData['detected'].append(roll)

        os.remove(f"./Temp/{id}.jpeg")
        return jsonify({"success": True, 'detected': attendanceData['detected']}), 200

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal Server Error"}), 500


@app.route("/api/attendance/add", methods=["PUT"])
def markAttendance():
    try:
        body = request.get_json()

        classId = body["classId"]
        data = body["data"]
        updateAttendance = Class.update_one({'_id': ObjectId(classId)}, {
            "$push": {
                "attendance": data
            }
        })

        return jsonify({"success": True, "message": "Attendance Marked Successfully"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal Server Error"}), 500


# todo: edit attendance
@app.route("/api/attendance/edit", methods=["PUT"])
def editAttendance():
    try:
        body = request.get_json()
        time = body['time']
        date = body['date']
        classId = body['classId']
        status = body['status']
        enroll = body['enroll']
        print(time)
        print(date)
        if status == 'Present':
            class1 = Class.find_one({'_id': ObjectId(classId)})
            attend1 = class1['attendance']
            print(attend1)

            for ele in attend1:
                if ele['date'] == date and ele['time'] == time:
                    ele['presentStudents'].remove(enroll)

            update1 = Class.update_one({"_id": ObjectId(classId)}, {
                "$set": {
                    'attendance': attend1

                }
            })
            return jsonify({'success': True, 'message': "attendance updated!"}), 200
        else:
            class2 = Class.find_one({'_id': ObjectId(classId)})
            attend2 = class2['attendance']

            for ele in attend2:
                if ele['date'] == date and ele['time'] == time:
                    print(ele)
                    ele['presentStudents'].append(enroll)

            update2 = Class.update_one({"_id": ObjectId(classId)}, {
                "$set": {
                    'attendance': attend2

                }
            })
            return jsonify({'success': True, 'message': "attendance updated!"}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal Server Error"}), 500


# todo : get TimeTable
@app.route("/api/timetable/<int:room>", methods=["GET"])
def getTimeTable(room):
    try:
        tt = TimeTable.find_one({"roomNo": room})
        d = datetime.today()
        day = d.strftime("%a")
        table = tt[day]
        periods = []
        for t in table:
            info = {
                "startTime": t["startTime"],
                "endTime": t["endTime"],
                "class": {
                    "className": t['class']['className'],
                    "classId": str(t['class']['classId']),
                },
                "user": {
                    "userName": t['user']['userName'],
                    "userId": str(t['user']['userId']),
                },
            }
            periods.append(info)

        return jsonify({"success": True, "timeTable": periods}), 200
    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": 'Internal Server Error'}), 500


# todo: get timeTables
@app.route("/api/timetables", methods=["GET",])
def getTimetables():
    try:
        timeTables = TimeTable.find({})

        data = []
        for t in timeTables:
            info = {}
            info['_id'] = str(t['_id'])
            info['roomNo'] = t['roomNo']
            periods = []
            for p in t['Mon']:
                period = {
                    'startTime': p['startTime'],
                    'endTime': p['endTime'],
                    'user': {
                        'userName': p['user']['userName'],
                        'userId': str(p['user']['userId']),
                    },
                    'class': {
                        'className': p['class']['className'],
                        'classId': str(p['class']['classId']),
                    }
                }
                periods.append(period)
            info['Mon'] = periods
            periods = []
            for p in t['Tue']:
                period = {
                    'startTime': p['startTime'],
                    'endTime': p['endTime'],
                    'user': {
                        'userName': p['user']['userName'],
                        'userId': str(p['user']['userId']),
                    },
                    'class': {
                        'className': p['class']['className'],
                        'classId': str(p['class']['classId']),
                    }
                }
                periods.append(period)
            info['Tue'] = periods
            periods = []
            for p in t['Wed']:
                period = {
                    'startTime': p['startTime'],
                    'endTime': p['endTime'],
                    'user': {
                        'userName': p['user']['userName'],
                        'userId': str(p['user']['userId']),
                    },
                    'class': {
                        'className': p['class']['className'],
                        'classId': str(p['class']['classId']),
                    }
                }
                periods.append(period)
            info['Wed'] = periods
            periods = []
            for p in t['Thu']:
                period = {
                    'startTime': p['startTime'],
                    'endTime': p['endTime'],
                    'user': {
                        'userName': p['user']['userName'],
                        'userId': str(p['user']['userId']),
                    },
                    'class': {
                        'className': p['class']['className'],
                        'classId': str(p['class']['classId']),
                    }
                }
                periods.append(period)
            info['Thu'] = periods
            periods = []
            for p in t['Fri']:
                period = {
                    'startTime': p['startTime'],
                    'endTime': p['endTime'],
                    'user': {
                        'userName': p['user']['userName'],
                        'userId': str(p['user']['userId']),
                    },
                    'class': {
                        'className': p['class']['className'],
                        'classId': str(p['class']['classId']),
                    }
                }
                periods.append(period)
            info['Fri'] = periods
            periods = []
            for p in t['Sat']:
                period = {
                    'startTime': p['startTime'],
                    'endTime': p['endTime'],
                    'user': {
                        'userName': p['user']['userName'],
                        'userId': str(p['user']['userId']),
                    },
                    'class': {
                        'className': p['class']['className'],
                        'classId': str(p['class']['classId']),
                    }
                }
                periods.append(period)
            info['Sat'] = periods
            data.append(info)
        return jsonify({'success': True, 'timetables': data}), 200
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': "Internal server error"}), 500


# todo: create timetable
@app.route("/api/timetables/create", methods=["POST"])
def createTimeTable():
    try:
        body = request.get_json()
        roomNo = int(body['roomNo'])
        check = TimeTable.find_one({'roomNo': roomNo})
        print(check)
        if check:
            return jsonify({"success": False, "message": "Time-Table for room already exists!"}), 400

        data = {}
        data['roomNo'] = roomNo

        monPeriod = []
        for p in body['Mon']:
            info = {}
            info['startTime'] = p['startTime']
            info['endTime'] = p['endTime']
            cl = {
                'className': p['class']['className'],
                'classId': ObjectId(p['class']['classId']),
            }
            info['class'] = cl
            user = {
                'userName': p['user']['userName'],
                'userId': ObjectId(p['user']['userId']),
            }
            info['user'] = user
            monPeriod.append(info)

        tuePeriod = []
        for p in body['Tue']:
            info = {}
            info['startTime'] = p['startTime']
            info['endTime'] = p['endTime']
            cl = {
                'className': p['class']['className'],
                'classId': ObjectId(p['class']['classId']),
            }
            info['class'] = cl
            user = {
                'userName': p['user']['userName'],
                'userId': ObjectId(p['user']['userId']),
            }
            info['user'] = user
            tuePeriod.append(info)

        wedPeriod = []
        for p in body['Wed']:
            info = {}
            info['startTime'] = p['startTime']
            info['endTime'] = p['endTime']
            cl = {
                'className': p['class']['className'],
                'classId': ObjectId(p['class']['classId']),
            }
            info['class'] = cl
            user = {
                'userName': p['user']['userName'],
                'userId': ObjectId(p['user']['userId']),
            }
            info['user'] = user
            wedPeriod.append(info)

        thuPeriod = []
        for p in body['Thu']:
            info = {}
            info['startTime'] = p['startTime']
            info['endTime'] = p['endTime']
            cl = {
                'className': p['class']['className'],
                'classId': ObjectId(p['class']['classId']),
            }
            info['class'] = cl
            user = {
                'userName': p['user']['userName'],
                'userId': ObjectId(p['user']['userId']),
            }
            info['user'] = user
            thuPeriod.append(info)

        friPeriod = []
        for p in body['Fri']:
            info = {}
            info['startTime'] = p['startTime']
            info['endTime'] = p['endTime']
            cl = {
                'className': p['class']['className'],
                'classId': ObjectId(p['class']['classId']),
            }
            info['class'] = cl
            user = {
                'userName': p['user']['userName'],
                'userId': ObjectId(p['user']['userId']),
            }
            info['user'] = user
            friPeriod.append(info)

        satPeriod = []
        for p in body['Sat']:
            info = {}
            info['startTime'] = p['startTime']
            info['endTime'] = p['endTime']
            cl = {
                'className': p['class']['className'],
                'classId': ObjectId(p['class']['classId']),
            }
            info['class'] = cl
            user = {
                'userName': p['user']['userName'],
                'userId': ObjectId(p['user']['userId']),
            }
            info['user'] = user
            satPeriod.append(info)

        data['Mon'] = monPeriod
        data['Tue'] = tuePeriod
        data['Wed'] = wedPeriod
        data['Thu'] = thuPeriod
        data['Fri'] = friPeriod
        data['Sat'] = satPeriod

        newTimeTable = TimeTable.insert_one(data).inserted_id
        if newTimeTable:
            return jsonify({"success": True, "message": "Time-Table saved successfully!"}), 201

        else:
            return jsonify({"success": False, "message": "Unable to save time table now!"}), 400

    except Exception as e:
        print(e)
        return jsonify({"success": False, "message": "Internal Server Error"}), 500


# todo: delete timetable
@app.route("/api/timetable/delete/<string:id>", methods=['DELETE'])
def deleteTimetable(id):
    try:
        deleted = TimeTable.delete_one({'_id': ObjectId(id)})
        if deleted:
            return jsonify({'success': True, 'message': 'Timetable deleted successfully'}), 200
        else:
            return jsonify({'success': False, 'message': "Unable to delete Timetable!"}), 400
    except Exception as e:
        print(e)
        return jsonify({'success': False, 'message': 'Internal Server Error'}), 500


if __name__ == '__main__':
    app.run(debug=True)
