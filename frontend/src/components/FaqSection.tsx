import { useState } from "react";
import { motion } from "framer-motion";

import * as Accordion from "@radix-ui/react-accordion";

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  icon?: string;
  iconPosition?: string;
}

interface FaqSectionProps {
  data: FAQItem[];
}

export default function FaqSection({ data }: FaqSectionProps) {
  const [openItem, setOpenItem] = useState<string | null>(null);

  return (
    <div
      className="mx-auto max-w-md rounded-lg bg-zinc-900 p-4 border border-zinc-700"
      style={{ maxWidth: "700px", minWidth: "700px" }}
    >
      <div className="mb-4 text-sm text-zinc-400">Preguntas Frecuentes</div>

      <Accordion.Root
        type="single"
        collapsible
        value={openItem || ""}
        onValueChange={(value) => setOpenItem(value)}
      >
        {data.map((item) => (
          <Accordion.Item value={item.id.toString()} key={item.id} className="mb-2">
            <Accordion.Header>
              <Accordion.Trigger
                className="flex w-full items-center justify-start gap-x-4"
                style={{ width: "100%" }}
              >
                <div
                  className="relative flex items-center space-x-2 rounded-xl bg-zinc-800 p-2 hover:bg-orange-500/20 border border-zinc-700 hover:border-orange-500/50 transition-all"
                  style={{
                    backgroundColor: openItem === item.id.toString() ? "rgba(249, 115, 22, 0.2)" : "",
                  }}
                >
                  {item.icon && (
                    <span
                      className={`absolute bottom-6 ${
                        item.iconPosition === "right" ? "right-0" : "left-0"
                      }`}
                      style={{
                        transform: item.iconPosition === "right" ? "rotate(7deg)" : "rotate(-4deg)",
                      }}
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="font-medium text-white">{item.question}</span>
                </div>

                <span className="cursor-pointer text-lg font-bold text-zinc-400">
                  {openItem === item.id.toString() ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6 text-orange-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6 text-orange-400"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 9a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25V15a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V9Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </span>
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content asChild forceMount style={{ display: "block" }}>
              <motion.div
                initial="collapsed"
                animate={openItem === item.id.toString() ? "open" : "collapsed"}
                variants={{
                  open: { opacity: 1, height: "auto" },
                  collapsed: { opacity: 0, height: 0 },
                }}
                transition={{ duration: 0.4 }}
                style={{ width: "100%", overflow: "hidden" }}
              >
                <div
                  className="ml-7 mt-1 rounded-lg p-3 text-white md:ml-16"
                  style={{
                    borderRadius: "12px",
                    textAlign: "left",
                    width: "100%",
                  }}
                >
                  <div className="relative max-w-xs rounded-2xl bg-orange-500 px-4 py-2 text-white">
                    {item.answer}
                    <div className="absolute bottom-0 right-0 h-0 w-0 border-l-[10px] border-t-[10px] border-l-transparent border-t-orange-500"></div>
                  </div>
                </div>
              </motion.div>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </div>
  );
}