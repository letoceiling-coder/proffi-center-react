#!/bin/bash
# Create MySQL user for proffi_center (run on server as root)
sudo mysql <<'SQL'
CREATE USER IF NOT EXISTS 'proffi'@'localhost' IDENTIFIED BY 'ProffiSecure2026';
GRANT ALL PRIVILEGES ON proffi_center.* TO 'proffi'@'localhost';
FLUSH PRIVILEGES;
SQL
