-- Umili Freelance Marketplace - Dummy Data Part 3
-- Continue from create-dummy-data-part2.sql

-- ==============================================
-- PHASE 10: CREATE MESSAGES (for conversations)
-- ==============================================

INSERT INTO public.messages (conversation_id, sender_id, content, message_type) VALUES
-- Conversation 1: Платформа для онлайн-курсів
((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1) AND client_id = '77777777-7777-7777-7777-777777777777' AND freelancer_id = '55555555-5555-5555-5555-555555555555' LIMIT 1), 
 '77777777-7777-7777-7777-777777777777', 
 'Заявку прийнято! Тепер ви можете обговорювати деталі проекту.', 'system'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1) AND client_id = '77777777-7777-7777-7777-777777777777' AND freelancer_id = '55555555-5555-5555-5555-555555555555' LIMIT 1), 
 '77777777-7777-7777-7777-777777777777', 
 'Привіт, Володимир! Дякую за прийняття заявки. Давайте обговоримо деталі проекту.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1) AND client_id = '77777777-7777-7777-7777-777777777777' AND freelancer_id = '55555555-5555-5555-5555-555555555555' LIMIT 1), 
 '55555555-5555-5555-5555-555555555555', 
 'Привіт, Ігор! Радий працювати з вами. Якщо у вас є технічне завдання, поділіться ним.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1) AND client_id = '77777777-7777-7777-7777-777777777777' AND freelancer_id = '55555555-5555-5555-5555-555555555555' LIMIT 1), 
 '77777777-7777-7777-7777-777777777777', 
 'Так, у мене є детальне ТЗ. Основні вимоги: відео-уроки, тести, сертифікати, система платежів та адмін-панель.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1) AND client_id = '77777777-7777-7777-7777-777777777777' AND freelancer_id = '55555555-5555-5555-5555-555555555555' LIMIT 1), 
 '55555555-5555-5555-5555-555555555555', 
 'Відмінно! Я можу реалізувати всі ці функції. Планую використовувати React для фронтенду, Node.js для бекенду та PostgreSQL для бази даних.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1) AND client_id = '77777777-7777-7777-7777-777777777777' AND freelancer_id = '55555555-5555-5555-5555-555555555555' LIMIT 1), 
 '77777777-7777-7777-7777-777777777777', 
 'Це звучить добре. Коли можемо почати роботу?', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1) AND client_id = '77777777-7777-7777-7777-777777777777' AND freelancer_id = '55555555-5555-5555-5555-555555555555' LIMIT 1), 
 '55555555-5555-5555-5555-555555555555', 
 'Можемо почати вже завтра. Спочатку створю архітектуру проекту та покажу вам макети.', 'text'),

-- Conversation 2: Дизайн корпоративного сайту
((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Дизайн корпоративного сайту' LIMIT 1) AND client_id = '99999999-9999-9999-9999-999999999999' AND freelancer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 '99999999-9999-9999-9999-999999999999', 
 'Заявку прийнято! Тепер ви можете обговорювати деталі проекту.', 'system'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Дизайн корпоративного сайту' LIMIT 1) AND client_id = '99999999-9999-9999-9999-999999999999' AND freelancer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 '99999999-9999-9999-9999-999999999999', 
 'Привіт, Марія! Дякую за готовність працювати над дизайном нашого корпоративного сайту.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Дизайн корпоративного сайту' LIMIT 1) AND client_id = '99999999-9999-9999-9999-999999999999' AND freelancer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 '22222222-2222-2222-2222-222222222222', 
 'Привіт, Сергій! Рада допомогти з дизайном. Розкажіть більше про вашу компанію та стиль.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Дизайн корпоративного сайту' LIMIT 1) AND client_id = '99999999-9999-9999-9999-999999999999' AND freelancer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 '99999999-9999-9999-9999-999999999999', 
 'Ми дизайн-агенція, що працює з великими клієнтами. Потрібен сучасний, професійний дизайн з акцентом на креативність.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Дизайн корпоративного сайту' LIMIT 1) AND client_id = '99999999-9999-9999-9999-999999999999' AND freelancer_id = '22222222-2222-2222-2222-222222222222' LIMIT 1), 
 '22222222-2222-2222-2222-222222222222', 
 'Зрозуміло! Створю кілька варіантів дизайну для головної сторінки та покажу вам.', 'text'),

-- Conversation 3: Мобільний додаток для доставки
((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Мобільний додаток для доставки' LIMIT 1) AND client_id = '88888888-8888-8888-8888-888888888888' AND freelancer_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 
 '88888888-8888-8888-8888-888888888888', 
 'Заявку прийнято! Тепер ви можете обговорювати деталі проекту.', 'system'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Мобільний додаток для доставки' LIMIT 1) AND client_id = '88888888-8888-8888-8888-888888888888' AND freelancer_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 
 '88888888-8888-8888-8888-888888888888', 
 'Привіт, Дмитро! Дякую за готовність розробити додаток для доставки їжі.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Мобільний додаток для доставки' LIMIT 1) AND client_id = '88888888-8888-8888-8888-888888888888' AND freelancer_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 
 '33333333-3333-3333-3333-333333333333', 
 'Привіт, Наталія! Радий працювати над цим проектом. Які основні функції потрібні?', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Мобільний додаток для доставки' LIMIT 1) AND client_id = '88888888-8888-8888-8888-888888888888' AND freelancer_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 
 '88888888-8888-8888-8888-888888888888', 
 'Потрібні: каталог товарів, кошик, геолокація, система оплати та відстеження замовлень.', 'text'),

((SELECT id FROM public.conversations WHERE task_id = (SELECT id FROM public.tasks WHERE title = 'Мобільний додаток для доставки' LIMIT 1) AND client_id = '88888888-8888-8888-8888-888888888888' AND freelancer_id = '33333333-3333-3333-3333-333333333333' LIMIT 1), 
 '33333333-3333-3333-3333-333333333333', 
 'Відмінно! Я можу реалізувати всі ці функції. Використовуватиму React Native для швидкої розробки.', 'text');

-- ==============================================
-- PHASE 11: CREATE RATINGS (for completed tasks)
-- ==============================================

INSERT INTO public.ratings (task_id, rater_id, rated_id, rating, review, communication_rating, quality_rating, timeliness_rating) VALUES
-- Ratings for completed tasks
((SELECT id FROM public.tasks WHERE title = 'Веб-сайт для кафе' LIMIT 1), 
 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 
 5.0, 'Відмінна робота! Сайт виглядає професійно, працює швидко та має всі необхідні функції. Олексій завжди був на зв''язку та виконував роботу вчасно.', 
 5.0, 5.0, 5.0),

((SELECT id FROM public.tasks WHERE title = 'Веб-сайт для кафе' LIMIT 1), 
 '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 4.8, 'Тетяна була дуже зрозумілою клієнткою. Чітко формулювала вимоги та швидко надавала відгуки. Рекомендую для співпраці!', 
 4.8, 4.8, 4.8),

((SELECT id FROM public.tasks WHERE title = 'Дизайн логотипу та брендинг' LIMIT 1), 
 '77777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 
 4.9, 'Марія створила чудовий логотип та фірмовий стиль. Дизайн сучасний та відповідає нашому баченню бренду. Дуже рекомендую!', 
 4.9, 5.0, 4.8),

((SELECT id FROM public.tasks WHERE title = 'Дизайн логотипу та брендинг' LIMIT 1), 
 '22222222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', 
 4.7, 'Ігор був дуже зрозумілим клієнтом. Швидко надавав відгуки та був відкритий до пропозицій. Приємно працювати з такими клієнтами!', 
 4.7, 4.7, 4.7),

((SELECT id FROM public.tasks WHERE title = 'API для CRM системи' LIMIT 1), 
 '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 
 4.6, 'Анна створила якісний API з детальною документацією. Код чистий та добре структурований. Рекомендую для backend розробки!', 
 4.5, 4.7, 4.6),

((SELECT id FROM public.tasks WHERE title = 'API для CRM системи' LIMIT 1), 
 '44444444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', 
 4.8, 'Сергій був професійним клієнтом. Чітко формулював вимоги та надавав конструктивні відгуки. Приємно працювати з такими людьми!', 
 4.8, 4.8, 4.8);

-- ==============================================
-- PHASE 12: CREATE NOTIFICATIONS
-- ==============================================

INSERT INTO public.notifications (user_id, title, message, type, is_read, related_id, related_type) VALUES
-- Notifications for freelancers
('11111111-1111-1111-1111-111111111111', 'Нова заявка', 'Ви подали заявку на проект "Розробка веб-сайту для ресторану"', 'info', false, 
 (SELECT id FROM public.tasks WHERE title = 'Розробка веб-сайту для ресторану' LIMIT 1), 'task'),

('22222222-2222-2222-2222-222222222222', 'Заявку прийнято', 'Вашу заявку на проект "Дизайн корпоративного сайту" прийнято!', 'success', false,
 (SELECT id FROM public.tasks WHERE title = 'Дизайн корпоративного сайту' LIMIT 1), 'task'),

('33333333-3333-3333-3333-333333333333', 'Нове повідомлення', 'У вас нове повідомлення в проекті "Мобільний додаток для доставки"', 'info', false,
 (SELECT id FROM public.tasks WHERE title = 'Мобільний додаток для доставки' LIMIT 1), 'task'),

('44444444-4444-4444-4444-444444444444', 'Заявку відхилено', 'Вашу заявку на проект "Розробка веб-сайту для ресторану" відхилено', 'warning', false,
 (SELECT id FROM public.tasks WHERE title = 'Розробка веб-сайту для ресторану' LIMIT 1), 'task'),

('55555555-5555-5555-5555-555555555555', 'Проект завершено', 'Проект "Розробка платформи для онлайн-курсів" завершено. Очікуйте оцінку від клієнта.', 'success', false,
 (SELECT id FROM public.tasks WHERE title = 'Розробка платформи для онлайн-курсів' LIMIT 1), 'task'),

('66666666-6666-6666-6666-666666666666', 'Нова оцінка', 'Ви отримали оцінку 4.8/5 за проект "Контент-стратегія для IT-компанії"', 'success', true,
 (SELECT id FROM public.tasks WHERE title = 'Контент-стратегія для IT-компанії' LIMIT 1), 'task'),

-- Notifications for clients
('77777777-7777-7777-7777-777777777777', 'Нова заявка', 'Отримано заявку на проект "Розробка веб-сайту для ресторану"', 'info', false,
 (SELECT id FROM public.tasks WHERE title = 'Розробка веб-сайту для ресторану' LIMIT 1), 'task'),

('88888888-8888-8888-8888-888888888888', 'Заявку прийнято', 'Заявку на проект "Мобільний додаток для доставки" прийнято', 'success', false,
 (SELECT id FROM public.tasks WHERE title = 'Мобільний додаток для доставки' LIMIT 1), 'task'),

('99999999-9999-9999-9999-999999999999', 'Нове повідомлення', 'У вас нове повідомлення в проекті "Дизайн корпоративного сайту"', 'info', false,
 (SELECT id FROM public.tasks WHERE title = 'Дизайн корпоративного сайту' LIMIT 1), 'task'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Проект завершено', 'Проект "Веб-сайт для кафе" завершено. Будь ласка, оцініть роботу фрілансера.', 'info', false,
 (SELECT id FROM public.tasks WHERE title = 'Веб-сайт для кафе' LIMIT 1), 'task');

-- ==============================================
-- PHASE 13: CREATE USER SUBSCRIPTIONS
-- ==============================================

INSERT INTO public.user_subscriptions (user_id, tier_id, status, billing_cycle, current_period_start, current_period_end) VALUES
-- Pro freelancer subscriptions
('11111111-1111-1111-1111-111111111111', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Pro' AND role = 'freelancer'), 
 'active', 'monthly', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),

('33333333-3333-3333-3333-333333333333', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Pro' AND role = 'freelancer'), 
 'active', 'yearly', NOW() - INTERVAL '2 months', NOW() + INTERVAL '10 months'),

('55555555-5555-5555-5555-555555555555', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Pro' AND role = 'freelancer'), 
 'active', 'monthly', NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

-- Free freelancer subscriptions
('22222222-2222-2222-2222-222222222222', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Free' AND role = 'freelancer'), 
 'active', 'monthly', NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),

('44444444-4444-4444-4444-444444444444', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Free' AND role = 'freelancer'), 
 'active', 'monthly', NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days'),

('66666666-6666-6666-6666-666666666666', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Free' AND role = 'freelancer'), 
 'active', 'monthly', NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days'),

-- Pro client subscriptions
('77777777-7777-7777-7777-777777777777', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Pro' AND role = 'client'), 
 'active', 'yearly', NOW() - INTERVAL '3 months', NOW() + INTERVAL '9 months'),

('99999999-9999-9999-9999-999999999999', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Pro' AND role = 'client'), 
 'active', 'monthly', NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days'),

-- Free client subscriptions
('88888888-8888-8888-8888-888888888888', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Free' AND role = 'client'), 
 'active', 'monthly', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),

('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
 (SELECT id FROM public.subscription_tiers WHERE name = 'Free' AND role = 'client'), 
 'active', 'monthly', NOW() - INTERVAL '25 days', NOW() + INTERVAL '5 days');

-- ==============================================
-- PHASE 14: CREATE USAGE TRACKING
-- ==============================================

INSERT INTO public.usage_tracking (user_id, usage_type, period_start, period_end, count) VALUES
-- Freelancer applications usage
('11111111-1111-1111-1111-111111111111', 'application', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 3),
('22222222-2222-2222-2222-222222222222', 'application', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 2),
('33333333-3333-3333-3333-333333333333', 'application', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 1),
('44444444-4444-4444-4444-444444444444', 'application', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 1),
('55555555-5555-5555-5555-555555555555', 'application', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 2),
('66666666-6666-6666-6666-666666666666', 'application', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 1),

-- Client job posts usage
('77777777-7777-7777-7777-777777777777', 'job_post', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 3),
('88888888-8888-8888-8888-888888888888', 'job_post', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 2),
('99999999-9999-9999-9999-999999999999', 'job_post', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 2),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'job_post', date_trunc('month', NOW()), date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 second', 2);

-- ==============================================
-- PHASE 15: UPDATE USER TIERS
-- ==============================================

UPDATE public.users SET current_tier_id = (
    SELECT tier_id FROM public.user_subscriptions 
    WHERE user_subscriptions.user_id = users.id AND status = 'active'
) WHERE id IN (
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
    '77777777-7777-7777-7777-777777777777',
    '88888888-8888-8888-8888-888888888888',
    '99999999-9999-9999-9999-999999999999',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
);

-- ==============================================
-- SUMMARY
-- ==============================================

-- This script creates comprehensive dummy data including:
-- ✅ 10 users (6 freelancers, 3 clients, 1 admin)
-- ✅ 50+ skills across different categories
-- ✅ 9 categories for organizing skills
-- ✅ User skills with proficiency levels
-- ✅ 10 portfolio items with ratings and feedback
-- ✅ 11 tasks in different statuses (open, in_progress, completed)
-- ✅ 10 applications (pending, accepted, rejected)
-- ✅ 3 active conversations with messages
-- ✅ 6 ratings and reviews for completed projects
-- ✅ 10 notifications for various events
-- ✅ 10 user subscriptions (Pro and Free tiers)
-- ✅ Usage tracking for applications and job posts
-- ✅ All necessary relationships and foreign keys

-- To use this data:
-- 1. Run create-dummy-data.sql first
-- 2. Run create-dummy-data-part2.sql second  
-- 3. Run create-dummy-data-part3.sql third
-- 4. Create corresponding auth.users in Supabase Auth dashboard with matching UUIDs
-- 5. Test all user flows with the created data
