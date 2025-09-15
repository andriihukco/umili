-- Custom Email Template for Umili
-- Run this in your Supabase SQL Editor to set up custom email templates

-- Update the auth configuration to use custom email templates
UPDATE auth.config 
SET 
  site_url = 'https://umili.work',
  additional_redirect_urls = '{"https://umili.work/auth/callback","https://umili.work/dashboard"}',
  mailer_secure_email_change_enabled = true,
  mailer_autoconfirm = false,
  mailer_otp_exp = 3600,
  mailer_urlpatterns = '{"confirmation":"/auth/callback","invite":"/auth/callback","recovery":"/auth/callback","email_change":"/auth/callback"}'
WHERE id = 1;

-- Custom email template for confirmation emails
INSERT INTO auth.email_templates (id, created_at, updated_at, template_type, subject, content_html, content_text)
VALUES (
  gen_random_uuid(),
  now(),
  now(),
  'confirmation',
  'Підтвердіть ваш email для Umili 🚀',
  '
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Підтвердження email - Umili</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .tagline {
            color: #6b7280;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.3);
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px 0 rgba(59, 130, 246, 0.4);
        }
        .features {
            background: #f8fafc;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .feature-icon {
            color: #10b981;
            margin-right: 10px;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #3b82f6;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Umili</div>
            <div class="tagline">Платформа для фрілансерів та клієнтів</div>
        </div>
        
        <div class="content">
            <div class="greeting">Вітаємо! 👋</div>
            
            <div class="message">
                Дякуємо за реєстрацію на <strong>Umili</strong>! Ми раді вітати вас у нашій спільноті професійних фрілансерів та клієнтів.
            </div>
            
            <div class="message">
                Щоб завершити реєстрацію та активувати ваш акаунт, будь ласка, підтвердіть ваш email адрес:
            </div>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Підтвердити Email
                </a>
            </div>
            
            <div class="features">
                <h3 style="margin-top: 0; color: #1f2937;">Що вас чекає на Umili:</h3>
                <div class="feature">
                    <span class="feature-icon">✓</span>
                    <span>Знаходження якісних проектів та талантів</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">✓</span>
                    <span>Безпечні платежі та гарантії</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">✓</span>
                    <span>Система рейтингів та відгуків</span>
                </div>
                <div class="feature">
                    <span class="feature-icon">✓</span>
                    <span>24/7 підтримка клієнтів</span>
                </div>
            </div>
            
            <div class="message">
                <strong>Важливо:</strong> Якщо ви не реєструвалися на Umili, просто проігноруйте це повідомлення.
            </div>
        </div>
        
        <div class="footer">
            <div class="social-links">
                <a href="https://umili.work" class="social-link">Веб-сайт</a>
                <a href="https://umili.work/help" class="social-link">Допомога</a>
                <a href="https://umili.work/contact" class="social-link">Контакти</a>
            </div>
            <p>© 2024 Umili. Всі права захищені.</p>
            <p>Це автоматичне повідомлення, будь ласка, не відповідайте на нього.</p>
        </div>
    </div>
</body>
</html>
  ',
  '
Вітаємо на Umili! 👋

Дякуємо за реєстрацію на нашій платформі для фрілансерів та клієнтів.

Щоб завершити реєстрацію та активувати ваш акаунт, будь ласка, підтвердіть ваш email адрес:

{{ .ConfirmationURL }}

Що вас чекає на Umili:
✓ Знаходження якісних проектів та талантів
✓ Безпечні платежі та гарантії  
✓ Система рейтингів та відгуків
✓ 24/7 підтримка клієнтів

Важливо: Якщо ви не реєструвалися на Umili, просто проігноруйте це повідомлення.

© 2024 Umili. Всі права захищені.
Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
  '
)
ON CONFLICT (template_type) 
DO UPDATE SET 
  subject = EXCLUDED.subject,
  content_html = EXCLUDED.content_html,
  content_text = EXCLUDED.content_text,
  updated_at = now();

-- Custom email template for password recovery
INSERT INTO auth.email_templates (id, created_at, updated_at, template_type, subject, content_html, content_text)
VALUES (
  gen_random_uuid(),
  now(),
  now(),
  'recovery',
  'Відновлення пароля - Umili 🔐',
  '
<!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Відновлення пароля - Umili</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8fafc;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
            margin-bottom: 10px;
        }
        .tagline {
            color: #6b7280;
            font-size: 16px;
        }
        .content {
            margin-bottom: 30px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #4b5563;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.3);
        }
        .security-notice {
            background: #fef2f2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Umili</div>
            <div class="tagline">Платформа для фрілансерів та клієнтів</div>
        </div>
        
        <div class="content">
            <div class="greeting">Відновлення пароля 🔐</div>
            
            <div class="message">
                Ви отримали цей email тому, що хтось (імовірно ви) запросив відновлення пароля для вашого акаунту на <strong>Umili</strong>.
            </div>
            
            <div class="message">
                Щоб встановити новий пароль, натисніть на кнопку нижче:
            </div>
            
            <div style="text-align: center;">
                <a href="{{ .ConfirmationURL }}" class="cta-button">
                    Встановити новий пароль
                </a>
            </div>
            
            <div class="security-notice">
                <strong>⚠️ Важливо для безпеки:</strong>
                <ul style="margin: 10px 0; padding-left: 20px;">
                    <li>Це посилання дійсне протягом 1 години</li>
                    <li>Якщо ви не запитували відновлення пароля, проігноруйте це повідомлення</li>
                    <li>Ваш поточний пароль залишається незмінним до встановлення нового</li>
                </ul>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 Umili. Всі права захищені.</p>
            <p>Це автоматичне повідомлення, будь ласка, не відповідайте на нього.</p>
        </div>
    </div>
</body>
</html>
  ',
  '
Відновлення пароля - Umili 🔐

Ви отримали цей email тому, що хтось (імовірно ви) запросив відновлення пароля для вашого акаунту на Umili.

Щоб встановити новий пароль, перейдіть за посиланням:

{{ .ConfirmationURL }}

⚠️ Важливо для безпеки:
- Це посилання дійсне протягом 1 години
- Якщо ви не запитували відновлення пароля, проігноруйте це повідомлення  
- Ваш поточний пароль залишається незмінним до встановлення нового

© 2024 Umili. Всі права захищені.
Це автоматичне повідомлення, будь ласка, не відповідайте на нього.
  '
)
ON CONFLICT (template_type) 
DO UPDATE SET 
  subject = EXCLUDED.subject,
  content_html = EXCLUDED.content_html,
  content_text = EXCLUDED.content_text,
  updated_at = now();

-- Update site URL in auth settings
UPDATE auth.config 
SET site_url = 'https://umili.work'
WHERE id = 1;
