const { db } = require("../config/db");
const ClassController = {

    getClass: async (req, res) => {
        console.log('hahahah');

        try {
            const query = "SELECT * FROM class";

            const [classes] = await db.execute(query);

            res.json(classes);
        } catch (error) {
            res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
    },

    getClassById: async (req, res) => {
        try {
            const { id } = req.params;

            const query = "SELECT * FROM class WHERE id = ?";
            const [classes] = await db.execute(query, [id]);

            res.json(classes[0]);
        } catch (error) {
            res.status(500).json({
                message: "Internal server error",
                error: error.message,
            });
        }
    },

};








module.exports = ClassController;
