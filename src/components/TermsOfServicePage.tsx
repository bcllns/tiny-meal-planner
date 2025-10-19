import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TermsOfServicePageProps {
  onBack: () => void;
}

export function TermsOfServicePage({ onBack }: TermsOfServicePageProps) {
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
              <FileText className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Terms of Service</h1>
            <p className="text-gray-600 dark:text-gray-300">Last updated: October 16, 2025</p>
          </div>

          {/* Content Sections */}
          <div className="prose prose-lg max-w-none dark:prose-invert">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Agreement to Terms</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                By accessing or using Tiny Meal Planner, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this
                site.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Use License</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Permission is granted to temporarily access and use Tiny Meal Planner for personal, non-commercial purposes. This license shall automatically terminate if you violate any of these restrictions.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Under this license you may not:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software contained on the service</li>
                <li>Remove any copyright or proprietary notations from the materials</li>
                <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">User Accounts</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your
                account.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password. You agree not to disclose your password to any third party.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Content and Intellectual Property</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Our service allows you to create, save, and share meal plans and recipes. You retain all rights to any content you submit, post or display on or through the service. By submitting content, you grant us a worldwide,
                non-exclusive, royalty-free license to use, copy, reproduce, process, adapt, publish, and display such content.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The service and its original content (excluding user-generated content), features, and functionality are owned by Tiny Dev Co. and are protected by international copyright, trademark, patent, trade secret, and other
                intellectual property laws.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">AI-Generated Content</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Tiny Meal Planner uses artificial intelligence to generate meal suggestions and recipes. While we strive for accuracy and quality, AI-generated content may contain errors or inaccuracies. You should always verify recipes,
                ingredients, and cooking instructions before use, especially regarding:
              </p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>Food allergies and dietary restrictions</li>
                <li>Food safety and proper cooking temperatures</li>
                <li>Ingredient substitutions and measurements</li>
                <li>Nutritional information and calorie counts</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-300 mt-4">We are not responsible for any adverse reactions, food safety issues, or other problems that may arise from following AI-generated recipes.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Prohibited Uses</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">You may not use our service:</p>
              <ul className="list-disc pl-6 text-gray-600 dark:text-gray-300 space-y-2">
                <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>To infringe upon or violate our intellectual property rights or the intellectual property rights of others</li>
                <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                <li>To submit false or misleading information</li>
                <li>To upload or transmit viruses or any other type of malicious code</li>
                <li>To spam, phish, pharm, pretext, spider, crawl, or scrape</li>
                <li>For any obscene or immoral purpose</li>
                <li>To interfere with or circumvent the security features of the service</li>
              </ul>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Subscription and Payments</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Some parts of the service are billed on a subscription basis. You will be billed in advance on a recurring and periodic basis. Billing cycles are set on a monthly or annual basis, depending on the type of subscription plan
                you select.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                At the end of each billing cycle, your subscription will automatically renew unless you cancel it or we cancel it. You may cancel your subscription renewal through your account settings or by contacting our customer support
                team.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Disclaimer</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                The materials on Tiny Meal Planner are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim and negate all other warranties including, without limitation, implied warranties or
                conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Further, we do not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this
                site.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Limitation of Liability</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                In no event shall Tiny Dev Co. or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use Tiny
                Meal Planner, even if we or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Termination</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to
                a breach of the Terms.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mb-4">If you wish to terminate your account, you may simply discontinue using the service or contact us to request account deletion.</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Changes to Terms</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
                material change will be determined at our sole discretion.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Contact Us</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">If you have any questions about these Terms of Service, please contact us at:</p>
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
