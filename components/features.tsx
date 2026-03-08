import {
  Code2,
  LayoutDashboard,
  PenTool,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Management",
    description:
      "Intuitive UI for easy author, category, tags, and post management.",
  },
  {
    icon: PenTool,
    title: "Writing Experience",
    description:
      "Smooth writing experience with just the right tools of formatting.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Seamless workspace-based collaboration.",
  },
  {
    icon: Code2,
    title: "API Access",
    description:
      "Straightforward API access that works with any framework: Next, Astro, Express, etc.",
  },
  {
    icon: ShieldCheck,
    title: "Role Based Control",
    description:
      "Secure your workspace with granular permissions and role-based access control.",
  },
  {
    icon: Sparkles,
    title: "More Coming Soon",
    description:
      "We are constantly adding new features to make your experience better.",
  },
];

const Features = () => {
  return (
    <div
      id="features"
      className="flex items-center justify-center bg-muted/30 py-12 md:py-16 lg:py-24"
    >
      <div>
        <h2 className="text-4xl sm:text-5xl font-semibold tracking-tight text-center">
          Everything You Need
        </h2>
        <p className="mt-4 text-center text-muted-foreground max-w-2xl mx-auto px-6">
          Vine gives your team the tools to write, organize, and deliver content — without the complexity.
        </p>
        <div className="mt-10 sm:mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-(--breakpoint-lg) mx-auto px-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="feature-animate flex flex-col border border-border rounded-xl py-6 px-5 bg-background/60 hover:border-primary/30 hover:shadow-md"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="icon-pulse mb-4 h-10 w-10 flex items-center justify-center bg-primary/10 text-primary rounded-full">
                <feature.icon className="size-5" />
              </div>
              <span className="text-lg font-semibold">{feature.title}</span>
              <p className="mt-1 text-muted-foreground text-[15px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
