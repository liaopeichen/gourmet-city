const Destination = require("../models/destination");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const [destination, review] = await Promise.all([
    Destination.findById(req.params.id),
    Review.create({ ...req.body.review, author: req.user._id }),
  ]);

  destination.reviews.push(review);
  await Promise.all([review.save(), destination.save()]);

  req.flash("success", "Created new review!");
  res.redirect(`/destinations/${destination._id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  const [destinationUpdate, reviewDelete] = await Promise.all([
    Destination.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }),
    Review.findByIdAndDelete(reviewId),
  ]);

  if (!destinationUpdate || !reviewDelete) {
    throw new Error("Failed to delete review");
  }

  req.flash("success", "Successfully deleted review!");
  res.redirect(`/destinations/${id}`);
};
