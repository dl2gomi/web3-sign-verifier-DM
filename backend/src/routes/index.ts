import { Router } from "express";

import Paths from "@/common/constants/Paths";
import VerificationRoutes from "./VerificationRoutes";

/******************************************************************************
                                Setup
******************************************************************************/

const apiRouter = Router();

// ** Add VerificationRouter ** //

// Init router
const verificationRouter = Router();

// Verify signature
verificationRouter.post(
  Paths.Verification.VerifySignature,
  VerificationRoutes.verifySignature
);

// Add VerificationRouter
apiRouter.use(Paths.Verification.Base, verificationRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
