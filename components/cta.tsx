import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CtaProps {
  heading: string;
  description: string;
  buttons?: {
    primary?: {
      text: string;
      url: string;
    };
    secondary?: {
      text: string;
      url: string;
    };
  };
}

const Cta = ({ heading, description, buttons }: CtaProps) => {
  return (
    <section className="py-12 md:py-16 lg:py-24 px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h3 className="text-3xl font-semibold tracking-tight md:text-4xl">
          {heading}
        </h3>
        <p className="mt-4 text-muted-foreground md:text-lg">
          {description}
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          {buttons?.secondary && (
            <Button variant="outline" size="lg" asChild>
              <a href={buttons.secondary.url}>{buttons.secondary.text}</a>
            </Button>
          )}
          {buttons?.primary && (
            <Button size="lg" asChild>
              <a href={buttons.primary.url}>
                {buttons.primary.text} <ArrowUpRight className="h-5! w-5!" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export { Cta };
