"use client"

import { useState, useEffect, useRef } from "react"
import type { Property } from "@/lib/properties"

interface ContactModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
}

interface FormData {
  name: string
  email: string
  phone: string
  moveTimeline: string
  occupants: string
  message: string
  gdprConsent: boolean
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  moveTimeline: "",
  occupants: "",
  message: "",
  gdprConsent: false,
}

export function ContactModal({ property, isOpen, onClose }: ContactModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitState, setSubmitState] = useState<"idle" | "success" | "error">("idle")
  const modalRef = useRef<HTMLDivElement>(null)
  const firstInputRef = useRef<HTMLInputElement>(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData(initialFormData)
      setErrors({})
      setSubmitState("idle")
      // Focus first input after modal opens
      setTimeout(() => firstInputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Focus trap
  useEffect(() => {
    if (!isOpen || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    document.addEventListener("keydown", handleTabKey)
    return () => document.removeEventListener("keydown", handleTabKey)
  }, [isOpen])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isOpen])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Nimi vaaditaan"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Sähköposti vaaditaan"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Tarkista sähköpostiosoite"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Puhelin vaaditaan"
    } else if (!/^[\d\s\-+()]{7,}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Tarkista puhelinnumero"
    }

    if (!formData.moveTimeline) {
      newErrors.moveTimeline = "Valitse muuttoaikataulu"
    }

    if (!formData.gdprConsent) {
      newErrors.gdprConsent = "Hyväksy tietojen käsittely"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !property) return

    setIsSubmitting(true)

    try {
      const payload = {
        propertyId: property.id,
        propertyDbId: property.db_id,
        propertyName: property.name,
        propertyAddress: property.address,
        propertyPrice: property.price,
        propertySize: property.size,
        ...formData,
      }

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSubmitState("success")
      } else {
        setSubmitState("error")
      }
    } catch {
      setSubmitState("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  if (!isOpen || !property) return null

  // Success state
  if (submitState === "success") {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-elea-navy mb-2">Kiitos yhteydenotostasi!</h2>
          <p className="text-elea-text-muted mb-6">
            Olemme vastaanottaneet viestisi koskien kohdetta <strong>{property.name}</strong>.
            Olemme yhteydessä 1–2 arkipäivän kuluessa.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-elea-navy text-white rounded-lg font-medium hover:opacity-90 transition"
          >
            Sulje
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-elea-border px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 id="modal-title" className="text-lg font-semibold text-elea-navy">
            Ota yhteyttä
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
            aria-label="Sulje"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Property info */}
          <div className="p-4 rounded-xl bg-elea-bg-warm border border-elea-border">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-elea-navy/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-elea-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-elea-navy">{property.name}</p>
                <p className="text-sm text-elea-text-muted">
                  {property.price > 0 && `${property.price.toLocaleString("fi-FI")} €/kk`}
                  {property.price > 0 && property.size > 0 && " · "}
                  {property.size > 0 && `${property.size} m²`}
                  {property.roomLayout && ` · ${property.roomLayout}`}
                </p>
              </div>
            </div>
          </div>

          {/* Contact info section */}
          <div className="space-y-4">
            <p className="text-sm font-medium text-elea-navy">Yhteystietosi</p>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-elea-text-muted mb-1">
                Nimi <span className="text-red-500">*</span>
              </label>
              <input
                ref={firstInputRef}
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.name ? "border-red-400 bg-red-50" : "border-elea-border"
                } focus:outline-none focus:ring-2 focus:ring-elea-navy/20 focus:border-elea-navy transition`}
                placeholder="Matti Meikäläinen"
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-elea-text-muted mb-1">
                Sähköposti <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.email ? "border-red-400 bg-red-50" : "border-elea-border"
                } focus:outline-none focus:ring-2 focus:ring-elea-navy/20 focus:border-elea-navy transition`}
                placeholder="matti@example.com"
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm text-elea-text-muted mb-1">
                Puhelin <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                className={`w-full px-3 py-2.5 rounded-lg border ${
                  errors.phone ? "border-red-400 bg-red-50" : "border-elea-border"
                } focus:outline-none focus:ring-2 focus:ring-elea-navy/20 focus:border-elea-navy transition`}
                placeholder="040 123 4567"
              />
              {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
            </div>
          </div>

          {/* Background info section */}
          <div className="space-y-4 pt-2 border-t border-elea-border">
            <p className="text-sm font-medium text-elea-navy pt-4">Taustatiedot</p>

            {/* Move timeline */}
            <div>
              <label className="block text-sm text-elea-text-muted mb-2">
                Milloin voisit muuttaa? <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: "asap", label: "Heti kun mahdollista" },
                  { value: "1-2months", label: "1–2 kuukauden sisällä" },
                  { value: "3+months", label: "3+ kuukauden päästä" },
                  { value: "unknown", label: "En ole vielä varma" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      formData.moveTimeline === option.value
                        ? "border-elea-navy bg-elea-navy/5"
                        : "border-elea-border hover:border-elea-navy/30"
                    }`}
                  >
                    <input
                      type="radio"
                      name="moveTimeline"
                      value={option.value}
                      checked={formData.moveTimeline === option.value}
                      onChange={(e) => updateField("moveTimeline", e.target.value)}
                      className="w-4 h-4 accent-elea-navy"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.moveTimeline && <p className="mt-1 text-xs text-red-500">{errors.moveTimeline}</p>}
            </div>

            {/* Occupants */}
            <div>
              <label className="block text-sm text-elea-text-muted mb-2">Montako henkilöä muuttaisi?</label>
              <div className="flex gap-2">
                {["1", "2", "3+"].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => updateField("occupants", option)}
                    className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition ${
                      formData.occupants === option
                        ? "border-elea-navy bg-elea-navy text-white"
                        : "border-elea-border hover:border-elea-navy/30"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm text-elea-text-muted mb-1">
                Viesti (vapaaehtoinen)
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => updateField("message", e.target.value)}
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg border border-elea-border focus:outline-none focus:ring-2 focus:ring-elea-navy/20 focus:border-elea-navy transition resize-none"
                placeholder="Hei! Olen kiinnostunut asunnosta. Voisinko tulla katsomaan sitä?"
              />
            </div>
          </div>

          {/* GDPR consent */}
          <div className="pt-2 border-t border-elea-border">
            <label className={`flex items-start gap-3 pt-4 cursor-pointer ${errors.gdprConsent ? "text-red-500" : ""}`}>
              <input
                type="checkbox"
                checked={formData.gdprConsent}
                onChange={(e) => updateField("gdprConsent", e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-elea-navy rounded"
              />
              <span className="text-sm text-elea-text-muted">
                Hyväksyn tietojeni käsittelyn yhteydenottoa varten. <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.gdprConsent && <p className="mt-1 text-xs text-red-500 ml-7">{errors.gdprConsent}</p>}
          </div>

          {/* Error state */}
          {submitState === "error" && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              Viestin lähetys epäonnistui. Yritä uudelleen tai ota yhteyttä suoraan sähköpostilla.
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-elea-navy text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Lähetetään...
              </>
            ) : (
              "Lähetä yhteydenotto"
            )}
          </button>

          <p className="text-xs text-center text-elea-text-light">
            Vastaamme yleensä 1–2 arkipäivän kuluessa.
          </p>
        </form>
      </div>
    </div>
  )
}
