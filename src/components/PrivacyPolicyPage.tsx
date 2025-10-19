import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      {/* Header */}
      <div className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={onBack}>
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 mb-6 shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Privacy Policy</h1>
            <p className="text-gray-600 dark:text-gray-300">Last updated: October 16, 2025</p>
          </div>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Introduction</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Welcome to Tiny Meal Planner. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you
                about your privacy rights and how the law protects you.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Information We Collect</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>
                  <strong>Identity Data</strong> includes first name, last name, username or similar identifier.
                </li>
                <li>
                  <strong>Contact Data</strong> includes email address and telephone numbers.
                </li>
                <li>
                  <strong>Technical Data</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location.
                </li>
                <li>
                  <strong>Usage Data</strong> includes information about how you use our website and services.
                </li>
                <li>
                  <strong>Recipe Data</strong> includes meal preferences, saved recipes, and dietary restrictions you provide.
                </li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">How We Use Your Information</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>To provide and maintain our meal planning service</li>
                <li>To generate personalized meal recommendations based on your preferences</li>
                <li>To manage your account and provide customer support</li>
                <li>To send you updates about our services (with your consent)</li>
                <li>To improve our website and services</li>
                <li>To detect and prevent fraud or security issues</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Data Security</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. We use industry-standard encryption and secure
                servers to protect your information.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Your Legal Rights</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Request access to your personal data</li>
                <li>Request correction of your personal data</li>
                <li>Request erasure of your personal data</li>
                <li>Object to processing of your personal data</li>
                <li>Request restriction of processing your personal data</li>
                <li>Request transfer of your personal data</li>
                <li>Right to withdraw consent</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Cookies</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our website uses cookies to distinguish you from other users of our website. This helps us to provide you with a good experience when you browse our website and also allows us to improve our site. You can set your browser to
                refuse all or some browser cookies, or to alert you when websites set or access cookies.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Third-Party Services</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We may use third-party service providers to help us operate our business and the website or administer activities on our behalf. These third parties may have access to your personal data only to perform these tasks on our
                behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Changes to This Policy</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We may update our privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date at the top of this privacy policy.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">If you have any questions about this privacy policy or our privacy practices, please contact us at:</p>
              <p className="text-gray-600 dark:text-gray-300">
                Email: hello@tinymealplanner.co
                {/* <br />
                Address: 123 Main Street, WLV, USA */}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white dark:bg-slate-900 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">Made with 😊 in WLV by Tiny Dev Co.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
