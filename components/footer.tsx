import Image from "next/image";
import { GithubIcon } from "lucide-react";
import Link from "next/link";

const footerLinks = [
  {
    title: "Overview",
    href: "/",
  },
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "FAQ",
    href: "#faq",
  },
  {
    title: "Docs",
    href: "/docs",
  },
];

const Footer = () => {
  return (
    <footer className="border-t bg-muted/20">
      <div className="mx-auto max-w-(--breakpoint-xl) px-6 xl:px-0">
        <div className="flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/vine.png"
                alt="Vine Logo"
                width={28}
                height={28}
                className="object-contain"
              />
              <span className="text-base font-semibold tracking-tight">Vine</span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              A simple headless CMS for your next project.
            </p>
          </div>

          <nav>
            <ul className="flex flex-wrap gap-x-6 gap-y-2">
              {footerLinks.map(({ title, href }) => (
                <li key={title}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col-reverse items-center justify-between gap-4 border-t py-6 sm:flex-row">
          <span className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Vine. Built by{" "}
            <Link
              href="https://x.com/vye_os"
              target="_blank"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Vyeos
            </Link>
          </span>

          <Link
            href="https://github.com/vyeos/vine"
            target="_blank"
            aria-label="Vine on GitHub"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <GithubIcon className="size-5" />
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
