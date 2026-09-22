const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");

dotenv.config();

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] || "Platform Admin";

  if (!email || !password) {
    console.log("Usage: node seed/createSuperAdmin.js <email> <password> [name]");
    process.exit(1);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "superAdmin";
    existing.institution = null;
    existing.isActive = true;
    existing.academicStatus = "NOT_APPLICABLE";
    existing.placementStatus = "NOT_APPLICABLE";
    existing.employmentStatus = "NOT_APPLICABLE";
    existing.isEmailVerified = true;
    await existing.save();
    console.log(`✅ Existing user ${email} promoted to superAdmin`);
  } else {
    await User.create({
      name,
      email,
      password, // will be hashed by the pre-save hook
      role: "superAdmin",
      institution: null,
      academicStatus: "NOT_APPLICABLE",
      placementStatus: "NOT_APPLICABLE",
      employmentStatus: "NOT_APPLICABLE",
      isActive: true,
      isEmailVerified: true,
    });
    console.log(`✅ Super Admin created: ${email}`);
  }

  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});