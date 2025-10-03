var express = require('express');
var router = express.Router();
const { connectToDB, ObjectId } = require('../utils/db');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* Handle the Form */
router.post('/booking', async function (req, res) {
  const db = await connectToDB();
  try {
    // Convert and validate form data
    req.body.numTickets = parseInt(req.body.numTickets);
    req.body.terms = req.body.terms ? true : false;
    req.body.created_at = new Date();
    req.body.modified_at = new Date();

    // Insert into database and get ID
    let result = await db.collection("bookings").insertOne(req.body);
    
    // Return just the ID in the response
    res.status(201).json({ 
      id: result.insertedId 
    });

  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

/* Display all Bookings */
router.get('/booking', async function (req, res) {
    const db = await connectToDB();
    try {
        let results = await db.collection("bookings").find().toArray();
        res.render('bookings', { bookings: results });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});

/* Display a single Booking */
router.get('/booking/read/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('booking', { booking: result });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Delete a single Booking
router.post('/booking/delete/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount > 0) {
      res.status(200).json({ message: "Booking deleted" });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// display the update form
router.get('/booking/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    let result = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
    if (result) {
      res.render('update', { booking: result });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Update a single Booking
router.post('/booking/update/:id', async function (req, res) {
  const db = await connectToDB();
  try {
    req.body.numTickets = parseInt(req.body.numTickets);
    req.body.terms = req.body.terms? true : false;
    req.body.superhero = req.body.superhero || "";
    req.body.modified_at = new Date();

    let result = await db.collection("bookings").updateOne({ _id: new ObjectId(req.params.id) }, { $set: req.body });

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Booking updated" });
    } else {
      res.status(404).json({ message: "Booking not found" });
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Search Bookings
router.get('/booking/search', async function (req, res) {
  const db = await connectToDB();
  try {
    let query = {};
    if (req.query.email) {
      query.email = { $regex: req.query.email };
    }
    if (req.query.numTickets) {
      query.numTickets = parseInt(req.query.numTickets);
    }

    let result = await db.collection("bookings").find(query).toArray();
    res.render('bookings', { bookings: result });
  } catch (err) {
    res.status(400).json({ message: err.message });
  } finally {
    await db.client.close();
  }
});

// Pagination based on query parameters page and limit, also returns total number of documents
router.get('/booking/paginate', async function (req, res) {
  const db = await connectToDB();
  try {
    // Parse and validate pagination parameters
    let page = parseInt(req.query.page) || 1;
    let perPage = parseInt(req.query.perPage) || 10;
    
    // Validate page number (must be positive)
    if (page < 1) page = 1;
    
    // Validate perPage (must be between 1 and 100)
    if (perPage < 1) perPage = 10;
    if (perPage > 100) perPage = 100;
    
    let skip = (page - 1) * perPage;

    // Get total count first to validate page number
    let total = await db.collection("bookings").countDocuments();
    let totalPages = Math.ceil(total / perPage);
    
    // If page exceeds total pages, redirect to last page
    if (page > totalPages && totalPages > 0) {
      return res.redirect(`/booking/paginate?page=${totalPages}&perPage=${perPage}`);
    }

    // Fetch paginated results with sorting (newest first)
    let result = await db.collection("bookings")
      .find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(perPage)
      .toArray();

    res.render('paginate', { 
      bookings: result, 
      total: total, 
      page: page, 
      perPage: perPage,
      totalPages: totalPages
    });
  } catch (err) {
    console.error('Pagination error:', err);
    res.status(400).json({ message: err.message });
  }
  finally {
    await db.client.close();
  }
});

module.exports = router;
