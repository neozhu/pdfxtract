import { Scan, Github } from "lucide-react";



interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

interface NavbarProps {
  logo?: {
    url: string;
    src: string;
    alt: string;
    title: string;
  };
  menu?: MenuItem[];
  auth?: {
    login: {
      title: string;
      url: string;
    };
    signup: {
      title: string;
      url: string;
    };
  };
}

const Navbar = ({
  logo = {
    url: "https://pdfxtract.blazorserver.com",
    src: "https://shadcnblocks.com/images/block/logos/shadcnblockscom-icon.svg",
    alt: "logo",
    title: "PDFXtract",
  }
}: NavbarProps) => {
  return (
    <section className="py-4">
      <div className="container">
        {/* Desktop Menu */}
        <nav className="hidden justify-between lg:flex">
          <div className="flex items-center gap-6">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <Scan className="max-h-8" />
              <span className="text-lg font-semibold tracking-tighter motion-safe:animate-in motion-safe:fade-in">
                {logo.title}
              </span>
            </a>
          </div>
          {/* GitHub icon on the right */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/neozhu/pdfxtract"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <Github className="size-7 hover:text-primary transition-colors" />
            </a>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="block lg:hidden">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a href={logo.url} className="flex items-center gap-2">
              <Scan className="max-h-8" />
            </a>
            {/* GitHub icon on the right */}
            <a
              href="https://github.com/neozhu/pdfxtract"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <Github className="size-7 hover:text-primary transition-colors" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Navbar };
