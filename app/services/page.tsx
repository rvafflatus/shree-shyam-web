import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quick Services & Document Portals | Shree Shyam",
  description: "Quick access to official document and government service portals.",
};

const services = [
  {
    title: "Aadhaar Download",
    description: "Download your Aadhaar card from the UIDAI portal.",
    icon: "🪪",
    href: "https://myaadhaar.uidai.gov.in/genricDownloadAadhaar/en",
  },
  {
    title: "Instant E-PAN Download",
    description: "Apply for or download your Instant E-PAN.",
    icon: "💳",
    href: "https://eportal.incometax.gov.in/iec/foservices/#/pre-login/instant-e-pan",
  },
  {
    title: "Driving Licence / Sarathi",
    description: "Access driving licence services through Parivahan Sarathi.",
    icon: "🚘",
    href: "https://sarathi.parivahan.gov.in/sarathiservice/stateSelectBean.do",
  },
  {
    title: "Voter ID Portal",
    description: "Visit the Election Commission of India voter services portal.",
    icon: "🗳️",
    href: "https://voters.eci.gov.in/",
  },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center sm:mb-14">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-emerald-500" />
            e-Mitra Service Desk
          </span>
          <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Shree Shyam Quick Services &amp; Document Portals
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Open a trusted government portal below to access document and citizen services.
          </p>
        </header>

        <section
          aria-label="Available service portals"
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {services.map((service) => (
            <a
              key={service.title}
              href={service.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex min-h-60 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
            >
              <span
                aria-hidden="true"
                className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-3xl transition-colors group-hover:bg-blue-100"
              >
                {service.icon}
              </span>
              <h2 className="text-lg font-bold text-slate-900 group-hover:text-blue-700">
                {service.title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                {service.description}
              </p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-blue-700">
                Open official portal
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </span>
            </a>
          ))}
        </section>

        <p className="mt-8 text-center text-xs leading-5 text-slate-500">
          You will be redirected to the selected government portal in a new tab.
        </p>
      </div>
    </main>
  );
}
