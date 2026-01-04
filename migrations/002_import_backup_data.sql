-- ============================================
-- Import backup data from Supabase
-- Migration: 002_import_backup_data
-- Date: 2026-01-04
-- Source: SUPABASE_BACKUP_2026-01-04.json
-- ============================================

-- ============================================
-- IMPORT TEABLE CUSTOMERS
-- ============================================
INSERT INTO teable_customers (id, name, email, encrypted_token, mcp_key, teable_base_url, status, tier, record_limit, onboarding_complete, stripe_session_id, password_hash, created_at)
VALUES
    ('8842c928-05dc-47d5-86f8-c965b780ceaf', 'Test User', 'test@teable.com', '959449168b2da758979e0d8aff8039b6:3f8aa7205dee9743da06337e33a19b87:3795ec1f09d2c1f50c2464d370de94d1a23bf4470be9e725e34c5e54c23e0fc7d0cf0419c19a58ddae0668977f0cdd5d17c3d5eb424bc018b4785a997939d3414eed50504847d1', '5435947b3dca265b2e12a07ef35f69af', 'https://app.teable.ai/api', 'active', 'free', 5000, false, NULL, NULL, '2025-12-31 10:42:43.946489+00'),
    ('b4c624ea-a25b-467d-82db-d7df00669a61', 'Jacob Ng', 'ngsanzen@gmail.com', 'c4d644f2e30f2409d05e0a82228e0d73:2bb51b0dc433e78ef5092771bb28ecbe:33f08e9322c8d43f8cb10b939b908b3b5e6f70e5c8949811dbcddf51f1f377967776d922e62f3fffd7a321481376ed77b06ffa7cd73299ec435d62458315c99a8a097096d543a4', 'ceda69bc6ee187f2499e88e21a3b7f2c', 'https://app.teable.io/api', 'active', 'free', 5000, false, NULL, NULL, '2026-01-01 05:32:56.935251+00'),
    ('6d9e6854-11a3-4ebb-b625-e356ebe94040', 'Jacob Ng', 'caipai@gmail.com', 'c4dfdd569d97e2d7fe4b00ab5dfb0c47:65e9bb354619971a874c8465d0cb8b4d:3ff98e4774a2843f0c274aff080f1ed235f3eaa84b61d9e66c7770ca58fc3115c3d57029c4f2eaa78ce9f12225e9bdb380c21e2717e56ad604d237a453dc247784c28f7e6e3bd7', '96f529669401bc32e479670b1ff6c563', 'https://app.teable.io/api', 'active', 'free', 5000, false, NULL, NULL, '2026-01-01 06:12:06.435539+00'),
    ('1315d189-eb74-4afa-990e-b4fa192cd31f', 'Test User', 'test@example.com', '21b1994de918fb21718259dbd5710ec8:f20f49652a883f99423e11c73859c9f7:8860695b0149aadcc0fafeb5d6534080a39e01a6f780eeee2c71b151fe50a29ee245d91090e5bbd9c74881796918b8024b7e1cff4ec8fd630f6cfcd1ba76f45f37a7a09f6d3920', '38ae6fff0c165eb67ebb30080f4092ed', 'https://table.resultmarketing.asia', 'active', 'free', 5000, false, NULL, NULL, '2026-01-02 18:11:00.738461+00'),
    ('f7eb908a-3611-41ee-b290-8d5a69254ef8', 'Browser Test User', 'browsertest@resultmarketing.asia', NULL, '29a01410df24e9c45d35f67844643a40', 'https://app.teable.io/api', 'pending', 'free', 5000, false, NULL, NULL, '2026-01-02 18:56:32.657521+00'),
    ('8fd01c53-6ee7-4628-bdb3-9bb5ba6ab150', 'Flow Test User', 'flowtest123@test.com', NULL, '74e5e07a0099b6fdf5bc6598777ce485', 'https://app.teable.io/api', 'pending', 'free', 5000, false, NULL, NULL, '2026-01-02 18:56:52.791719+00'),
    ('203e59b4-bd98-4ca2-8489-cf4a6f103b1a', 'Test User', 'test@resultmarketing.asia', NULL, '107474899657ffc8df5537c578b09227', 'https://app.teable.io/api', 'pending', 'free', 5000, false, NULL, NULL, '2026-01-03 09:46:02.76511+00'),
    ('6b8da8f8-5aa8-459d-b8bf-55526114e479', 'Test User', 'test2@resultmarketing.asia', NULL, '1a1bb2e4f71745fded299fc18d5916d3', 'https://app.teable.io/api', 'pending', 'free', 5000, false, NULL, NULL, '2026-01-03 09:53:38.220636+00'),
    ('b5b7f887-514e-4c20-931b-1246f3657ee1', 'Test User', 'your-email@example.com', '61dce6fa8ea2cc9e7e0b819db83314f8:f4287a1b832117282deae78bba87ff84:94b331386909e61e15b5842428319805a9bf0021c158352ab0c469baae1b26b26a764e61092a49aaadd9a4b954f392978d5af4cfb8ba34627b854c719cf245d0161a2de38da1a7', 'df9da0cad5d4979b650146d3690015dd', 'https://table.resultmarketing.asia', 'active', 'base', 5000, false, 'cs_test_a17Ac3FReHqFS4WiB7ae4XVlayw9P19uVAD7tRGNxnhXYG2QPotYxMTGwS', NULL, '2026-01-03 09:59:28.664024+00'),
    ('c0f13e08-44b4-40f7-bac7-6ccba45389f4', 'Tris Choy', 'Nimcsk@hotmail.com', 'a0491f88416f54c0a4b1275f11c4a456:5f4871cc2706c331e517e75bd1017abc:35465d5683de47da40fbee4b00a122a2f8e964a94c232fb5180d94afc648a51f6ee0ec29142d83114ea9b2665da2431a348341566a75b80ac1a302e058306cb354f2380192c6e7', '47efedcd0cb85f967f37ac7c6d1ea590', 'https://table.resultmarketing.asia', 'active', 'base', 5000, false, 'cs_test_a1zE6HZjtmAdOhomToujQcQKdudtrlQyzkjHd94Pj6jeyGvjvegS6D1nB8', NULL, '2026-01-04 07:20:59.811847+00'),
    ('7e17822a-2d28-473e-8155-7aa256aab721', 'Jacob Ng', 'inquirycaip@gmail.com', '918f0fa35f340e6c324c8fe009bf701a:1fe01b4e5fde7766932fd0eb8f034b6e:ef313941c6d54be6125986dd132ed9178fb2f82e59fde16cd5dc874421bcc17f5f00e510ac97e5774ca4d333ff5ab2e5562fcff20815d73bc711c6a7115f679bfd4431a1750b5a', '27b4967449c1fb984b37eb3cb6afbeb7', 'https://table.resultmarketing.asia', 'active', 'base', 5000, false, 'cs_test_a14StTLEfeQsQ0IePiYlKOGcqr5y7732jbLUhAUkZuPMCdrSZgtYXHxzvt', '59b8decbd8e06cd423d5c92f456b4baf:be9379c97200ccb28913dbdfd1a8a5a99ddb8cd3261ea719deddaddd0f90c5f8f588292874223152d6501422bb6a0a4d4cf4938e92cafd868ec37888f847bee7', '2026-01-04 08:41:11.39759+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- IMPORT ADMIN USERS
-- ============================================
INSERT INTO admin_users (id, user_id, email, name, role, is_active, created_at)
VALUES
    ('85d26b38-5c2d-444e-81f9-f5a3517cf3b8', '1475f3af-5f49-430d-b224-2d2008e0b597', 'ngsanzen@gmail.com', 'Walter', 'owner', true, '2026-01-03 16:51:02.536413+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- IMPORT PLANS
-- ============================================
INSERT INTO plans (id, name, price_myr, price_usd, interval, features, is_active, stripe_price_id, created_at)
VALUES
    ('411a6501-ac14-4215-9fcd-284848f1a302', 'Pro Annual', 299.00, 65.00, 'year', '["Unlimited MCP calls", "All Airtable bases", "Priority support"]'::jsonb, true, NULL, '2025-12-30 17:41:39.785059+00')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPDATE record_limit to 250000 for all customers
-- ============================================
UPDATE teable_customers SET record_limit = 250000;

-- ============================================
-- Update teable_base_url to use table.resultmarketing.asia
-- ============================================
UPDATE teable_customers
SET teable_base_url = 'https://table.resultmarketing.asia/api'
WHERE teable_base_url LIKE '%teable.io%' OR teable_base_url LIKE '%teable.ai%';
