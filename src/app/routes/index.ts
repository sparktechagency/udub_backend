import { Router } from 'express';
import { userRoutes } from '../modules/user/user.routes';
import { authRoutes } from '../modules/auth/auth.routes';
import { ManageRoutes } from '../modules/manage-web/manage.routes';

import { notificationRoutes } from '../modules/notification/notification.routes';
import { projectRoutes } from '../modules/project/project.routes';
import { project_imageRoutes } from '../modules/project_image/project_image.routes';
import { projectDocumentRoutes } from '../modules/project_document/project_document.routes';
import { materialRoutes } from '../modules/material/material.routes';

const router = Router();

const moduleRoutes = [
  {
    path: '/auth',
    router: authRoutes,
  },
  {
    path: '/user',
    router: userRoutes,
  },
  {
    path: '/manage',
    router: ManageRoutes,
  },
  {
    path: '/notification',
    router: notificationRoutes,
  },
  {
    path: '/project',
    router: projectRoutes,
  },
  {
    path: '/project-image',
    router: project_imageRoutes,
  },
  {
    path: '/project-document',
    router: projectDocumentRoutes,
  },
  {
    path: '/material',
    router: materialRoutes,
  },
];

moduleRoutes.forEach((route) => router.use(route.path, route.router));

export default router;
