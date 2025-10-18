// LOCKED: 2025-01-17 - StaffStep blindata da Agente 2 - Forms/Auth
// Test completi: funzionale.js, validazione.js, edge-cases.js
// Funzionalità: gestione staff, primo membro admin, validazione HACCP, categorie/ruoli
// Combinazioni testate: primo membro precompilato, aggiunta membri, validazione email/telefono/HACCP, caratteri speciali, Unicode, edge cases
import React, { useEffect, useMemo, useState } from 'react'
import { Plus, Trash2, Edit2, ShieldAlert, ShieldCheck, Lock } from 'lucide-react'

import { useScrollToForm } from '@/hooks/useScrollToForm'
import { useAuth } from '@/hooks/useAuth'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import {
  Select,
  SelectOption,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'

import {
  STAFF_ROLES,
  STAFF_CATEGORIES,
  HACCP_CERT_REQUIRED_CATEGORIES,
} from '@/utils/haccpRules'

import {
  buildStaffMember,
  getHaccpExpiryStatus,
  normalizeStaffMember,
  validateStaffMember,
} from '@/utils/onboarding/staffUtils'

import type {
  StaffMember,
  StaffStepFormData,
  StaffStepProps,
  StaffValidationErrors,
  StaffRole,
} from '@/types/onboarding'

const EMPTY_FORM: StaffStepFormData = {
  name: '',
  surname: '',
  email: '',
  phone: '',
  role: STAFF_ROLES[0].value as StaffRole,
  categories: [STAFF_CATEGORIES[0].value],
  departmentAssignments: [],
  haccpExpiry: '',
  notes: '',
}

const StaffStep = ({
  data,
  departments,
  onUpdate,
  onValidChange,
}: StaffStepProps) => {
  const { user } = useAuth() // Ottieni utente loggato
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(data || [])
  const [formData, setFormData] = useState<StaffStepFormData>({ ...EMPTY_FORM })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<StaffValidationErrors>({})

  const { formRef, scrollToForm } = useScrollToForm(
    Boolean(editingId),
    'staff-step-form'
  )

  // Identifica se stiamo editando il primo membro (utente corrente)
  const isEditingCurrentUser = useMemo(() => {
    if (!editingId || staffMembers.length === 0) return false
    const firstMember = staffMembers[0]
    return editingId === firstMember.id
  }, [editingId, staffMembers])

  // ⚠️ NUOVO: Precompila automaticamente email e ruolo per il primo membro
  useEffect(() => {
    // Se non ci sono membri E non stiamo editando, precompila con dati utente corrente
    if (staffMembers.length === 0 && !editingId && user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        role: 'admin', // Primo membro è sempre admin
      }))
    }
  }, [staffMembers.length, editingId, user])

  useEffect(() => {
    onUpdate(staffMembers)
  }, [staffMembers, onUpdate])

  useEffect(() => {
    const allValid =
      staffMembers.length > 0 &&
      staffMembers.every(member => validateStaffMember(member).success)
    onValidChange(allValid)
  }, [staffMembers, onValidChange])

  const departmentOptions = useMemo(
    () => departments.filter(department => department.is_active !== false),
    [departments]
  )

  const resetForm = () => {
    setFormData(EMPTY_FORM)
    setErrors({})
    setEditingId(null)
  }

  const handleEditMember = (member: StaffMember) => {
    setEditingId(member.id)
    setFormData(normalizeStaffMember(member))
    setErrors({})
    scrollToForm()
  }

  const handleDeleteMember = (id: string) => {
    setStaffMembers(prev => prev.filter(member => member.id !== id))
    if (editingId === id) {
      resetForm()
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const { member, validation } = buildStaffMember(formData, editingId)
    setErrors(validation.fieldErrors || {})

    if (!validation.success || !member) {
      return
    }

    setStaffMembers(prev => {
      if (editingId) {
        return prev.map(existing =>
          existing.id === editingId ? member : existing
        )
      }
      return [...prev, member]
    })

    resetForm()
  }

  const haccpSummary = useMemo(() => {
    if (staffMembers.length === 0) return null

    const requiringCertification = staffMembers.filter(member =>
      member.categories.some(category =>
        HACCP_CERT_REQUIRED_CATEGORIES.includes(category)
      )
    )

    const compliant = requiringCertification.filter(
      member =>
        validateStaffMember(member).success && Boolean(member.haccpExpiry)
    )

    const expiringSoon = requiringCertification.filter(
      member => getHaccpExpiryStatus(member.haccpExpiry).level === 'warning'
    )
    const expired = requiringCertification.filter(
      member => getHaccpExpiryStatus(member.haccpExpiry).level === 'expired'
    )

    return {
      total: staffMembers.length,
      requiringCertification: requiringCertification.length,
      compliant: compliant.length,
      expiringSoon: expiringSoon.length,
      expired: expired.length,
    }
  }, [staffMembers])

  return (
    <div className="space-y-6" id="staff-step">
      <header className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">
          Gestione del Personale
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Registra ruoli, categorie operative e certificazioni HACCP del
          personale per garantire la conformità normativa.
        </p>
      </header>

      {haccpSummary && (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Panoramica HACCP
            </h3>
            <dl className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <dt>Membri registrati</dt>
                <dd className="font-semibold">{haccpSummary.total}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Richiedono certificazione</dt>
                <dd className="font-semibold">
                  {haccpSummary.requiringCertification}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>Certificazioni valide</dt>
                <dd className="font-semibold">{haccpSummary.compliant}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
            <h3 className="text-sm font-semibold text-amber-900 mb-2">
              Scadenze monitorate
            </h3>
            <dl className="space-y-1 text-sm text-amber-800">
              <div className="flex justify-between">
                <dt>Certificati in scadenza</dt>
                <dd className="font-semibold">{haccpSummary.expiringSoon}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Certificati scaduti</dt>
                <dd className="font-semibold">{haccpSummary.expired}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Staff configurato</h3>
            <p className="text-sm text-gray-500">
              Elenco dei membri registrati durante l'onboarding
            </p>
          </div>
          <Button variant="ghost" className="gap-2" onClick={scrollToForm}>
            <Plus className="h-4 w-4" />
            {editingId ? 'Modifica membro' : 'Aggiungi membro'}
          </Button>
        </header>

        <div className="divide-y divide-gray-100">
          {staffMembers.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-500">
              Nessun membro dello staff registrato. Aggiungi almeno un membro
              per procedere.
            </p>
          )}

              {staffMembers.map((member, index) => {
            const requiresHaccp = member.categories.some(category =>
              HACCP_CERT_REQUIRED_CATEGORIES.includes(category)
            )
            const expiryStatus = getHaccpExpiryStatus(member.haccpExpiry)
            const isFirstMember = index === 0 // Il primo membro è l'utente corrente

            return (
              <article
                key={member.id}
                className={`grid gap-4 px-4 py-3 md:grid-cols-[1fr_auto] md:items-start ${
                  isFirstMember ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-semibold text-gray-900">
                      {member.fullName}
                    </h4>
                    <Badge>{member.role}</Badge>
                    {isFirstMember && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                        👤 Tu (Admin)
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {member.email && (
                      <Badge variant="secondary">{member.email}</Badge>
                    )}
                    {member.phone && (
                      <Badge variant="secondary">{member.phone}</Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {member.categories.map(category => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>

                  {member.department_assignments.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                      {member.department_assignments.map(deptId => {
                        const department = departments.find(
                          dept => dept.id === deptId
                        )
                        return department ? (
                          <Badge key={deptId} variant="outline">
                            {department.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  )}

                  {requiresHaccp && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      {expiryStatus.level === 'ok' ? (
                        <ShieldCheck
                          className="h-4 w-4 text-green-600"
                          aria-hidden
                        />
                      ) : (
                        <ShieldAlert
                          className="h-4 w-4 text-amber-600"
                          aria-hidden
                        />
                      )}
                      <span
                        className={
                          expiryStatus.level === 'expired'
                            ? 'text-red-600 font-semibold'
                            : expiryStatus.level === 'warning'
                              ? 'text-amber-600 font-semibold'
                              : 'text-green-700'
                        }
                      >
                        {expiryStatus.message}
                      </span>
                    </div>
                  )}

                  {member.notes && (
                    <p className="text-sm text-gray-500 border-l-2 border-gray-200 pl-3">
                      {member.notes}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEditMember(member)}
                    aria-label="Modifica membro"
                  >
                    <Edit2 className="h-4 w-4" aria-hidden />
                  </Button>
                  {!isFirstMember && (
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteMember(member.id)}
                      aria-label="Elimina membro"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden />
                    </Button>
                  )}
                  {isFirstMember && (
                    <div className="flex items-center gap-1 px-3 py-2 text-xs text-blue-600">
                      <Lock className="h-3 w-3" />
                      Non eliminabile
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      {/* Form - Mostra sempre se non ci sono membri, altrimenti solo se stiamo editando */}
      {(staffMembers.length === 0 || editingId) && (
        <section
          id="staff-step-form"
          ref={formRef}
          className="rounded-lg border border-gray-200 bg-gray-50 p-4"
        >
        <header className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {editingId
              ? 'Modifica membro dello staff'
              : staffMembers.length === 0
                ? '👤 Primo Membro: Amministratore (Tu)'
                : 'Aggiungi nuovo membro'}
          </h3>
          <p className="text-sm text-gray-500">
            {staffMembers.length === 0 ? (
              <>
                Il <strong>primo membro</strong> sei tu come <strong>Amministratore</strong>. 
                La tua email è già precompilata. Completa i dati mancanti (nome, cognome, telefono).
                <br />
                <span className="text-blue-600 font-medium">
                  ⚠️ Non riceverai email di invito (sei già registrato).
                </span>
              </>
            ) : isEditingCurrentUser ? (
              <>
                Stai modificando i <strong>tuoi dati</strong> come amministratore. 
                Email e ruolo non possono essere modificati.
              </>
            ) : (
              <>
                Compila i campi per aggiungere un altro membro. 
                Il sistema invierà automaticamente un'<strong>email di invito</strong> all'indirizzo inserito.
              </>
            )}
          </p>
        </header>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="staff-name">Nome *</Label>
              <Input
                id="staff-name"
                value={formData.name}
                onChange={event =>
                  setFormData(prev => ({ ...prev, name: event.target.value }))
                }
                placeholder="Mario"
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="staff-surname">Cognome *</Label>
              <Input
                id="staff-surname"
                value={formData.surname}
                onChange={event =>
                  setFormData(prev => ({
                    ...prev,
                    surname: event.target.value,
                  }))
                }
                placeholder="Rossi"
                aria-invalid={Boolean(errors.surname)}
              />
              {errors.surname && (
                <p className="mt-1 text-sm text-red-600">{errors.surname}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="staff-email">
                Email {staffMembers.length === 0 && '*'}
                {(staffMembers.length === 0 || isEditingCurrentUser) && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    (La tua email)
                  </span>
                )}
              </Label>
              <Input
                id="staff-email"
                type="email"
                value={formData.email}
                onChange={event =>
                  setFormData(prev => ({ ...prev, email: event.target.value }))
                }
                placeholder="email@azienda.it"
                aria-invalid={Boolean(errors.email)}
                readOnly={staffMembers.length === 0 || isEditingCurrentUser}
                disabled={staffMembers.length === 0 || isEditingCurrentUser}
                className={
                  staffMembers.length === 0 || isEditingCurrentUser
                    ? 'bg-blue-50 border-blue-200 cursor-not-allowed'
                    : ''
                }
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
              {(staffMembers.length === 0 || isEditingCurrentUser) && (
                <p className="mt-1 text-xs text-blue-600">
                  🔒 Email precompilata dall'account con cui hai effettuato il login
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="staff-phone">Telefono</Label>
              <Input
                id="staff-phone"
                value={formData.phone}
                onChange={event =>
                  setFormData(prev => ({ ...prev, phone: event.target.value }))
                }
                placeholder="+39 340 1234567"
                aria-invalid={Boolean(errors.phone)}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="staff-role">
                Ruolo *
                {(staffMembers.length === 0 || isEditingCurrentUser) && (
                  <span className="ml-2 text-xs text-blue-600 font-normal">
                    (Amministratore)
                  </span>
                )}
              </Label>
              {staffMembers.length === 0 || isEditingCurrentUser ? (
                // Primo membro: ruolo fisso "admin"
                <div className="relative">
                  <Input
                    value="Amministratore"
                    readOnly
                    disabled
                    className="bg-blue-50 border-blue-200 cursor-not-allowed"
                  />
                  <p className="mt-1 text-xs text-blue-600">
                    🔒 Il primo membro è sempre Amministratore
                  </p>
                </div>
              ) : (
                // Altri membri: ruolo selezionabile
                <Select
                  value={formData.role}
                  onValueChange={value =>
                    setFormData(prev => ({ ...prev, role: value as StaffRole }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona ruolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAFF_ROLES.map(role => (
                      <SelectOption key={role.value} value={role.value}>
                        {role.label}
                      </SelectOption>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div>
              <Label>Categorie *</Label>
              <div className="space-y-2">
                {formData.categories.map((category, index) => (
                  <div
                    key={`category-${index}`}
                    className="flex items-center gap-2"
                  >
                    <Select
                      value={category}
                      onValueChange={value =>
                        setFormData(prev => ({
                          ...prev,
                          categories: prev.categories.map((existing, idx) =>
                            idx === index ? (value as string) : existing
                          ),
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {STAFF_CATEGORIES.map(option => (
                          <SelectOption key={option.value} value={option.value}>
                            {option.label}
                          </SelectOption>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.categories.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.filter(
                              (_, idx) => idx !== index
                            ),
                          }))
                        }
                        aria-label="Rimuovi categoria"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setFormData(prev => ({
                      ...prev,
                      categories: [
                        ...prev.categories,
                        STAFF_CATEGORIES[0].value,
                      ],
                    }))
                  }
                  className="w-full"
                >
                  Aggiungi categoria
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label>Assegnazione reparti</Label>
            <div className="mt-2 space-y-2">
              {/* Opzione "Tutti" */}
              <label className="flex items-center gap-2 rounded border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={
                    formData.departmentAssignments.length ===
                      departmentOptions.length && departmentOptions.length > 0
                  }
                  onChange={event => {
                    const isChecked = event.target.checked
                    setFormData(prev => ({
                      ...prev,
                      departmentAssignments: isChecked
                        ? departmentOptions.map(dept => dept.id)
                        : [],
                    }))
                  }}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-blue-800">🎯 Tutti i reparti</span>
              </label>

              {/* Reparti individuali */}
              <div className="grid gap-2 md:grid-cols-2">
                {departmentOptions.map(department => (
                  <label
                    key={department.id}
                    className="flex items-center gap-2 rounded border border-gray-200 bg-white px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={formData.departmentAssignments.includes(
                        department.id
                      )}
                      onChange={event => {
                        const isChecked = event.target.checked
                        setFormData(prev => ({
                          ...prev,
                          departmentAssignments: isChecked
                            ? [...prev.departmentAssignments, department.id]
                            : prev.departmentAssignments.filter(
                                id => id !== department.id
                              ),
                        }))
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{department.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="staff-haccp-expiry">
              Scadenza certificazione HACCP *
            </Label>
            <Input
              id="staff-haccp-expiry"
              type="date"
              value={formData.haccpExpiry}
              onChange={event =>
                setFormData(prev => ({
                  ...prev,
                  haccpExpiry: event.target.value,
                }))
              }
              aria-invalid={Boolean(errors.haccpExpiry)}
            />
            {errors.haccpExpiry && (
              <p className="mt-1 text-sm text-red-600">{errors.haccpExpiry}</p>
            )}
          </div>

          <div>
            <Label htmlFor="staff-notes">Note</Label>
            <Textarea
              id="staff-notes"
              value={formData.notes}
              onChange={event =>
                setFormData(prev => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Aggiungi note sulla certificazione HACCP o sul membro"
            />
          </div>

          <Button type="submit" className="w-full">
            {editingId ? 'Salva modifiche' : 'Aggiungi membro'}
          </Button>
        </form>
      </section>
      )}

      {/* Pulsante Aggiungi quando ci sono già membri */}
      {staffMembers.length > 0 && !editingId && (
        <div className="mb-4">
          <button
            onClick={() => setEditingId('new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Aggiungi Nuovo Membro
          </button>
        </div>
      )}
    </div>
  )
}

export default StaffStep
