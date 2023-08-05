from flask_pymongo import pymongo


def createConnection():
    try:
        client = pymongo.MongoClient("mongodb://localhost:27017/")
        db = client["project"]
        return db
    except Exception as e:
        print(e)


def userModel():
    try:
        db = createConnection()
        userValidator = {
            "$jsonSchema": {
                "bsonType": "object",
                "title": "User Object Validation",
                "required": ["name", "email"],
                "properties": {
                    "name": {
                            "bsonType": "string",
                            "minLength": 5,
                            "description": "name must be a string and is required"
                    },
                    "email": {
                        "bsonType": "string",
                        "description": "email is required"
                    },

                }
            }
        }
        db.create_collection("users")
        db.command("collMod", "users", validator=userValidator)
    except Exception as e:
        print(e)


def classModel():
    try:
        db = createConnection()
        classValidator = {
            "$jsonSchema": {
                "bsonType": "object",
                "title": "Class Object Validation",
                "required": ["className", "userId"],
                "properties": {
                    "className": {
                            "bsonType": "string",
                            "description": "className must be a string and is required"
                    },
                    "userId": {
                        "bsonType": "objectId",
                        "description": "userId is a objectId and it is required"
                    },
                    "students": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "object",
                            "required": ["name", "enroll"],
                            "properties": {
                                    "name": {
                                        "bsonType": "string",
                                        "description": "name is required"
                                    },
                                "enroll": {
                                        "bsonType": "string",
                                        "description": "enroll is required"
                                        }

                            }
                        },

                    },
                    "createdAt": {
                        "bsonType": "date",

                    },
                    "attendance": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "object",
                            "required": ["time", "date"],
                            "properties": {
                                    "time": {
                                        "bsonType": "string",
                                    },
                                "date": {
                                        "bsonType": "string",
                                        },
                                "presentStudents": {
                                        "bsonType": "array",
                                        "items": {
                                            "bsonType": "string",
                                        },

                                        }
                            }
                        },

                    }

                }
            }
        }
        db.create_collection("classes")
        db.command("collMod", "classes", validator=classValidator)
    except Exception as e:
        print(e)


def timeTableModel():
    try:
        db = createConnection()
        timeTableValidator = {
            "$jsonSchema": {
                "bsonType": "object",
                "title": "TimeTable Object Validation",
                "required": ["roomNo"],
                "properties": {
                    "roomNo": {
                            "bsonType": "int",
                            "description": "roomNo must be a integer and is required"
                    },
                    "Mon": {
                        "bsonType": "array",
                        "items": {
                            "bsonType": "object",
                            "required": ["startTime", "endTime", "classId", "userId"],
                            "properties": {
                                "startTime": {
                                    "bsonType": "string"
                                },
                                "endTime": {
                                    "bsonType": "string"
                                },
                                "classId": {
                                    "bsonType": "objectId"
                                },
                                "userId": {
                                    "bsonType": "objectId"
                                }
                            }
                        }
                    }
                }
            }
        }
        db.create_collection("timetables")
        db.command("collMod", "timetables", validator=timeTableValidator)
    except Exception as e:
        print(e)


def getUserCollection():
    try:
        db = createConnection()
        User = db["users"]
        return User
    except Exception as e:
        print(e)


def getClassesCollection():
    try:
        db = createConnection()
        Class = db["classes"]
        return Class
    except Exception as e:
        print(e)


def getTimeTableCollection():
    try:
        db = createConnection()
        TimeTable = db["timetables"]
        return TimeTable
    except Exception as e:
        print(e)
