const express = require("express");
const router  = express.Router();
const {
  getExperiences, getExperience,
  createExperience, updateExperience, deleteExperience,
  upvoteExperience, getByCompany, getMyExperiences,
} = require("../controllers/experienceController");
const { protect }   = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");

router.use(protect);

router.get("/",                      getExperiences);
router.get("/my",                    getMyExperiences);
router.get("/company/:companyId",    getByCompany);
router.get("/:id",                   getExperience);
router.post("/",                     createExperience);
router.put("/:id",                   updateExperience);
router.delete("/:id",                deleteExperience);
router.post("/:id/upvote",           upvoteExperience);

module.exports = router;