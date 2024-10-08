const { db } = require("../config/db");
const xlsx = require('xlsx');
const multer = require('multer')

const StudentController = {

  getStudents: async (req, res) => {
    console.log('hahahah');

    try {
      const query = "SELECT * FROM students";

      const [students] = await db.execute(query);

      res.json(students);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  getStudent: async (req, res) => {
    try {
      const { id } = req.params;

      const query = "SELECT * FROM students WHERE id = ?";
      const [students] = await db.execute(query, [id]);

      res.json(students[0]);
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  createStudent: async (req, res) => {
    try {
      const {
        name,
        date,
        sex,
        city,
        address,
        hobby,
        haircolor,
        letter,
        facebook,
        class_code,
        account,
        password,
        description,
      } = req.body;

      const createQuery =
        "INSERT INTO students (name, date, sex, city, address, hobby, haircolor, letter, facebook, class_code, account, password, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      const values = [
        name,
        date,
        sex,
        city,
        address,
        hobby,
        haircolor,
        letter,
        facebook,
        class_code,
        account,
        password,
        description,
      ];

      const [result] = await db.execute(createQuery, values);

      res.status(201).json({
        message: "Create student successfully",
        studentId: result.insertId,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  updateStudent: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        name,
        date,
        sex,
        city,
        address,
        hobby,
        haircolor,
        letter,
        facebook,
        class_code,
        account,
        password,
        description,
      } = req.body;

      const updateValues = {
        name,
        date,
        sex,
        city,
        address,
        hobby,
        haircolor: haircolor,
        letter,
        facebook,
        class_code,
        account,
        password,
        description,
      };

      let updateQuery = "UPDATE students SET";
      const updateFields = Object.keys(updateValues);
      updateFields.forEach((field, index) => {
        updateQuery += ` ${field} = ?`;
        if (index < updateFields.length - 1) updateQuery += ",";
      });
      updateQuery += " WHERE id = ?";

      const values = [...Object.values(updateValues), id];

      const [result] = await db.execute(updateQuery, values);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.json({
        message: "Update student successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  deleteStudent: async (req, res) => {
    try {
      const { id } = req.params;

      const deleteQuery = "DELETE FROM students WHERE id = ?";

      const [result] = await db.execute(deleteQuery, [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json({ message: "Delete student successfully" });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  deleteStudents: async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || ids.length === 0) {
        return res.status(400).json({ message: "Không có Sinh viên" });
      }

      const validIds = ids.every(id => Number.isInteger(id));
      if (!validIds) {
        return res.status(400).json({ message: "ID không hợp lệ" });
      }

      const placeholders = ids.map(() => "?").join(", ");
      const deleteQuery = `DELETE FROM students WHERE id IN (${placeholders})`;

      const [result] = await db.execute(deleteQuery, ids);

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Không tìm thấy sinh viên" });
      }
      console.log("Xóa sinh viên số: ", ids);
      res.status(200).json({ message: `Xóa ${result.affectedRows} thành công` });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  searchStudents: async (req, res) => {
    try {
      const { name } = req.query;

      if (!name) {
        return res.status(400).json({ message: "Nhap ten de tim kiem" });
      }

      const searchQuery = "SELECT * FROM students WHERE name LIKE ?";
      const searchValue = `%${name}%`;

      const [students] = await db.execute(searchQuery, [searchValue]);
      console.log("SearchQuery", searchQuery);


      if (students.length === 0) {
        return res.status(404).json({ message: "Khong co sinh vien" });
      }

      res.json({
        message: "Search successful",
        data: students,
      });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },


  copyStudent: async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || ids.length === 0) {
        return res.status(400).json({ message: "Không có sinh viên để sao chép" });
      }

      const placeholders = ids.map(() => "?").join(", ");
      const copyQuery = `
      INSERT INTO students (name,
        date,
        sex,
        city,
        address,
        hobby,
        haircolor,
        letter,
        facebook,
        class_code,
        account,
        password,
        description)
      SELECT name,
        date,
        sex,
        city,
        address,
        hobby,
        haircolor,
        letter,
        facebook,
        class_code,
        account,
        password,
        description
      FROM students
      WHERE id IN (${placeholders});
    `;

      const [result] = await db.execute(copyQuery, ids);

      res.status(200).json({ message: `Sao chép ${result.affectedRows} bản ghi thành công` });
    } catch (error) {
      res.status(500).json({
        message: "Internal server error",
        error: error.message,
      });
    }
  },

  importStudents: async (req, res) => {
    console.log("Đang import...");

    if (!req.file) {
      return res.status(400).json({ message: "Không có file" });
    }

    try {
      const workbook = xlsx.read(req.file.buffer);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = xlsx.utils.sheet_to_json(sheet);

      if (data.length === 0) {
        return res.status(400).json({ message: "Không tìm thấy sinh viên" });
      }

      const insertQuery = `
      INSERT INTO students (name, date, sex, city, address, hobby, haircolor, letter, facebook, class_code, account, password, description)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      for (const student of data) {
        let formattedDate = "";
        if (student.date) {
          const date = new Date(student.date);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          } else {
            console.error(`Invalid date value: ${student.date}`);
            break;
          }
        }

        await db.execute(insertQuery, [
          student.name,
          formattedDate || null,
          student.sex,
          student.city,
          student.address,
          student.hobby,
          student.haircolor,
          student.letter,
          student.facebook,
          student.class_code,
          student.account,
          student.password,
          student.description
        ]);
      }

      res.status(201).json({ message: `${data.length} sinh viên được import thành công` });
    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  },


  exportStudentsByIds: async (req, res) => {
    const studentIds = req.body.ids; // Lấy mảng ID từ body
    console.log(`Đang xuất thông tin sinh viên với IDs: ${studentIds}...`);

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ message: "Vui lòng cung cấp danh sách ID sinh viên" });
    }

    try {
      // Tạo một workbook mới
      const workbook = xlsx.utils.book_new();

      // Lặp qua từng ID sinh viên để lấy thông tin
      for (const studentId of studentIds) {
        // Lấy thông tin sinh viên từ cơ sở dữ liệu theo ID
        const query = "SELECT * FROM students WHERE id = ?";
        const [student] = await db.execute(query, [studentId]);

        if (student.length > 0) {
          // Chuyển đổi dữ liệu sinh viên thành dạng sheet
          const worksheet = xlsx.utils.json_to_sheet(student);
          // Thêm sheet vào workbook với tên tương ứng
          xlsx.utils.book_append_sheet(workbook, worksheet, `Student_${studentId}`);
        } else {
          console.error(`Không tìm thấy sinh viên với ID: ${studentId}`);
        }
      }

      // Đặt tên file xuất ra
      const filename = `students_${studentIds.join('_')}.xlsx`;

      // Gửi file về cho client
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

      // Ghi dữ liệu vào file và gửi về cho client
      const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
      res.send(buffer);

    } catch (error) {
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  },

};








module.exports = StudentController;
