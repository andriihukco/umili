"use client";

import React from "react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  message: string;
}

interface ChatTestimonialsProps {
  userType: "умілець" | "client";
}

export function ChatTestimonials({ userType }: ChatTestimonialsProps) {
  const testimonials: Testimonial[] =
    userType === "умілець"
      ? [
          {
            id: "1",
            name: "Анна Коваленко",
            role: "UI/UX Дизайнер",
            message:
              "За 3 місяці на Umili заробила більше, ніж за рік на інших платформах.",
          },
          {
            id: "2",
            name: "Максим Петренко",
            role: "Full-stack розробник",
            message:
              "Знайшов постійних клієнтів через платформу. Проєкти цікаві, оплата гарантована.",
          },
          {
            id: "3",
            name: "Оксана Мельник",
            role: "Маркетолог",
            message:
              "Платформа допомогла знайти стабільний дохід. Доходжу до ₴50,000 на місяць.",
          },
          {
            id: "4",
            name: "Дмитро Іваненко",
            role: "Frontend розробник",
            message:
              "Швидко знайшов роботу після реєстрації. Клієнти серйозні, проєкти якісні.",
          },
          {
            id: "5",
            name: "Катерина Шевченко",
            role: "Копірайтер",
            message:
              "Найкраща платформа для фрілансерів! Клієнти платять вчасно, проєкти різноманітні.",
          },
        ]
      : [
          {
            id: "1",
            name: "Олексій Сидоренко",
            role: "Маркетинг-директор",
            message:
              "Як клієнт, дуже задоволений якістю виконавців. Швидко знайшов команду для стартапу.",
          },
          {
            id: "2",
            name: "Марія Іваненко",
            role: "CEO стартапу",
            message:
              "Знайшла ідеальну команду розробників. Професіоналізм на вищому рівні.",
          },
          {
            id: "3",
            name: "Андрій Коваль",
            role: "Product Manager",
            message:
              "Платформа допомогла знайти топових дизайнерів. Результат перевершив очікування.",
          },
          {
            id: "4",
            name: "Олена Петренко",
            role: "Маркетинг-менеджер",
            message:
              "Швидко знайшла спеціалістів для рекламної кампанії. Всі терміни дотримані.",
          },
          {
            id: "5",
            name: "Володимир Козлов",
            role: "CTO",
            message:
              "Відмінна платформа для пошуку талановитих розробників. Рекомендую всім!",
          },
        ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="space-y-8">
        {testimonials.map((testimonial, index) => {
          // Alternate between left and right alignment for chat effect
          const isLeft = index % 2 === 0;

          // Define colors and rotations for each message
          const colorConfigs = [
            {
              bg: "bg-orange-100",
              text: "text-orange-900",
              border: "border-orange-100",
              rotation: "rotate-1",
            },
            {
              bg: "bg-blue-100",
              text: "text-blue-900",
              border: "border-blue-100",
              rotation: "-rotate-1",
            },
            {
              bg: "bg-yellow-100",
              text: "text-yellow-900",
              border: "border-yellow-100",
              rotation: "rotate-2",
            },
            {
              bg: "bg-green-100",
              text: "text-green-900",
              border: "border-green-100",
              rotation: "-rotate-2",
            },
            {
              bg: "bg-purple-100",
              text: "text-purple-900",
              border: "border-purple-100",
              rotation: "rotate-1",
            },
          ];

          const colorConfig = colorConfigs[index % colorConfigs.length];

          return (
            <div
              key={testimonial.id}
              className={`flex ${
                isLeft ? "justify-start" : "justify-end"
              } items-start gap-4`}
            >
              {/* Message Container */}
              <div
                className={`flex flex-col ${
                  isLeft ? "items-start" : "items-end"
                } max-w-lg`}
              >
                {/* Message Bubble */}
                <div className={`relative ${colorConfig.rotation}`}>
                  <div
                    className={`px-5 py-4 rounded-2xl ${
                      isLeft
                        ? `${colorConfig.bg} ${colorConfig.text} rounded-bl-md`
                        : `${colorConfig.bg} ${colorConfig.text} rounded-br-md`
                    }`}
                  >
                    <p className="text-base leading-relaxed">
                      {testimonial.message}
                    </p>
                  </div>

                  {/* Message Tail */}
                  <div
                    className={`absolute bottom-0 w-0 h-0 ${
                      isLeft
                        ? `left-0 border-l-0 border-r-8 ${colorConfig.border.replace(
                            "bg-",
                            "border-r-"
                          )} border-t-8 border-t-transparent border-b-8 border-b-transparent`
                        : `right-0 border-r-0 border-l-8 ${colorConfig.border.replace(
                            "bg-",
                            "border-l-"
                          )} border-t-8 border-t-transparent border-b-8 border-b-transparent`
                    }`}
                  ></div>
                </div>

                {/* Avatar and Name/Role - positioned below message */}
                <div
                  className={`flex items-center gap-3 mt-3 ${
                    isLeft ? "flex-row" : "flex-row-reverse"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 shadow-sm ${
                      isLeft
                        ? `${colorConfig.bg} ${colorConfig.text}`
                        : `${colorConfig.bg} ${colorConfig.text}`
                    }`}
                  >
                    {testimonial.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className={`${isLeft ? "text-left" : "text-right"}`}>
                    <div className="text-sm font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
