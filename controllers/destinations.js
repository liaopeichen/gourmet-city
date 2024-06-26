const Destination = require("../models/destination");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const destinations = await Destination.find({});
  res.render("destinations/index", { destinations });
};

module.exports.renderNewForm = (req, res) => {
  return res.render("destinations/new");
};

module.exports.createDestination = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({ query: req.body.destination.location, limit: 1 })
    .send();
  const destination = new Destination(req.body.destination);
  destination.geometry = geoData.body.features[0].geometry;
  destination.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  destination.author = req.user._id;
  destination.createdAt = new Date();
  await destination.save();

  req.flash("success", "Successfully made a new destination!");
  res.redirect(`/destinations/${destination._id}`);
};

module.exports.showDestination = async (req, res) => {
  const destination = await Destination.findById(req.params.id)
    .populate({
      path: "reviews",
      options: {
        sort: { _id: -1 },
      },
      populate: { path: "author" },
    })
    .populate("author");
  if (!destination) {
    req.flash("error", "Destination Not Found!");
    return res.redirect("/destinations");
  }
  return res.render("destinations/show", { destination });
};

module.exports.renderEditForm = async (req, res) => {
  const destination = await Destination.findById(req.params.id);
  if (!destination) {
    req.flash("error", "Destination Not Found!");
    return res.redirect("/destinations");
  }
  res.render("destinations/edit", { destination });
};

module.exports.updateDestination = async (req, res) => {
  const { id } = req.params;
  const destination = await Destination.findByIdAndUpdate(id, {
    ...req.body.destination,
  });

  if (
    req.body.deleteImages &&
    destination.images.length === req.body.deleteImages.length
  ) {
    req.flash(
      "error",
      "Deleting image(s) failed. You must keep at least one image in the destination!"
    );
    return res.redirect(`/destinations/${id}`);
  }

  if (req.files.length > 0) {
    const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
    destination.images.push(...imgs);
  }

  await destination.save();

  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await destination.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated destination!");
  res.redirect(`/destinations/${id}`);
};

module.exports.destroyDestination = async (req, res) => {
  const { id } = req.params;
  await Destination.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted destination!");
  res.redirect("/destinations");
};
