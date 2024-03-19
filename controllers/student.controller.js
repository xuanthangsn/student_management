const { validationResult, matchedData } = require("express-validator");

const knex = require("../db");
const { operatorMap } = require("../constants/index");
const formatDateOject = require("../helpers/formatDateObject");

module.exports = {
  getAll: async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const data = matchedData(req);
    const sort_by = data["sort_by"]?.eq;
    const sort_order = data["sort_order"]?.eq;
    const page_size = data["page_size"]?.eq;
    const page = data["page"]?.eq;

    delete data["sort_by"];
    delete data["sort_order"];
    delete data["page_size"];
    delete data["page"];

    // construct the query
    let rows;
    try {
      let query = knex("students").select("*");

      Object.keys(data).forEach((field, i) => {
        Object.keys(data[field]).forEach((operator, j) => {
          const value =
            operator === "like"
              ? `%${data[field][operator]}%`
              : data[field][operator];
          if (i === 0 && j === 0) {
            query.where(field, operatorMap.get(operator), value);
          } else {
            query.andWhere(field, operatorMap.get(operator), value);
          }
        });
      });

      if (sort_by !== undefined) {
        query = query.orderBy(sort_by, sort_order || "asc");
      }

      if (page_size !== undefined) {
        let offset = page === undefined ? 0 : (page - 1) * page_size;
        query = query.limit(page_size).offset(offset);
      }

      rows = await query;
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error querying database",
      });
    }

    // no paging request
    if (page_size === undefined) {
      return res.json(rows);
    }

    // paging request
    // calculate the total page
    let totalRecord;
    try {
      const query = knex("students").count("* as total");

      Object.keys(data).forEach((field, i) => {
        Object.keys(data[field]).forEach((operator, j) => {
          const value =
            operator === "like"
              ? `%${data[field][operator]}%`
              : data[field][operator];
          if (i === 0 && j === 0) {
            query.where(field, operatorMap.get(operator), value);
          } else {
            query.andWhere(field, operatorMap.get(operator), value);
          }
        });
      });

      const result = await query;
      totalRecord = result[0].total;
    } catch (err) {
      return res.status(500).json({
        message: "Error querying database",
      });
    }

    return res.json({
      data: rows,
      meta: {
        totalPage:
          totalRecord % page_size === 0
            ? totalRecord / page_size
            : Math.floor(totalRecord / page_size) + 1,
        currentPage: page || 1,
      },
    });
  },
  getOne: async (req, res, next) => {
    const id = req.params.id;

    try {
      const rows = await knex("students").select("*").where("id", id);
      return res.json(rows[0] || {});
    } catch (err) {
      return res.stauts(500).json({
        message: "Error querying database",
      });
    }
  },

  //allow mass insertion
  create: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    // collect the valid data from req body
    const students = [];
    const data = matchedData(req);
    Object.keys(data).forEach((key) => {
      students.push({
        created_by: req.user?.id,
        created_at: formatDateOject(new Date()),
        ...data[key],
      });
    });

    if (students.length === 0) {
      return res.status(400).json({ message: "Empty payload data" });
    }

    // insert students to the database using batch insert
    try {
      // try to insert using batch insert, all of the insertions is done inside a transaction, which means that if 1 insertion fails, the whole insertion process fails as well
      await knex.batchInsert("students", students);
      console.log("Student or students created successfully");
      return res
        .status(201)
        .json({ message: "Student or students created successfully" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Failed to create student",
      });
    }
  },

  // only allow update one student at a time
  update: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    const id = req.params.id;
    const currentUser = req.user;
    let student;
    // check whether the provided id belongs to a student
    try {
      const rows = await knex("students").select("id").where("id", id);
      if (rows.length === 0) {
        return res.status(400).json({ message: "No student found" });
      }
      student = row[0];
    } catch (err) {
      return res.status(500).json({
        message: "Error querying database",
      });
    }

    const updateData = {
      ...matchedData(req),
      updated_by: currentUser.id,
      updated_at: formatDateOject(new Date()),
    };

    try {
      await knex("students").where("id", id).update(updateData);
      console.log("Student updated successfully");
      return res.json({
        mesasge: "Student updated successfully",
        student: { ...student, ...updateData },
      });
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: "Failed to update student",
      });
    }
  },

  // allow update multiple student at a time
  bulkUpdate: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    // data object contains both query data and body data
    const data = matchedData(req);
    let updateData = Object.create(null);

    // parse body data to a seperate object
    Object.keys(data).forEach((e) => {
      if (
        e === "firstname" ||
        e === "lastname" ||
        e === "phone_number" ||
        e === "gender" ||
        e === "address"
      ) {
        updateData[e] = data[e];
        delete data[e];
      }
    });

    updateData = {
      ...updateData,
      updated_at: formatDateOject(new Date()),
      updated_by: req.user?.id,
    };

    // find all the student's id to be updated
    let ids;
    try {
      // build the query
      let query = knex("students").select("id");
      Object.keys(data).forEach((field, i) => {
        Object.keys(data[field]).forEach((op, j) => {
          const value =
            op === "like" ? `%${data[field][op]}%` : data[field][op];
          if (i === 0 && j === 0) {
            query.where(field, operatorMap.get(op), value);
          } else {
            query.andWhere(field, operatorMap.get(op), value);
          }
        });
      });
      ids = await query;
      ids = ids.map((obj) => {
        return obj.id;
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error querying database" });
    }

    // open a transaction to update each of the rows separately

    try {
      await knex.transaction(async (trx) => {
        ids.forEach(async id => {
          await trx('students').where('id', id).update(updateData);
        })
      });

      console.log("Successfully updating students")
      // return a list of affected rows
      return res.json({ message: "Students or student updated successfully", affectedRows: ids});
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to update" });
    }
  },
  // only allow delete one student at a time
  delete: async (req, res, next) => {
    const id = req.params.id;

    // check whether the specified student exists
    try {
      const rows = await knex("students").select("id").where("id", id);
      if (rows.length === 0) {
        return res.status(400).json({ message: "No student found" });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error querying database",
      });
    }

    try {
      await knex("students")
        .where("id", id)
        .update({
          deleted_by: req.user?.id,
          deleted_at: formatDateOject(new Date()),
        });

      return res.status(204);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to delete student" });
    }
  },

  bulkDelete: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }

    // data contains all query params data
    const data = matchedData(req);

    // find all the student's id to be deleted
    let ids;
    try {
      // build the query
      let query = knex("students").select("id");
      Object.keys(data).forEach((field, i) => {
        Object.keys(data[field]).forEach((op, j) => {
          const value =
            op === "like" ? `%${data[field][op]}%` : data[field][op];
          if (i === 0 && j === 0) {
            query.where(field, operatorMap.get(op), value);
          } else {
            query.andWhere(field, operatorMap.get(op), value);
          }
        });
      });
      ids = await query;
      ids = ids.map((obj) => {
        return obj.id;
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error querying database" });
    }

    // open a transaction to soft delete all the rows
    try {
      await knex.transaction(async trx => {
        const updateData = {
          deleted_by: req.user?.id,
          deleted_at: formatDateOject(new Date())
        }

        ids.forEach(async id => {
          await trx('students').where('id', id).update(updateData)
        })

      })
      return res.status(200).json({mesasge: "Successfully soft delete students", affectedRows: ids})
    } catch (err) {
      console.log(err);
      return res.status(500).json({message: "Failed to delete students"})
    }

  }
};
