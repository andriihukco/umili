"use client";

import { detectContactDetails, ContactMatch } from "@/lib/contact-detection";
import { BlurredContact } from "./blurred-contact";

interface MessageContentProps {
  content: string;
  className?: string;
}

export function MessageContent({ content, className }: MessageContentProps) {
  const contactMatches = detectContactDetails(content);

  if (contactMatches.length === 0) {
    return <span className={className}>{content}</span>;
  }

  // Split content by contact matches and render with blurring
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  contactMatches.forEach((match, index) => {
    // Add text before the match
    if (match.start > lastIndex) {
      parts.push(
        <span key={`text-${index}`}>
          {content.substring(lastIndex, match.start)}
        </span>
      );
    }

    // Add blurred contact
    parts.push(
      <BlurredContact key={`contact-${index}`} contactType={match.type}>
        {match.value}
      </BlurredContact>
    );

    lastIndex = match.end;
  });

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(<span key="text-end">{content.substring(lastIndex)}</span>);
  }

  return <span className={className}>{parts}</span>;
}

function getContactTypeLabel(type: ContactMatch["type"]): string {
  const labels = {
    email: "електронною поштою",
    phone: "номером телефону",
    telegram: "Telegram контактами",
    instagram: "Instagram контактами",
    whatsapp: "WhatsApp контактами",
    skype: "Skype контактами",
    discord: "Discord контактами",
    linkedin: "LinkedIn контактами",
    website: "веб-сайтами",
  };

  return labels[type] || "контактними даними";
}
