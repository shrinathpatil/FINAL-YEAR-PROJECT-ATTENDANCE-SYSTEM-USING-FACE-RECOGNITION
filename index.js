const d = new Date();
let time = d.toTimeString().split(" ")[0];
console.log(time);
console.log(time > "15:29:25");

/*
 *  Mon
 *  10:30:00 - 12:30:00 TestClass1 test123
 *  01:15:00 - 02:15:00 Class2 test_abc
 *  02:15:00 - 03:15:00 TestClass2 test123
 *  03:30:00 - 05:30:00 Class2 test_abc
 */
let t = d.getTime();
console.log(typeof t);
console.log((t - 1680630062650) / (1000 * 60));

const timeTable = {
  roomNo: "unique",
  Mon: [
    {
      startTime: "10:30:00",
      endTime: "12:30:00",
      class: "classId",
      user: "test123",
    },
    {
      startTime: "01:15:00",
      endTime: "02:15:00",
      class: "Class1",
      user: "test_abc",
    },
    {
      startTime: "02:15:00",
      endTime: "03:15:00",
      class: "TestClass2",
      user: "test123",
    },
    {
      startTime: "03:30:00",
      endTime: "05:30:00",
      class: "Class2",
      user: "test_abc",
    },
  ],
  Tue: [
    {
      startTime: "10:30:00",
      endTime: "12:30:00",
      class: "TestClass1",
      user: "test123",
    },
    {
      startTime: "01:15:00",
      endTime: "02:15:00",
      class: "Class1",
      user: "test_abc",
    },
    {
      startTime: "02:15:00",
      endTime: "03:15:00",
      class: "TestClass2",
      user: "test123",
    },
    {
      startTime: "03:30:00",
      endTime: "05:30:00",
      class: "Class2",
      user: "test_abc",
    },
  ],
  Wed: [
    {
      startTime: "10:30:00",
      endTime: "12:30:00",
      class: "TestClass1",
      user: "test123",
    },
    {
      startTime: "01:15:00",
      endTime: "02:15:00",
      class: "Class1",
      user: "test_abc",
    },
    {
      startTime: "02:15:00",
      endTime: "03:15:00",
      class: "TestClass2",
      user: "test123",
    },
    {
      startTime: "03:30:00",
      endTime: "05:30:00",
      class: "Class2",
      user: "test_abc",
    },
  ],
  Thur: [
    {
      startTime: "10:30:00",
      endTime: "12:30:00",
      class: "TestClass1",
      user: "test123",
    },
    {
      startTime: "01:15:00",
      endTime: "02:15:00",
      class: "Class1",
      user: "test_abc",
    },
    {
      startTime: "02:15:00",
      endTime: "03:15:00",
      class: "TestClass2",
      user: "test123",
    },
    {
      startTime: "03:30:00",
      endTime: "05:30:00",
      class: "Class2",
      user: "test_abc",
    },
  ],
  Fri: [
    {
      startTime: "10:30:00",
      endTime: "12:30:00",
      class: "TestClass1",
      user: "test123",
    },
    {
      startTime: "01:15:00",
      endTime: "02:15:00",
      class: "Class1",
      user: "test_abc",
    },
    {
      startTime: "02:15:00",
      endTime: "03:15:00",
      class: "TestClass2",
      user: "test123",
    },
    {
      startTime: "03:30:00",
      endTime: "05:30:00",
      class: "Class2",
      user: "test_abc",
    },
  ],
  Sat: [
    {
      startTime: "10:30:00",
      endTime: "12:30:00",
      class: "TestClass1",
      user: "test123",
    },
    {
      startTime: "01:15:00",
      endTime: "02:15:00",
      class: "Class1",
      user: "test_abc",
    },
    {
      startTime: "02:15:00",
      endTime: "03:15:00",
      class: "TestClass2",
      user: "test123",
    },
    {
      startTime: "03:30:00",
      endTime: "05:30:00",
      class: "Class2",
      user: "test_abc",
    },
  ],
};
