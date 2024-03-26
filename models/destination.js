const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("cardImage").get(function () {
  return this.url.replace("/upload", "/upload/ar_1.45,c_crop");
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } };

const DestinationSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: {
      lower: {
        type: Number,
        required: true,
      },
      higher: {
        type: Number,
        required: true,
      },
    },
    description: String,
    location: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

DestinationSchema.virtual("relativeTime").get(function () {
  // Calculate relative time since destination creation
  const currentDate = new Date();
  const timeDifference = currentDate - this.createdAt;
  const daysSinceCreation = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

  // Add relative time to the destination object
  if (daysSinceCreation >= 30) {
    const monthsSinceCreation = Math.floor(daysSinceCreation / 30);

    if (monthsSinceCreation === 1) {
      return "1 month ago";
    } else {
      return `${monthsSinceCreation} months ago`;
    }
  } else if (daysSinceCreation >= 7) {
    const weeksSinceCreation = Math.floor(daysSinceCreation / 7);

    if (weeksSinceCreation === 1) {
      return "1 week ago";
    } else {
      return `${weeksSinceCreation} weeks ago`;
    }
  } else if (daysSinceCreation === 1) {
    return "1 day ago";
  } else if (daysSinceCreation > 1) {
    return `${daysSinceCreation} days ago`;
  } else {
    const hoursSinceCreation = Math.floor(timeDifference / (1000 * 60 * 60));

    if (hoursSinceCreation >= 1) {
      return `${hoursSinceCreation} hours ago`;
    } else {
      const minutesSinceCreation = Math.floor(timeDifference / (1000 * 60));

      return `${minutesSinceCreation} minutes ago`;
    }
  }
});

DestinationSchema.virtual("properties.popUpMarkup").get(function () {
  return `
  <strong><a href="/destinations/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 20)}...</p>`;
});

DestinationSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
    for (let img of doc.images) {
      await cloudinary.uploader.destroy(img.filename);
    }
  }
});

module.exports = mongoose.model("Destination", DestinationSchema);
