"use client";

import { useState } from "react";

interface Skill {
  name: string;
  count: number;
}

interface Category {
  name: string;
  count: string;
  skills: Skill[];
}

interface SkillsDrilldownProps {
  userType: "умілець" | "client";
}

export function SkillsDrilldown({ userType }: SkillsDrilldownProps) {
  const [activeTab, setActiveTab] = useState(0);

  const categories: Category[] =
    userType === "умілець"
      ? [
          {
            name: "Веб-розробка",
            count: "450+ проєктів",
            skills: [
              { name: "React", count: 120 },
              { name: "Vue.js", count: 85 },
              { name: "Angular", count: 65 },
              { name: "Node.js", count: 95 },
              { name: "Python", count: 80 },
              { name: "PHP", count: 70 },
              { name: "Laravel", count: 45 },
              { name: "Django", count: 35 },
            ],
          },
          {
            name: "UI/UX Дизайн",
            count: "320+ проєктів",
            skills: [
              { name: "Figma", count: 150 },
              { name: "Adobe XD", count: 80 },
              { name: "Sketch", count: 60 },
              { name: "Photoshop", count: 90 },
              { name: "Illustrator", count: 70 },
              { name: "InVision", count: 40 },
              { name: "Principle", count: 25 },
              { name: "Framer", count: 30 },
            ],
          },
          {
            name: "Маркетинг",
            count: "280+ проєктів",
            skills: [
              { name: "SEO", count: 100 },
              { name: "Google Analytics", count: 80 },
              { name: "Facebook Ads", count: 70 },
              { name: "Google Ads", count: 65 },
              { name: "Content Marketing", count: 55 },
              { name: "Email Marketing", count: 45 },
              { name: "Social Media", count: 60 },
              { name: "PPC", count: 40 },
            ],
          },
          {
            name: "Копірайтинг",
            count: "200+ проєктів",
            skills: [
              { name: "Web Copy", count: 80 },
              { name: "Email Copy", count: 60 },
              { name: "Social Media", count: 70 },
              { name: "Blog Writing", count: 55 },
              { name: "Product Descriptions", count: 45 },
              { name: "Sales Pages", count: 35 },
              { name: "Landing Pages", count: 40 },
              { name: "Technical Writing", count: 30 },
            ],
          },
          {
            name: "Мобільні додатки",
            count: "180+ проєктів",
            skills: [
              { name: "React Native", count: 60 },
              { name: "Flutter", count: 45 },
              { name: "iOS Swift", count: 40 },
              { name: "Android Kotlin", count: 35 },
              { name: "Xamarin", count: 20 },
              { name: "Ionic", count: 25 },
              { name: "Cordova", count: 15 },
              { name: "Unity", count: 30 },
            ],
          },
          {
            name: "Аналітика",
            count: "150+ проєктів",
            skills: [
              { name: "Google Analytics", count: 50 },
              { name: "Tableau", count: 30 },
              { name: "Power BI", count: 25 },
              { name: "Excel", count: 40 },
              { name: "SQL", count: 35 },
              { name: "Python", count: 30 },
              { name: "R", count: 20 },
              { name: "Data Visualization", count: 25 },
            ],
          },
        ]
      : [
          {
            name: "Веб-розробка",
            count: "120+ спеціалістів",
            skills: [
              { name: "React", count: 35 },
              { name: "Vue.js", count: 25 },
              { name: "Angular", count: 20 },
              { name: "Node.js", count: 30 },
              { name: "Python", count: 25 },
              { name: "PHP", count: 20 },
              { name: "Laravel", count: 15 },
              { name: "Django", count: 12 },
            ],
          },
          {
            name: "UI/UX Дизайн",
            count: "85+ дизайнерів",
            skills: [
              { name: "Figma", count: 45 },
              { name: "Adobe XD", count: 25 },
              { name: "Sketch", count: 18 },
              { name: "Photoshop", count: 30 },
              { name: "Illustrator", count: 22 },
              { name: "InVision", count: 15 },
              { name: "Principle", count: 10 },
              { name: "Framer", count: 12 },
            ],
          },
          {
            name: "Маркетинг",
            count: "95+ маркетологів",
            skills: [
              { name: "SEO", count: 35 },
              { name: "Google Analytics", count: 28 },
              { name: "Facebook Ads", count: 25 },
              { name: "Google Ads", count: 22 },
              { name: "Content Marketing", count: 20 },
              { name: "Email Marketing", count: 18 },
              { name: "Social Media", count: 25 },
              { name: "PPC", count: 15 },
            ],
          },
          {
            name: "Копірайтинг",
            count: "60+ копірайтерів",
            skills: [
              { name: "Web Copy", count: 25 },
              { name: "Email Copy", count: 20 },
              { name: "Social Media", count: 22 },
              { name: "Blog Writing", count: 18 },
              { name: "Product Descriptions", count: 15 },
              { name: "Sales Pages", count: 12 },
              { name: "Landing Pages", count: 14 },
              { name: "Technical Writing", count: 10 },
            ],
          },
          {
            name: "Мобільні додатки",
            count: "45+ розробників",
            skills: [
              { name: "React Native", count: 18 },
              { name: "Flutter", count: 15 },
              { name: "iOS Swift", count: 12 },
              { name: "Android Kotlin", count: 10 },
              { name: "Xamarin", count: 6 },
              { name: "Ionic", count: 8 },
              { name: "Cordova", count: 5 },
              { name: "Unity", count: 9 },
            ],
          },
          {
            name: "Аналітика",
            count: "35+ аналітиків",
            skills: [
              { name: "Google Analytics", count: 15 },
              { name: "Tableau", count: 10 },
              { name: "Power BI", count: 8 },
              { name: "Excel", count: 12 },
              { name: "SQL", count: 11 },
              { name: "Python", count: 9 },
              { name: "R", count: 6 },
              { name: "Data Visualization", count: 8 },
            ],
          },
        ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="mb-8">
        <div className="flex overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => setActiveTab(index)}
              className={`px-6 py-3 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                activeTab === index
                  ? "text-black border-b-2 border-black"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories[activeTab].skills.map((skill) => (
          <div
            key={skill.name}
            className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <div className="text-sm font-medium text-gray-900 mb-1">
              {skill.name}
            </div>
            <div className="text-xs text-gray-500">
              {skill.count}{" "}
              {userType === "умілець" ? "проєктів" : "спеціалістів"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
