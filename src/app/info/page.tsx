"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Send, Search } from "lucide-react";

export default function InfoPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const faqData = {
    talent: [
      {
        id: 1,
        question: "Як знайти найкращих фрілансерів?",
        answer:
          "Використовуйте каталог фрілансерів з фільтрами за спеціальністю, рейтингом та портфоліо. Також можете створити завдання та вибрати з поданих заявок.",
      },
      {
        id: 2,
        question: "Як перевірити якість роботи фрілансера?",
        answer:
          "Переглядайте портфоліо, відгуки клієнтів та рейтинг фрілансера. Також можете запросити тестове завдання або провести співбесіду.",
      },
      {
        id: 3,
        question: "Як вести переговори з фрілансерами?",
        answer:
          "Використовуйте вбудований чат для обговорення деталей проєкту, бюджету та термінів. Всі переговори зберігаються для прозорості.",
      },
    ],
    freelancer: [
      {
        id: 4,
        question: "Як створити привабливий профіль?",
        answer:
          "Додайте детальний опис своїх навичок, завантажте якісні роботи в портфоліо та отримайте перші відгуки від клієнтів.",
      },
      {
        id: 5,
        question: "Як подавати заявки на завдання?",
        answer:
          "Знайдіть відповідне завдання, напишіть персональну пропозицію з описом вашого підходу та термінами виконання.",
      },
      {
        id: 6,
        question: "Як підвищити свій рейтинг?",
        answer:
          "Виконуйте якісну роботу вчасно, спілкуйтесь з клієнтами та отримуйте позитивні відгуки. Рейтинг формується на основі середньої оцінки та кількості завершених проєктів.",
      },
    ],
    payments: [
      {
        id: 7,
        question: "Як працює система оплати?",
        answer:
          "Ми використовуємо ескроу-систему. Клієнт попередньо оплачує проєкт, кошти зберігаються на безпечному рахунку до завершення роботи.",
      },
      {
        id: 8,
        question: "Яка комісія платформи?",
        answer:
          "Наша комісія становить лише 5% - це найнижча комісія серед українських платформ фрілансу.",
      },
      {
        id: 9,
        question: "Коли я отримаю гроші?",
        answer:
          "Після прийняття роботи клієнтом кошти автоматично переводяться на ваш рахунок. Виведення коштів доступне щодня.",
      },
    ],
    security: [
      {
        id: 10,
        question: "Як захищені мої дані?",
        answer:
          "Ми використовуємо найсучасніші методи шифрування та дотримуємося всіх стандартів безпеки для захисту ваших персональних даних.",
      },
      {
        id: 11,
        question: "Що робити у випадку конфлікту?",
        answer:
          "У нас є система вирішення спорів. Якщо виникли розбіжності, зверніться до служби підтримки, і ми допоможемо знайти справедливе рішення.",
      },
      {
        id: 12,
        question: "Як захистити себе від шахраїв?",
        answer:
          "Завжди працюйте через платформу, не переходите на зовнішні платіжні системи та перевіряйте рейтинг співробітників.",
      },
    ],
    platform: [
      {
        id: 13,
        question: "Як зареєструватися на платформі?",
        answer:
          "Натисніть кнопку &ldquo;Реєстрація&rdquo; в правому верхньому куті, оберіть тип акаунту (фрілансер або клієнт) та заповніть необхідні дані.",
      },
      {
        id: 14,
        question: "Як створити завдання?",
        answer:
          "Перейдіть до розділу &ldquo;Створити завдання&rdquo;, заповніть детальний опис проєкту, вкажіть бюджет та терміни виконання. Після публікації фрілансери зможуть подавати заявки.",
      },
      {
        id: 15,
        question: "Як працює система рейтингів?",
        answer:
          "Після завершення проєкту обидві сторони можуть залишити відгук та оцінку. Рейтинг формується на основі середньої оцінки та кількості завершених проєктів.",
      },
    ],
  };

  const categories = [
    { id: "all", name: "Всі питання" },
    { id: "talent", name: "Пошук талантів" },
    { id: "freelancer", name: "Для фрілансерів" },
    { id: "payments", name: "Оплата" },
    { id: "security", name: "Безпека" },
    { id: "platform", name: "Платформа" },
  ];

  const getAllQuestions = () => {
    return Object.values(faqData).flat();
  };

  const getFilteredQuestions = () => {
    let questions =
      selectedCategory === "all"
        ? getAllQuestions()
        : faqData[selectedCategory as keyof typeof faqData];

    if (searchQuery) {
      questions = questions.filter(
        (item) =>
          item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return questions;
  };

  const filteredFAQ = getFilteredQuestions();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="Контакти"
            description="Зв'яжіться з нами через email або Telegram"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* Contact Section */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-6">Контакти</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Email Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email підтримка
                  </CardTitle>
                  <CardDescription>
                    Надішліть нам email з вашим питанням
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        support@umili.ua
                      </p>
                      <p className="text-sm text-gray-500">
                        Відповідаємо протягом 24 годин
                      </p>
                    </div>
                    <Button asChild>
                      <a href="mailto:support@umili.ua">Написати email</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Telegram Contact */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Telegram підтримка
                  </CardTitle>
                  <CardDescription>
                    Отримайте миттєву допомогу через Telegram
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        @umili_support
                      </p>
                      <p className="text-sm text-gray-500">
                        Відповідаємо протягом кількох хвилин
                      </p>
                    </div>
                    <Button asChild>
                      <a
                        href="https://t.me/umili_support"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Написати в Telegram
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-100"></div>

      {/* FAQ Section */}
      <div className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-black mb-6">
              Часті питання
            </h2>

            {/* Search */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Пошук по питаннях..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-8">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-sm"
                >
                  {category.name}
                </Button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-6">
              {filteredFAQ.length > 0 ? (
                filteredFAQ.map((item) => (
                  <div key={item.id} className="border-b border-gray-100 pb-6">
                    <h4 className="text-lg font-semibold text-black mb-2">
                      {item.question}
                    </h4>
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    За вашим запитом нічого не знайдено. Спробуйте інші ключові
                    слова.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
