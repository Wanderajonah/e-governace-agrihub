import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-Governance AgriHub API',
      description:
        'Agricultural Market Governance Information System for Nakasero Market, Kampala. A digital platform for KCCA, MAAIF, and UBOS to manage market operations.',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:5000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            role: {
              type: 'string',
              enum: ['Administrator', 'Market Officer', 'Produce Inspector', 'Government Officer'],
            },
            agency: { type: 'string', enum: ['KCCA', 'MAAIF', 'UBOS'] },
            status: { type: 'string', enum: ['Active', 'Inactive'] },
            phone: { type: 'string' },
            avatar: { type: 'string' },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Farmer: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            farmerId: { type: 'string' },
            name: { type: 'string' },
            district: { type: 'string' },
            phone: { type: 'string' },
            produce: { type: 'string' },
            status: { type: 'string', enum: ['Active', 'Inactive', 'Pending'] },
            registered: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Produce: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            produceId: { type: 'string' },
            farmer: { type: 'string' },
            farmerName: { type: 'string' },
            commodity: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string', enum: ['kg', 'tonnes', 'bags', 'crates', 'boxes'] },
            sourceDistrict: { type: 'string' },
            arrivalDate: { type: 'string', format: 'date-time' },
            vehiclePlate: { type: 'string' },
            notes: { type: 'string' },
            status: { type: 'string', enum: ['Pending', 'Verified', 'Under Review'] },
            grade: { type: 'string', enum: ['A', 'B', 'C'] },
            qualityStatus: { type: 'string' },
            moistureContent: { type: 'number' },
            inspectorComments: { type: 'string' },
            inspectorName: { type: 'string' },
            verifiedAt: { type: 'string', format: 'date-time' },
            verifiedBy: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CommodityPrice: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            commodity: { type: 'string' },
            unit: { type: 'string' },
            price: { type: 'number' },
            change: { type: 'number' },
            date: { type: 'string', format: 'date-time' },
            grade: { type: 'string', enum: ['A', 'B', 'C'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Verification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            verificationId: { type: 'string' },
            produce: { type: 'string' },
            farmer: { type: 'string' },
            farmerName: { type: 'string' },
            commodity: { type: 'string' },
            quantity: { type: 'number' },
            district: { type: 'string' },
            arrived: { type: 'string', format: 'date-time' },
            status: {
              type: 'string',
              enum: ['Pending', 'Under Review', 'Approved', 'Rejected'],
            },
            grade: { type: 'string', enum: ['A', 'B', 'C'] },
            qualityStatus: { type: 'string' },
            moistureContent: { type: 'number' },
            inspectorComments: { type: 'string' },
            inspectorName: { type: 'string' },
            inspectedBy: { type: 'string' },
            inspectedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Transaction: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            transactionId: { type: 'string' },
            buyer: { type: 'string' },
            seller: { type: 'string' },
            sellerRef: { type: 'string' },
            commodity: { type: 'string' },
            quantity: { type: 'string' },
            qtyNum: { type: 'number' },
            unitPrice: { type: 'number' },
            total: { type: 'number' },
            payment: {
              type: 'string',
              enum: ['Cash', 'Mobile Money', 'Bank Transfer', 'Cheque'],
            },
            receiptNumber: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            type: { type: 'string', enum: ['price', 'verification', 'system', 'market'] },
            title: { type: 'string' },
            message: { type: 'string' },
            read: { type: 'boolean' },
            user: { type: 'string' },
            recipientRole: { type: 'string' },
            link: { type: 'string' },
            sentAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: { type: 'object' },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Farmers', description: 'Farmer management endpoints' },
      { name: 'Produce', description: 'Produce registration and management' },
      { name: 'Prices', description: 'Commodity price management' },
      { name: 'Verifications', description: 'Produce verification endpoints' },
      { name: 'Transactions', description: 'Market transaction records' },
      { name: 'Dashboard', description: 'Dashboard statistics' },
      { name: 'Analytics', description: 'Analytics and insights' },
      { name: 'Reports', description: 'Report generation and management' },
      { name: 'Notifications', description: 'Notification management' },
      { name: 'Users', description: 'User administration' },
    ],
    paths: {
      '/api/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Authenticate user and return JWT token',
          security: [],
        },
      },
      '/api/auth/me': {
        get: {
          tags: ['Auth'],
          summary: 'Get current authenticated user profile',
        },
      },
      '/api/auth/change-password': {
        put: {
          tags: ['Auth'],
          summary: 'Change authenticated user password',
        },
      },
      '/api/farmers': {
        post: {
          tags: ['Farmers'],
          summary: 'Register a new farmer',
        },
        get: {
          tags: ['Farmers'],
          summary: 'List all farmers',
        },
      },
      '/api/farmers/{id}': {
        get: {
          tags: ['Farmers'],
          summary: 'Get a single farmer by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        put: {
          tags: ['Farmers'],
          summary: 'Update farmer details',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        delete: {
          tags: ['Farmers'],
          summary: 'Delete a farmer',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/produce': {
        post: {
          tags: ['Produce'],
          summary: 'Register new produce arrival',
        },
        get: {
          tags: ['Produce'],
          summary: 'List all produce records',
        },
      },
      '/api/produce/{id}': {
        get: {
          tags: ['Produce'],
          summary: 'Get a single produce record by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        put: {
          tags: ['Produce'],
          summary: 'Update a produce record',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        delete: {
          tags: ['Produce'],
          summary: 'Delete a produce record',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/prices': {
        post: {
          tags: ['Prices'],
          summary: 'Add a new commodity price entry',
        },
        get: {
          tags: ['Prices'],
          summary: 'List all commodity prices',
        },
      },
      '/api/prices/trends': {
        get: {
          tags: ['Prices'],
          summary: 'Get commodity price trends data',
        },
      },
      '/api/prices/{id}': {
        get: {
          tags: ['Prices'],
          summary: 'Get a single price record by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        put: {
          tags: ['Prices'],
          summary: 'Update a price record',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        delete: {
          tags: ['Prices'],
          summary: 'Delete a price record',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/verifications': {
        post: {
          tags: ['Verifications'],
          summary: 'Create a new produce verification request',
        },
        get: {
          tags: ['Verifications'],
          summary: 'List all verification records',
        },
      },
      '/api/verifications/{id}/approve': {
        put: {
          tags: ['Verifications'],
          summary: 'Approve a produce verification',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/verifications/{id}/reject': {
        put: {
          tags: ['Verifications'],
          summary: 'Reject a produce verification',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/verifications/{id}': {
        get: {
          tags: ['Verifications'],
          summary: 'Get a single verification record by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/transactions': {
        post: {
          tags: ['Transactions'],
          summary: 'Record a new market transaction',
        },
        get: {
          tags: ['Transactions'],
          summary: 'List all transactions',
        },
      },
      '/api/transactions/{id}': {
        get: {
          tags: ['Transactions'],
          summary: 'Get a single transaction by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/dashboard/stats': {
        get: {
          tags: ['Dashboard'],
          summary: 'Get dashboard statistics',
        },
      },
      '/api/analytics/commodity-trends': {
        get: {
          tags: ['Analytics'],
          summary: 'Get commodity price trends over time',
        },
      },
      '/api/analytics/monthly-transactions': {
        get: {
          tags: ['Analytics'],
          summary: 'Get monthly transaction summary',
        },
      },
      '/api/analytics/revenue': {
        get: {
          tags: ['Analytics'],
          summary: 'Get revenue analytics data',
        },
      },
      '/api/analytics/market-turnover': {
        get: {
          tags: ['Analytics'],
          summary: 'Get market turnover analytics',
        },
      },
      '/api/analytics/produce-volume': {
        get: {
          tags: ['Analytics'],
          summary: 'Get produce volume analytics',
        },
      },
      '/api/analytics/price-fluctuations': {
        get: {
          tags: ['Analytics'],
          summary: 'Get price fluctuation data',
        },
      },
      '/api/analytics/top-commodities': {
        get: {
          tags: ['Analytics'],
          summary: 'Get top traded commodities',
        },
      },
      '/api/analytics/top-districts': {
        get: {
          tags: ['Analytics'],
          summary: 'Get top source districts',
        },
      },
      '/api/analytics/recent-registrations': {
        get: {
          tags: ['Analytics'],
          summary: 'Get recent farmer registrations',
        },
      },
      '/api/reports/generate': {
        post: {
          tags: ['Reports'],
          summary: 'Generate a new report',
        },
      },
      '/api/reports': {
        get: {
          tags: ['Reports'],
          summary: 'List all generated reports',
        },
      },
      '/api/reports/{id}': {
        get: {
          tags: ['Reports'],
          summary: 'Get a single report by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/notifications': {
        post: {
          tags: ['Notifications'],
          summary: 'Create a new notification',
        },
        get: {
          tags: ['Notifications'],
          summary: 'List notifications for current user',
        },
      },
      '/api/notifications/unread-count': {
        get: {
          tags: ['Notifications'],
          summary: 'Get unread notification count',
        },
      },
      '/api/notifications/read-all': {
        put: {
          tags: ['Notifications'],
          summary: 'Mark all notifications as read',
        },
      },
      '/api/notifications/{id}/read': {
        put: {
          tags: ['Notifications'],
          summary: 'Mark a single notification as read',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
      '/api/users': {
        post: {
          tags: ['Users'],
          summary: 'Create a new user',
        },
        get: {
          tags: ['Users'],
          summary: 'List all users',
        },
      },
      '/api/users/{id}': {
        get: {
          tags: ['Users'],
          summary: 'Get a single user by ID',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        put: {
          tags: ['Users'],
          summary: 'Update user details',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
        delete: {
          tags: ['Users'],
          summary: 'Delete a user',
          parameters: [
            { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          ],
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
