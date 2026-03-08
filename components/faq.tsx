import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faq = [
  {
    question: "What is Vine?",
    answer:
      "Vine is a simple, straightforward CMS designed for teams and creators who want to manage content in one place and fetch it from any frontend using a clean API.",
  },
  {
    question: "Which frameworks does Vine support?",
    answer:
      "Vine works with any framework that can make HTTP requests. This includes Next.js, Astro, Express, React, Vue, and many others.",
  },
  {
    question: "How does the API work?",
    answer:
      "Vine provides a straightforward REST API that allows you to fetch content programmatically. Simply generate API keys for your workspace and start fetching posts, categories, and tags.",
  },
  {
    question: "Can multiple users collaborate?",
    answer:
      "Yes! Vine supports workspace-based collaboration, allowing multiple team members to work together on content creation and management seamlessly.",
  },
];

const FAQ = () => {
  return (
    <div id="faq" className="flex items-center justify-center px-6 py-12 md:py-16 lg:py-24">
      <div className="w-full max-w-5xl flex flex-col md:flex-row items-start gap-x-12 gap-y-6">
        <h2 className="text-4xl lg:text-5xl leading-[1.15]! font-semibold tracking-[-0.035em]">
          Frequently Asked <br /> Questions
        </h2>

        <Accordion
          type="single"
          collapsible
          className="w-full max-w-xl"
        >
          {faq.map(({ question, answer }, index) => (
            <AccordionItem
              key={question}
              value={`question-${index}`}
              className="border-foreground/10"
            >
              <AccordionTrigger className="text-left text-lg">
                {question}
              </AccordionTrigger>
              <AccordionContent className="text-base text-muted-foreground">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default FAQ;
