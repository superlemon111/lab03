var express = require('express');
var router = express.Router();

const { connectToDB, ObjectId } = require('../utils/db');

// routes

module.exports = router;

router.get('/', async function (req, res) {
    const db = await connectToDB();
    try {
        let query = {};
        if (req.query.email) {
            // query.email = req.query.email;
            query.email = { $regex: req.query.email };
        }
        if (req.query.numTickets) {
            query.numTickets = parseInt(req.query.numTickets);
        }

        let page = parseInt(req.query.page) || 1;
        let perPage = parseInt(req.query.perPage) || 10;
        let skip = (page - 1) * perPage;

        let result = await db.collection("bookings").find(query).skip(skip).limit(perPage).toArray();
        let total = await db.collection("bookings").countDocuments(query);

        res.json({ bookings: result, total: total, page: page, perPage: perPage });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
    finally {
        await db.client.close();
    }
});


// New Booking
router.post('/', async function (req, res) {
    const db = await connectToDB();
    try {
        req.body.numTickets = parseInt(req.body.numTickets);
        req.body.terms = req.body.terms? true : false;
        req.body.created_at = new Date();

        let result = await db.collection("bookings").insertOne(req.body);
        res.status(201).json({ id: result.insertedId });
    } catch (err) {
        res.status(400).json({ message: err.message });
    } finally {
        await db.client.close();
    }
});


/* Retrieve a single Booking */
router.get('/:id', async function (req, res) {
    const db = await connectToDB();
    try {
        let result = await db.collection("bookings").findOne({ _id: new ObjectId(req.params.id) });
        if (result) {
            res.json(result);   
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
router.put('/:id', async function (req, res) {
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


// Delete a single Booking
router.delete('/:id', async function (req, res) {
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