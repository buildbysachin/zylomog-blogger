import Link from "next/link";
import { Twitter, Facebook, Instagram, Youtube } from "lucide-react";
import { CATEGORIES } from "@/types";

export function Footer({
  siteName = "Zylomog",
  tagline = "Tech News, Reviews & Deep Dives",
  socialLinks = {},
}: {
  siteName?: string;
  tagline?: string;
  socialLinks?: { twitter?: string; facebook?: string; instagram?: string; youtube?: string };
}) {
  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div>
          <h3 className="text-xl font-extrabold text-gradient">{siteName}</h3>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">{tagline}</p>
          <div className="mt-4 flex gap-3">
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noreferrer" aria-label="Twitter">
                <Twitter className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {socialLinks.facebook && (
              <a href={socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
                <Facebook className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
                <Instagram className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube">
                <Youtube className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </a>
            )}
          </div>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Categories</h4>
          <ul className="space-y-2">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <li key={cat}>
                <Link href={`/category/${encodeURIComponent(cat)}`} className="text-sm hover:text-primary">
                  {cat}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-primary">About</Link></li>
            <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-primary">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Account</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/login" className="hover:text-primary">Sign In</Link></li>
            <li><Link href="/register" className="hover:text-primary">Create Account</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteName}. All rights reserved.
      </div>
    </footer>
  );
}
