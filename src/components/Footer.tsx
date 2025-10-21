import { Instagram } from "lucide-react";

export function Footer({ onHowItWorks, onPrivacyPolicy, onTermsOfService }: { onHowItWorks?: () => void; onPrivacyPolicy?: () => void; onTermsOfService?: () => void }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-white dark:bg-slate-900 mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">About Tiny Meal Planner</h3>
            <p className="text-sm text-muted-foreground">AI-powered meal planning application that helps you create delicious meals for any number of people.</p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <button onClick={onHowItWorks} className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={onPrivacyPolicy} className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={onTermsOfService} className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <a href="mailto:hello@tinydevco.com" className="hover:text-gray-800 dark:hover:text-gray-100 transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">Connect With Us</h3>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="TikTok">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">Made with 😊 in WLV by Tiny Dev Co. © {currentYear}</p>
        </div>
      </div>
    </footer>
  );
}
