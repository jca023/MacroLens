import { ArrowLeft } from 'lucide-react'

interface PrivacyPolicyProps {
  onBack: () => void
}

export function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-dvh bg-black">
      {/* Header */}
      <div className="sticky top-0 bg-black/95 backdrop-blur-sm border-b border-zinc-800 p-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 -ml-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold text-white">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 pb-12">
        <p className="text-gray-400 text-sm mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Introduction</h2>
            <p className="leading-relaxed">
              MacroLens ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, store, and protect your personal information when you use our
              nutrition tracking application. By using MacroLens, you consent to the practices described
              in this policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Information We Collect</h2>

            <h3 className="text-md font-medium text-white mt-4 mb-2">Account Information</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mb-4">
              <li>Email address (for authentication and account recovery)</li>
              <li>Authentication tokens and session data</li>
            </ul>

            <h3 className="text-md font-medium text-white mt-4 mb-2">Profile Information</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mb-4">
              <li>Name</li>
              <li>Age and gender</li>
              <li>Weight and height</li>
              <li>Activity level</li>
              <li>Fitness goals (lose, maintain, or gain weight)</li>
              <li>Preferred unit system (metric or imperial)</li>
              <li>Custom macro split preferences</li>
            </ul>

            <h3 className="text-md font-medium text-white mt-4 mb-2">Health & Nutrition Data</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mb-4">
              <li>Calculated BMR (Basal Metabolic Rate) and TDEE (Total Daily Energy Expenditure)</li>
              <li>Daily calorie and macro targets</li>
              <li>Meal logs including food descriptions, timestamps, and nutritional values</li>
              <li>Food photos you upload for AI analysis</li>
            </ul>

            <h3 className="text-md font-medium text-white mt-4 mb-2">Usage Data</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>AI processing statistics (for service optimization)</li>
              <li>Feature usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. How We Use Your Information</h2>
            <p className="leading-relaxed mb-3">We use your information to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Provide personalized calorie and macro targets based on your profile</li>
              <li>Track and display your nutrition progress</li>
              <li>Analyze food photos using AI to estimate nutritional content</li>
              <li>Authenticate your account and maintain security</li>
              <li>Improve and optimize our services</li>
              <li>Communicate important updates about the App</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Data Storage & Security</h2>
            <p className="leading-relaxed mb-3">
              Your data is stored securely using Supabase, a trusted cloud platform with enterprise-grade security.
              We implement the following protections:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Encrypted data transmission (HTTPS/TLS)</li>
              <li>Secure authentication with one-time passwords (OTP)</li>
              <li>Row-level security policies on database tables</li>
              <li>Secure cloud storage for uploaded images</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p className="leading-relaxed mb-3">MacroLens uses the following third-party services:</p>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
              <h4 className="font-medium text-white mb-2">Google Gemini AI</h4>
              <p className="text-gray-400 text-sm">
                When you upload a food photo, it is sent to Google's Gemini AI service for nutritional analysis.
                Google processes this image according to their privacy policy. We do not send any personal
                identifying information with these requests.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h4 className="font-medium text-white mb-2">Supabase</h4>
              <p className="text-gray-400 text-sm">
                We use Supabase for authentication, database storage, and file storage. Supabase is SOC 2
                Type II compliant and follows industry-standard security practices.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. Data Sharing</h2>
            <p className="leading-relaxed">
              We do not sell, trade, or rent your personal information to third parties. We only share
              data with third-party services as described above (AI processing and infrastructure) and
              may disclose information if required by law or to protect our rights and safety.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Your Rights</h2>
            <p className="leading-relaxed mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li><strong className="text-white">Access</strong> - Request a copy of your personal data</li>
              <li><strong className="text-white">Correct</strong> - Update inaccurate profile information through the App settings</li>
              <li><strong className="text-white">Delete</strong> - Request deletion of your account and associated data</li>
              <li><strong className="text-white">Export</strong> - Request your data in a portable format</li>
            </ul>
            <p className="leading-relaxed mt-3">
              To exercise these rights, contact us at the email address provided below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your data for as long as your account is active. If you delete your account,
              we will delete your personal data within 30 days, except where we are required to retain
              it for legal or legitimate business purposes. Meal photos stored in cloud storage will
              also be deleted upon account deletion.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Children's Privacy</h2>
            <p className="leading-relaxed">
              MacroLens is not intended for children under 13 years of age. We do not knowingly collect
              personal information from children under 13. If we discover that we have collected data
              from a child under 13, we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant
              changes by posting a notice in the App. Your continued use of MacroLens after changes
              are posted constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy or wish to exercise your data rights,
              please contact us at{' '}
              <span className="text-[#F97066]">privacy@macrolens.app</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
