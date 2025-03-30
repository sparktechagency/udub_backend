import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../user/user.constant';
import ProjectDocumentController from './project_document.controller';

const router = express.Router();

router.post(
  '/upload-project-documents/:projectId',
  auth(USER_ROLE.user),
  // uploadFile(),
  // (req, res, next) => {
  //   if (req.body.data) {
  //     req.body = JSON.parse(req.body.data);
  //   }
  //   next();
  // },
  // validateRequest(project_documentValidations.updateProject_documentData),
  ProjectDocumentController.uploadImagesForProject,
);

router.patch(
  '/update-project-document/:id',
  auth(USER_ROLE.manager, USER_ROLE.officeManager, USER_ROLE.superAdmin),
  // uploadFile(),
  // (req, res, next) => {
  //   if (req.body.data) {
  //     req.body = JSON.parse(req.body.data);
  //   }
  //   next();
  // },
  ProjectDocumentController.updateDocument,
);

router.get(
  '/get-project-documents/:id',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.manager,
    USER_ROLE.officeManager,
    USER_ROLE.financeManager,
    USER_ROLE.user,
  ),
  ProjectDocumentController.getProjectDocuments,
);
router.get(
  '/get-single-document/:id',
  auth(
    USER_ROLE.superAdmin,
    USER_ROLE.manager,
    USER_ROLE.officeManager,
    USER_ROLE.financeManager,
    USER_ROLE.user,
  ),
  ProjectDocumentController.getSingleDocument,
);

export const projectDocumentRoutes = router;
