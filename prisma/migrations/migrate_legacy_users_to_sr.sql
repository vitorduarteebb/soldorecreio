-- Migração: tabela legada `users` → `sr_User` (Sol do Recreio)
-- Execute no phpMyAdmin (aba SQL), ajustando @LEGACY_DB com o banco onde está a tabela users.

SET @LEGACY_DB = 'NOME_DO_BANCO_LEGADO';  -- ex.: u494944867_vitorduarteebb
SET @TARGET_DB = 'u494944867_horyzonn';
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
FROM `NOME_DO_BANCO_LEGADO`.users u
WHERE u.email IS NOT NULL AND TRIM(u.email) <> ''
ON DUPLICATE KEY UPDATE
  passwordHash = VALUES(passwordHash),
  name = VALUES(name),
  role = VALUES(role),
  merchantId = VALUES(merchantId),
  whatsapp = VALUES(whatsapp),
  cashbackBalance = VALUES(cashbackBalance),
  updatedAt = NOW();

-- Admins migrados: troque a senha no painel ou rode UPDATE com hash bcrypt novo.
