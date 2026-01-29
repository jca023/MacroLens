import { ArrowLeft } from 'lucide-react'

interface TermsOfServiceProps {
  onBack: () => void
}

export function TermsOfService({ onBack }: TermsOfServiceProps) {
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
          <h1 className="text-xl font-bold text-white">Terms of Service</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 pb-12">
        <p className="text-gray-400 text-sm mb-8">Last updated: January 2025</p>

        <div className="space-y-8 text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using MacroLens ("the App"), you agree to be bound by these Terms of Service.
              If you do not agree to these terms, please do not use the App. We reserve the right to modify
              these terms at any time, and your continued use of the App constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">2. Description of Service</h2>
            <p className="leading-relaxed mb-3">
              MacroLens is a nutrition tracking application that helps users monitor their dietary intake.
              The App provides:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>AI-powered food recognition and nutritional analysis using Google Gemini</li>
              <li>Manual meal logging and tracking</li>
              <li>Personalized calorie and macro targets based on your profile</li>
              <li>Progress tracking and weekly analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">3. User Accounts</h2>
            <p className="leading-relaxed mb-3">
              To use MacroLens, you must create an account using a valid email address. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete profile information</li>
              <li>Notifying us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p className="leading-relaxed mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 text-gray-400">
              <li>Use the App for any unlawful purpose</li>
              <li>Upload inappropriate, offensive, or harmful content</li>
              <li>Attempt to reverse engineer or compromise the App's security</li>
              <li>Use automated systems to access the App without permission</li>
              <li>Share your account with others or create multiple accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">5. Health Disclaimer</h2>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <p className="leading-relaxed text-gray-300">
                <strong className="text-white">Important:</strong> MacroLens is intended for general wellness
                and informational purposes only. It is not a substitute for professional medical advice,
                diagnosis, or treatment. The nutritional information provided by our AI analysis is an
                estimate and may not be 100% accurate. Always consult with a qualified healthcare provider
                or registered dietitian before making significant changes to your diet, especially if you
                have any medical conditions or dietary restrictions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">6. AI-Generated Content</h2>
            <p className="leading-relaxed">
              MacroLens uses Google Gemini AI to analyze food images and estimate nutritional content.
              While we strive for accuracy, AI-generated nutritional estimates may contain errors.
              These estimates should be used as a general guide rather than precise measurements.
              We are not responsible for any decisions made based on AI-generated nutritional information.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">7. Intellectual Property</h2>
            <p className="leading-relaxed">
              The App, including its design, features, and content, is protected by copyright and other
              intellectual property laws. You retain ownership of any content you upload (such as meal photos),
              but grant us a license to use this content to provide and improve our services.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the maximum extent permitted by law, MacroLens and its creators shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, including but not
              limited to loss of data, health issues, or any other damages arising from your use of the App.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">9. Termination</h2>
            <p className="leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violation of these
              terms or for any other reason at our discretion. You may also delete your account at any time
              through the App settings. Upon termination, your right to use the App will immediately cease.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">10. Changes to Terms</h2>
            <p className="leading-relaxed">
              We may update these Terms of Service from time to time. We will notify users of any material
              changes by posting the new terms in the App. Your continued use of MacroLens after such
              changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-3">11. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about these Terms of Service, please contact us at{' '}
              <span className="text-emerald-500">support@macrolens.app</span>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
