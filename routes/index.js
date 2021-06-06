const express = require('express')
const {ensureAuthenticated}= require('../config/auth')
const router = express.Router();

// Cockroach DB Conf
const fs = require('fs');
const { Pool } = require("pg");
const config = {
  user: "blunt_5",
  password: "oyANkRedv7Hu5cuZ",
  host: "free-tier6.gcp-asia-southeast1.cockroachlabs.cloud",
  database: "visittus-204.defaultdb",
  port: 26257,
  ssl: {
    rejectUnauthorized: true,
  },
  //For secure connection:
  // ssl: {
  //       ca: fs.readFileSync(__dirname+ '/cc-ca.crt')
  //           .toString()
  //   }
};

const pool = new Pool(config);
// const getUsers = (request, response) => {
//   pool.query('CREATE TABLE hits(id PRIMARY KEY INT AUTO_INCREMENT, count INT)', (error, results) => {
//     if (error) {
//       console.log(error)
//     }
//     console.log(results)
//   })
// }

pool.connect(function (err, client, done) {

    // Close the connection to the database and exit
    var finish = function () {
        done();
        process.exit();
    };

    if (err) {
        console.error('Error connecting to the CockroachDB', err);
        finish();
    }
  })

router.get("/",(req, res)=>{

  // pool.query('CREATE TABLE IF NOT EXISTS hits (id INT PRIMARY KEY, count INT NOT NULL);', (error, results) => {
  //   if (error) {
  //     throw error
  //   }
    // console.log(results)
  // })

  // pool.query('INSERT INTO hits (id, count) VALUES(1, 1)', (error, results) => {
  //   if (error) {
  //     throw error
  //   }
  //   console.log(results)
  // })

  let initCount = 0;
  pool.query('SELECT count from hits where id=1', (error, results) => {
    if (error) {
      throw error
    }
    initCount  = parseInt(results.rows[0].count) + 1

    var query = {
        text: 'UPDATE hits SET count = $1 WHERE id = 1',
        values: [initCount],
      }

      pool.query(query, (error, results) => {
        if (error) {
          throw error
        }
      })

      res.render("welcome", {count: initCount})

  })



})

router.get("/dashboard", ensureAuthenticated,(req, res)=>{
  res.render("dashboard", {
    user: req.user
  })
})


module.exports = router;
