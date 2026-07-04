import { MapPin, Mail, Phone, Share2, Camera, MessageCircle, Play } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#040810] text-gray-400 pt-14 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#1A4FBF] flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-white text-xl font-bold"
                style={{ fontFamily: "var(--font-heading)" }}
              >
                TourPlanner
              </span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500 mb-5">
              AI-powered travel planning for domestic and international adventures.
              Your perfect trip is just a chat away.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Share2, label: "Facebook" },
                { icon: Camera, label: "Instagram" },
                { icon: MessageCircle, label: "Twitter" },
                { icon: Play, label: "YouTube" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-full bg-white/8 hover:bg-[#FF5C5C] flex items-center justify-center transition-colors duration-200"
                >
                  <Icon className="w-4 h-4 text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Popular Destinations</h4>
            <ul className="space-y-2 text-sm">
              {["Cox's Bazar", "Sajek Valley", "Bandarban", "Sylhet", "Maldives", "Thailand", "Bali", "Dubai"].map((d) => (
                <li key={d}>
                  <a href="#destinations" className="hover:text-[#FF5C5C] transition-colors">
                    {d}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Home", href: "#home" },
                { label: "Destinations", href: "#destinations" },
                { label: "Season Tours", href: "#seasons" },
                { label: "Why Us", href: "#about" },
                { label: "Plan a Trip", href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <a href={l.href} className="hover:text-[#FF5C5C] transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#FF5C5C] shrink-0" />
                <span>Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#FF5C5C] shrink-0" />
                <span>hello@tourplanner.ai</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#FF5C5C] shrink-0" />
                <span>+880 1700-000000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
          <p>© {new Date().getFullYear()} TourPlanner. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
