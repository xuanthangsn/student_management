const knex = require("../db");
const bcrypt = require("bcryptjs");

const { validationResult, matchedData } = require("express-validator");
const formatDateOject = require("../helpers/formatDateObject");
const { operatorMap } = require('../constants/index');

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
      let query = knex("users").select("*");

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
      const query = knex("users").count("* as total");

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
      const rows = await knex("users").select("*").where("id", id);
      return res.json(rows[0])
    } catch (err) {
      return res.status(500).json({
        message: "Error querying database"
      })
    }
  },
  update: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    const data = matchedData(req);
    const id = req.params.id;
    const currentUser = req.user;

    if (currentUser.id !== id) {
      if (currentUser.role !== "admin") {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      let user;
      // check the identity of the given user
      try {
        rows = await knex("users").select("*").where("id", id);
        if (rows.length === 0) {
          return res.status(400).json({ message: "User not found" });
        }
        user = rows[0];
        if (user.role === "admin") {
          return res
            .status(400)
            .json({ message: "Unauthorized. Cannot update an admin" });
        }
      } catch (err) {
        return res.status(500).json({
          message: "Error querying database",
        });
      }
    }

    // now it's either the current user is updating itself or current user is an admin and try to update a qlht

    try {
      if (data.password) {
        data.password = bcrypt.hash(data.password, 12);
      }
      const updateData = {
        ...data,
        updated_at: formatDateOject(new Date()),
        updated_by: currentUser.id,
      };
      await knex("users").where("id", id).update(updateData);
      return res.status(200).json({ message: "Successfully update user" });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Failed to update user",
      });
    }
  },
  delete: async (req, res, next) => {
    const id = req.params.id;
    const currentUser = req.user;
    let rows;
    try {
      rows = await knex("users").select("*").where("id", id);
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error trying to retrieve identity of the deleted user",
      });
    }

    if (rows.length === 0) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const user = rows[0];
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Unauthorized",
      });
    }

    // now we can be sure that current user is admin and the user that is intend to be deleted is qlht
    try {
      await knex("users")
        .where("id", id)
        .update({
          deleted_at: formatDateOject(new Date()),
          deleted_by: currentUser.id,
        });

      return res.json(204);
    } catch (err) {
      return res.status(500).json({
        message: "Failed to delete user",
      });
    }
  },
};
