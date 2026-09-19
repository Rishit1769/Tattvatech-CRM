INSERT INTO roles (id, name, description, is_system)
VALUES
  (UUID(), 'Owner', 'Full company visibility and administration', TRUE),
  (UUID(), 'Admin', 'Operational administration', TRUE),
  (UUID(), 'Business', 'Sales and relationship operations', TRUE),
  (UUID(), 'Technical', 'Projects and infrastructure operations', TRUE),
  (UUID(), 'Member', 'Base workspace access', TRUE)
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT INTO permissions (id, permission_key, description)
VALUES
  (UUID(), 'dashboard.view', 'View the workspace dashboard'),
  (UUID(), 'team.view', 'View team members'),
  (UUID(), 'team.manage', 'Manage users and roles'),
  (UUID(), 'settings.view', 'View company settings'),
  (UUID(), 'settings.manage', 'Manage company settings'),
  (UUID(), 'activity.view', 'View activity timelines'),
  (UUID(), 'audit.view', 'View audit history')
ON DUPLICATE KEY UPDATE description = VALUES(description);

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'Owner';

INSERT IGNORE INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.permission_key IN ('dashboard.view', 'team.view', 'activity.view') WHERE r.name IN ('Admin', 'Business', 'Technical', 'Member');
