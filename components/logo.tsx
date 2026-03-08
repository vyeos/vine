export const Logo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={100}
    height={100}
    viewBox="0 0 100 100"
    fill="none"
  >
    {/* Leaf shape */}
    <path
      d="M50 8C50 8 20 30 20 58C20 74.6 33.4 88 50 88C66.6 88 80 74.6 80 58C80 30 50 8 50 8Z"
      fill="currentColor"
      className="text-primary"
    />
    {/* Center vein */}
    <path
      d="M50 22V78"
      stroke="currentColor"
      className="text-primary-foreground"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Left veins */}
    <path
      d="M50 40L34 50M50 52L32 60M50 64L36 70"
      stroke="currentColor"
      className="text-primary-foreground"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Right veins */}
    <path
      d="M50 40L66 50M50 52L68 60M50 64L64 70"
      stroke="currentColor"
      className="text-primary-foreground"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);
