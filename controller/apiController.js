const Item = require("../models/Item");
const Treasure = require("../models/Activity");
const Travelers = require("../models/Booking");
const Category = require("../models/Category");
const Bank = require("../models/Bank");
const Booking = require("../models/Booking");
const Member = require("../models/Member");

module.exports = {
  landingPage: async (req, res) => {
    try {
      const mostPicked = await Item.find()
        .select("_id title price imageId country city unit")
        .limit(5)
        .populate({ path: "imageId", select: "_id imageUrl" });

      const category = await Category.find()
        .select("_id name")
        .limit(3)
        .populate({
          path: "itemId",
          select: "_id title country city isPopular imageId",
          perDocumentLimit: 4,
          option: { sort: { sumBooking: -1 } },
          populate: {
            path: "imageId",
            select: "_id imageUrl",
            perDocumentLimit: 1,
          },
        });

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "/images/testimonial2.jpg",
        name: "Happy Family",
        rate: 4.55,
        content:
          "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };

      const travelers = await Travelers.find();
      const treasures = await Treasure.find();
      const city = await Item.find();

      for (let i = 0; i < category.length; i++) {
        for (let j = 0; j < category[i].itemId.length; j++) {
          for (let k = 0; k < category[i].itemId[j].imageId.length; k++) {
            const item = await Item.findOne({
              _id: category[i].itemId[j]._id,
            });
            item.isPopular = false;
            await item.save();
            if (category[i].itemId[0] === category[i].itemId[j]) {
              item.isPopular = true;
              item.save();
            }
          }
        }
      }

      res.status(200).json({
        hero: {
          travelers: travelers.length,
          treasures: treasures.length,
          city: city.length,
        },
        mostPicked,
        category,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  detailPage: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({
          path: "featureId",
          select: "_id name qty imageUrl",
        })
        .populate({
          path: "activityId",
          select: "_id name type imageUrl",
        })
        .populate({ path: "imageId", select: "_id imageUrl" });

      const bank = await Bank.find();

      const testimonial = {
        _id: "asd1293uasdads1",
        imageUrl: "/images/testimonial1.jpg",
        name: "Happy Family",
        rate: 4.55,
        content:
          "What a great trip with my family and I should try again next time soon ...",
        familyName: "Angga",
        familyOccupation: "Product Designer",
      };

      res.status(200).json({
        ...item._doc,
        bank,
        testimonial,
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  bookingPage: async (req, res) => {
    try {
      const {
        idItem,
        duration,
        // price,
        bookingStartDate,
        bookingEndDate,
        firstName,
        lastName,
        email,
        phoneNumber,
        accountHolder,
        bankFrom,
      } = req.body;

      if (!req.file) {
        res.status(404).json({ message: "Please upload a photo" });
      }

      if (
        idItem === undefined ||
        duration === undefined ||
        // price === undefined ||
        bookingStartDate === undefined ||
        bookingEndDate === undefined ||
        firstName === undefined ||
        lastName === undefined ||
        email === undefined ||
        phoneNumber === undefined ||
        accountHolder === undefined ||
        bankFrom === undefined
      ) {
        res.status(404).json({ message: "Please fill all the field" });
      }

      const item = await Item.findOne({ _id: idItem });
      if (!item) {
        res.status(404).json({ message: "Item not found" });
      }

      item.sumBooking += 1;
      await item.save();

      let total = item.price * duration;
      let tax = total * 0.1;
      const invoice = Math.floor(1000000 + Math.random() * 9000000);

      const member = await Member.create({
        firstName,
        lastName,
        email,
        phoneNumber,
      });

      const newBooking = {
        invoice,
        bookingStartDate,
        bookingEndDate,
        total: total + -tax,
        itemId: {
          _id: item.id,
          title: item.title,
          price: item.price,
          duration,
        },
        memberId: member.id,
        payments: {
          proofPayment: `images/${req.file.filename}`,
          bankFrom,
          accountHolder,
        },
      };

      const booking = await Booking.create(newBooking);

      res.status(201).json({ message: "Success" });
    } catch (error) {
      console.log(error);
    }
  },
};
