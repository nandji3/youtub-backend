const DB_NAME = "youtubDB"

const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'super_admin',
    EMPLOYEE: 'employee',
    REVIEWER: 'reviewer',
};

module.exports = { DB_NAME, ROLES }


// How authenticate and authorize use in this way

// const ROLES = require('../constants/roles');

// router.delete('/:id', protect, authorizeRoles(ROLES.ADMIN, ROLES.SUPERADMIN), deleteTask);


// routes/taskRoutes.js

// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/authMiddleware');
// const authorizeRoles = require('../middleware/authorizeRoles');
// const { getTaskById, updateTask, deleteTask } = require('../controllers/taskController');
// const ROLES = require('../constants/roles');

// router
//   .route('/:id')
//   .get(protect, getTaskById)
//   .put(protect, authorizeRoles(ROLES.ADMIN, ROLES.MANAGER), updateTask)
//   .delete(protect, authorizeRoles(ROLES.ADMIN), deleteTask);

// module.exports = router;