import { Router } from "express";

import {
  validateParkSpot,
  validateIdParam,
} from "../middleware/validationMiddleware.js";
import { autheticateUser } from "../middleware/authMiddlewear.js";
import { validateAdminId } from "../middleware/authMiddlewear.js";

const router = Router();

import {
  getAllParkingSpots,
  getParkingSpot,
  createParkingSpot,
  editParkingSpot,
  deleteParkingSpot,
  showStats,
} from "../controllers/parkSpotsController.js";

router
  .route("/")
  .get(getAllParkingSpots)
  .post(autheticateUser, validateAdminId, validateParkSpot, createParkingSpot);

router.route("/stats").get(showStats);

router
  .route("/:id")
  .get(validateIdParam, getParkingSpot)
  .patch(
    autheticateUser,
    validateAdminId,
    validateIdParam,
    validateParkSpot,
    editParkingSpot
  )
  .delete(autheticateUser, validateAdminId, validateIdParam, deleteParkingSpot);

export default router;
