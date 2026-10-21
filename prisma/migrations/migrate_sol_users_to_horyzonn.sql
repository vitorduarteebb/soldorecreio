-- Migração Sol do Recreio: u494944867_sol.users → u494944867_horyzonn.sr_User
-- Execute no phpMyAdmin (aba SQL). Ajuste se o merchant id for diferente.

SET @merchantId = (SELECT id FROM u494944867_horyzonn.sr_Merchant LIMIT 1);

INSERT INTO u494944867_horyzonn.sr_User (
  id,
  email,
  passwordHash,
  name,
  role,
  merchantId,
  whatsapp,
  cashbackBalance,
  createdAt,
  updatedAt
)
SELECT
  CONCAT('legacy-', u.id),
  LOWER(TRIM(u.email)),
  u.password_hash,
  COALESCE(NULLIF(TRIM(u.name), ''), SUBSTRING_INDEX(u.email, '@', 1)),
  CASE WHEN UPPER(u.role) = 'ADMIN' THEN 'MERCHANT_ADMIN' ELSE 'CUSTOMER' END,
  @merchantId,
  NULLIF(TRIM(u.phone), ''),
  COALESCE(u.cashback_balance, 0),
  COALESCE(u.created_at, NOW()),
  NOW()
FROM u494944867_sol.users u
WHERE u.email IS NOT NULL AND TRIM(u.email) <> ''
ON DUPLICATE KEY UPDATE
  passwordHash = VALUES(passwordHash),
  name = VALUES(name),
  role = VALUES(role),
  merchantId = VALUES(merchantId),
  whatsapp = VALUES(whatsapp),
  cashbackBalance = VALUES(cashbackBalance),
  updatedAt = NOW();
