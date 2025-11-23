import { Router } from "express";

import Paths from "@/common/constants/Paths";
import VerificationRoutes from "./VerificationRoutes";
import MFARoutes from "./MFARoutes";

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

// ** Add MFARouter ** //

// Init MFA router
const mfaRouter = Router();

// MFA routes
mfaRouter.post(Paths.MFA.Setup, MFARoutes.setupMFA);
mfaRouter.post(Paths.MFA.VerifySetup, MFARoutes.verifySetup);
mfaRouter.post(Paths.MFA.VerifyLogin, MFARoutes.verifyLogin);
mfaRouter.post(Paths.MFA.Disable, MFARoutes.disableMFA);
mfaRouter.get(Paths.MFA.Status, MFARoutes.getStatus);

// Add MFARouter
apiRouter.use(Paths.MFA.Base, mfaRouter);

/******************************************************************************
                                Export default
******************************************************************************/

export default apiRouter;
