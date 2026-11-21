import React, { useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  CIVIC_CATEGORIES,
  CivicCategory,
  sanitizeRecordId,
  UnifiedReviewItem,
  useCivicData,
} from '../context/CivicDataContext';
import { ServiceCategory, VerificationStatus } from '../types/civic';

const VERIFICATION_STATUSES: VerificationStatus[] = [
  'Verified',
  'Needs Review',
  'Outdated',
  'Unavailable',
];

const SERVICE_CATEGORIES: ServiceCategory[] = [
  'Civil Registration',
  'Business Permits and Licensing',
  'Taxation and Treasury',
  'Property Assessment',
  'Health Services',
  'Social Welfare',
  'Agriculture',
  'Building and Construction',
  'Employment Assistance',
  'Disaster Risk Reduction',
  'Senior Citizen Services',
  'PWD Services',
  'Solo Parent Services',
];

interface AdminRecordModalProps {
  category: CivicCategory;
  editingItem: UnifiedReviewItem | null;
  onClose: () => void;
  onSaved: (message: string) => void;
}

function asString(val: unknown, fallback = ''): string {
  return typeof val === 'string' ? val : val == null ? fallback : String(val);
}

function asLines(val: unknown): string {
  return Array.isArray(val) ? val.map((v) => String(v)).join('\n') : '';
}

function linesToArray(text: string): string[] {
  return text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

export const AdminRecordModal: React.FC<AdminRecordModalProps> = ({
  category,
  editingItem,
  onClose,
  onSaved,
}) => {
  const { offices, barangays, transparencySections, upsertCivicRecord } = useCivicData();
  const isEditing = Boolean(editingItem);
  const raw = editingItem?.rawRecord ?? {};
  const catMeta = CIVIC_CATEGORIES.find((c) => c.key === category)!;

  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(
    editingItem?.verificationStatus ?? 'Needs Review'
  );
  const [verificationNotes, setVerificationNotes] = useState<string>(
    editingItem?.verificationNotes ?? asString(raw.notes)
  );
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Unified category field state initialized cleanly from editingItem or defaults
  const [fields, setFields] = useState<Record<string, string>>((): Record<string, string> => {
    switch (category) {
      case 'services':
        return {
          title: asString(raw.title),
          titleFil: asString(raw.titleFil),
          category: asString(raw.category, 'Civil Registration'),
          officeId: asString(raw.officeId, offices[0]?.id ?? 'office-mcr'),
          summary: asString(raw.summary),
          summaryFil: asString(raw.summaryFil),
          legalBasis: asString(raw.legalBasis),
          applicableFees: asString(raw.applicableFees),
          processingTime: asString(raw.processingTime),
          officeLocation: asString(raw.officeLocation, 'Municipal Hall, Alcala, Pangasinan'),
          contactInfo: asString(raw.contactInfo),
          eligibility: asLines(raw.eligibility),
          documentaryRequirements: asLines(raw.documentaryRequirements),
          procedureSteps: asLines(raw.procedureSteps),
          downloadableFormsNote: asString(raw.downloadableFormsNote),
          charterVerificationNote: asString(raw.charterVerificationNote),
        };
      case 'offices':
        return {
          name: asString(raw.name),
          nameFil: asString(raw.nameFil),
          acronym: asString(raw.acronym),
          branch: asString(raw.branch, 'Mandatory LGU Department'),
          officeHead: asString(raw.officeHead),
          address: asString(raw.address, 'Municipal Hall, Alcala, Pangasinan'),
          operatingHours: asString(raw.operatingHours, 'Monday–Friday, 8:00 AM – 5:00 PM'),
          contactPhone: asString(raw.contactPhone),
          contactEmail: asString(raw.contactEmail),
          description: asString(raw.description),
          mandateBasis: asString(raw.mandateBasis, 'RA 7160 (Local Government Code)'),
        };
      case 'officials':
        return {
          fullName: asString(raw.fullName),
          roleTitle: asString(raw.roleTitle),
          officeId: asString(raw.officeId, offices[0]?.id ?? 'office-mayor'),
          branch: asString(raw.branch, 'Executive'),
          termPeriod: asString(raw.termPeriod, '2025–2028'),
          committeeAssignments: Array.isArray(raw.committeeAssignments)
            ? raw.committeeAssignments.join(', ')
            : '',
          termConfirmationNote: asString(raw.termConfirmationNote),
        };
      case 'barangays':
        return {
          name: asString(raw.name),
          psgcCode: asString(raw.psgcCode),
          classification: asString(raw.classification, 'Rural / Agricultural'),
          population2020: asString(raw.population2020, '0'),
          populationSharePercent: asString(raw.populationSharePercent, '0'),
          punongBarangay: asString(raw.punongBarangay),
          contactNumber: asString(raw.contactNumber),
          barangayHallLocation: asString(raw.barangayHallLocation),
          barangayCouncilNote: asString(raw.barangayCouncilNote),
          geographicNotes: asString(raw.geographicNotes),
          serviceNotes: asString(raw.serviceNotes),
        };
      case 'transparency':
        return {
          section: asString(raw.section, transparencySections[0]?.key ?? 'annual-budgets'),
          fiscalYear: asString(raw.fiscalYear, '2026'),
          title: asString(raw.title),
          reportingPeriod: asString(raw.reportingPeriod, 'FY 2026'),
          documentType: asString(raw.documentType),
          amountLabel: asString(raw.amountLabel),
          portalName: asString(raw.portalName, 'DILG Full Disclosure Policy Portal'),
          portalUrl: asString(raw.portalUrl),
          recordAvailability: asString(raw.recordAvailability, 'Awaiting Official LGU Document'),
          summary: asString(raw.summary),
        };
      case 'budgets':
        return {
          fiscalYear: asString(raw.fiscalYear, '2026'),
          recordType: asString(raw.recordType, 'Approved Budget'),
          category: asString(raw.category),
          reportingPeriod: asString(raw.reportingPeriod, 'FY 2026'),
          amountPhp: raw.amountPhp != null ? String(raw.amountPhp) : '',
          amountDisplay: asString(raw.amountDisplay),
          notes: asString(raw.notes),
        };
      case 'procurement':
        return {
          fiscalYear: asString(raw.fiscalYear, '2026'),
          referenceNumber: asString(raw.referenceNumber),
          projectTitle: asString(raw.projectTitle),
          procuringOfficeId: asString(raw.procuringOfficeId, 'office-bac'),
          procurementMode: asString(raw.procurementMode, 'Public Bidding'),
          approvedBudgetPhp: raw.approvedBudgetPhp != null ? String(raw.approvedBudgetPhp) : '',
          contractAmountPhp: raw.contractAmountPhp != null ? String(raw.contractAmountPhp) : '',
          awardee: asString(raw.awardee),
          status: asString(raw.status, 'Awaiting PhilGEPS Verification'),
        };
      case 'projects':
        return {
          title: asString(raw.title),
          location: asString(raw.location, 'Alcala, Pangasinan'),
          barangaySlug: asString(raw.barangaySlug),
          implementingAgency: asString(raw.implementingAgency, 'Municipality of Alcala'),
          projectCostLabel: asString(raw.projectCostLabel),
          fundingSource: asString(raw.fundingSource, '20% Local Development Fund'),
          contractor: asString(raw.contractor),
          status: asString(raw.status, 'Awaiting Verification'),
          startDate: asString(raw.startDate),
          completionDate: asString(raw.completionDate),
          procurementReference: asString(raw.procurementReference),
          description: asString(raw.description),
        };
      case 'ordinances':
        return {
          ordinanceNumber: asString(raw.ordinanceNumber),
          title: asString(raw.title),
          year: asString(raw.year, '2026'),
          dateApproved: asString(raw.dateApproved),
          category: asString(raw.category, 'Governance & Administration'),
          issuingBody: asString(raw.issuingBody, 'Sangguniang Bayan of Alcala'),
          reviewBody: asString(raw.reviewBody, 'Sangguniang Panlalawigan of Pangasinan'),
          pdfAttachmentUrl: asString(raw.pdfAttachmentUrl),
          description: asString(raw.description),
        };
      case 'resolutions':
        return {
          resolutionNumber: asString(raw.resolutionNumber),
          title: asString(raw.title),
          year: asString(raw.year, '2026'),
          dateApproved: asString(raw.dateApproved),
          category: asString(raw.category, 'Governance'),
          issuingBody: asString(raw.issuingBody, 'Sangguniang Bayan of Alcala'),
          pdfAttachmentUrl: asString(raw.pdfAttachmentUrl),
          description: asString(raw.description),
        };
      case 'documents':
        return {
          title: asString(raw.title),
          documentCategory: asString(raw.documentCategory, 'Citizen Charter'),
          fiscalYear: raw.fiscalYear != null ? String(raw.fiscalYear) : '',
          issuingAgency: asString(raw.issuingAgency, 'Municipality of Alcala'),
          format: asString(raw.format, 'PDF Document'),
          fileUrl: asString(raw.fileUrl),
          description: asString(raw.description),
        };
      case 'announcements':
        return {
          title: asString(raw.title),
          titleFil: asString(raw.titleFil),
          originType: asString(raw.originType, 'Official Government Advisory'),
          category: asString(raw.category, 'Government Announcement'),
          publishedDate: asString(raw.publishedDate, new Date().toISOString().slice(0, 10)),
          summary: asString(raw.summary),
          bodyText: Array.isArray(raw.body) ? raw.body.join('\n\n') : asString(raw.bodyText),
        };
      case 'sources':
        return {
          title: asString(raw.title),
          agency: asString(raw.agency),
          documentType: asString(raw.documentType, 'Municipal Citizen Charter'),
          originalUrl: asString(raw.originalUrl),
          publicationDate: asString(raw.publicationDate, new Date().toISOString().slice(0, 10)),
          dateRetrieved: asString(raw.dateRetrieved, new Date().toISOString().slice(0, 10)),
          lastVerifiedDate: asString(raw.lastVerifiedDate, new Date().toISOString().slice(0, 10)),
        };
    }
  });

  const setField = (key: string, val: string) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    let title = '';
    let payload: Record<string, unknown> = {};

    switch (category) {
      case 'services':
        title = fields.title.trim();
        payload = {
          slug: asString(raw.slug) || sanitizeRecordId(title).toLowerCase(),
          title,
          titleFil: fields.titleFil.trim() || title,
          category: fields.category,
          officeId: fields.officeId,
          summary: fields.summary.trim(),
          summaryFil: fields.summaryFil.trim() || fields.summary.trim(),
          legalBasis: fields.legalBasis.trim(),
          applicableFees: fields.applicableFees.trim(),
          processingTime: fields.processingTime.trim(),
          officeLocation: fields.officeLocation.trim(),
          contactInfo: fields.contactInfo.trim(),
          eligibility: linesToArray(fields.eligibility),
          documentaryRequirements: linesToArray(fields.documentaryRequirements),
          procedureSteps: linesToArray(fields.procedureSteps),
          downloadableFormsNote: fields.downloadableFormsNote.trim(),
          charterVerificationNote: fields.charterVerificationNote.trim(),
        };
        break;
      case 'offices':
        title = fields.name.trim();
        payload = {
          slug: asString(raw.slug) || sanitizeRecordId(title).toLowerCase(),
          name: title,
          nameFil: fields.nameFil.trim() || title,
          acronym: fields.acronym.trim(),
          branch: fields.branch,
          officeHead: fields.officeHead.trim() || null,
          address: fields.address.trim(),
          operatingHours: fields.operatingHours.trim(),
          contactPhone: fields.contactPhone.trim() || null,
          contactEmail: fields.contactEmail.trim() || null,
          description: fields.description.trim(),
          mandateBasis: fields.mandateBasis.trim(),
        };
        break;
      case 'officials':
        title = fields.fullName.trim();
        payload = {
          fullName: title,
          roleTitle: fields.roleTitle.trim(),
          officeId: fields.officeId,
          branch: fields.branch,
          termPeriod: fields.termPeriod.trim(),
          committeeAssignments: fields.committeeAssignments
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          termConfirmationNote: fields.termConfirmationNote.trim(),
        };
        break;
      case 'barangays':
        title = fields.name.trim();
        payload = {
          slug: asString(raw.slug) || sanitizeRecordId(title).toLowerCase(),
          name: title,
          psgcCode: fields.psgcCode.trim(),
          classification: fields.classification,
          population2020: Number(fields.population2020) || 0,
          populationSharePercent: Number(fields.populationSharePercent) || 0,
          punongBarangay: fields.punongBarangay.trim() || null,
          contactNumber: fields.contactNumber.trim() || null,
          barangayHallLocation: fields.barangayHallLocation.trim(),
          barangayCouncilNote: fields.barangayCouncilNote.trim(),
          geographicNotes: fields.geographicNotes.trim(),
          serviceNotes: fields.serviceNotes.trim(),
        };
        break;
      case 'transparency':
        title = fields.title.trim();
        payload = {
          section: fields.section,
          fiscalYear: Number(fields.fiscalYear) || 2026,
          title,
          reportingPeriod: fields.reportingPeriod.trim(),
          documentType: fields.documentType.trim(),
          amountLabel: fields.amountLabel.trim(),
          portalName: fields.portalName.trim(),
          portalUrl: fields.portalUrl.trim() || null,
          recordAvailability: fields.recordAvailability,
          summary: fields.summary.trim(),
        };
        break;
      case 'budgets':
        title = fields.category.trim();
        payload = {
          fiscalYear: Number(fields.fiscalYear) || 2026,
          recordType: fields.recordType,
          category: title,
          reportingPeriod: fields.reportingPeriod.trim(),
          amountPhp: fields.amountPhp.trim() ? Number(fields.amountPhp) : null,
          amountDisplay: fields.amountDisplay.trim(),
          notes: fields.notes.trim(),
        };
        break;
      case 'procurement':
        title = fields.projectTitle.trim();
        payload = {
          fiscalYear: Number(fields.fiscalYear) || 2026,
          referenceNumber: fields.referenceNumber.trim() || null,
          projectTitle: title,
          procuringOfficeId: fields.procuringOfficeId,
          procurementMode: fields.procurementMode.trim(),
          approvedBudgetPhp: fields.approvedBudgetPhp.trim() ? Number(fields.approvedBudgetPhp) : null,
          contractAmountPhp: fields.contractAmountPhp.trim() ? Number(fields.contractAmountPhp) : null,
          awardee: fields.awardee.trim() || null,
          status: fields.status,
        };
        break;
      case 'projects':
        title = fields.title.trim();
        payload = {
          slug: asString(raw.slug) || sanitizeRecordId(title).toLowerCase(),
          title,
          location: fields.location.trim(),
          barangaySlug: fields.barangaySlug || null,
          implementingAgency: fields.implementingAgency.trim(),
          projectCostLabel: fields.projectCostLabel.trim(),
          fundingSource: fields.fundingSource.trim(),
          contractor: fields.contractor.trim() || null,
          status: fields.status,
          startDate: fields.startDate.trim() || null,
          completionDate: fields.completionDate.trim() || null,
          procurementReference: fields.procurementReference.trim() || null,
          description: fields.description.trim(),
        };
        break;
      case 'ordinances':
        title = fields.title.trim();
        payload = {
          slug: asString(raw.slug) || sanitizeRecordId(title).toLowerCase(),
          ordinanceNumber: fields.ordinanceNumber.trim(),
          title,
          year: Number(fields.year) || 2026,
          dateApproved: fields.dateApproved.trim(),
          category: fields.category,
          issuingBody: fields.issuingBody.trim(),
          reviewBody: fields.reviewBody.trim(),
          pdfAttachmentUrl: fields.pdfAttachmentUrl.trim() || null,
          description: fields.description.trim(),
        };
        break;
      case 'resolutions':
        title = fields.title.trim();
        payload = {
          slug: asString(raw.slug) || sanitizeRecordId(title).toLowerCase(),
          resolutionNumber: fields.resolutionNumber.trim(),
          title,
          year: Number(fields.year) || 2026,
          dateApproved: fields.dateApproved.trim(),
          category: fields.category.trim(),
          issuingBody: fields.issuingBody.trim(),
          pdfAttachmentUrl: fields.pdfAttachmentUrl.trim() || null,
          description: fields.description.trim(),
        };
        break;
      case 'documents':
        title = fields.title.trim();
        payload = {
          title,
          documentCategory: fields.documentCategory,
          fiscalYear: fields.fiscalYear.trim() ? Number(fields.fiscalYear) : null,
          issuingAgency: fields.issuingAgency.trim(),
          format: fields.format.trim(),
          fileUrl: fields.fileUrl.trim() || null,
          description: fields.description.trim(),
        };
        break;
      case 'announcements': {
        title = fields.title.trim();
        const body = fields.bodyText
          .split(/\n\s*\n/)
          .map((s) => s.trim())
          .filter(Boolean);
        payload = {
          slug: asString(raw.slug) || sanitizeRecordId(title).toLowerCase(),
          title,
          titleFil: fields.titleFil.trim() || title,
          originType: fields.originType,
          category: fields.category,
          publishedDate: fields.publishedDate.trim(),
          summary: fields.summary.trim(),
          body: body.length > 0 ? body : [fields.summary.trim()],
        };
        break;
      }
      case 'sources':
        title = fields.title.trim();
        payload = {
          title,
          agency: fields.agency.trim(),
          documentType: fields.documentType,
          originalUrl: fields.originalUrl.trim() || null,
          publicationDate: fields.publicationDate.trim(),
          dateRetrieved: fields.dateRetrieved.trim(),
          lastVerifiedDate: fields.lastVerifiedDate.trim(),
          notes: verificationNotes.trim(),
        };
        break;
    }

    if (!title) {
      setErrorMsg('Please enter a title or primary name for this record.');
      return;
    }

    const recordId = editingItem
      ? editingItem.id
      : sanitizeRecordId(`${category}-${title.toLowerCase().slice(0, 48)}-${Date.now().toString(36)}`);

    setSaving(true);
    try {
      await upsertCivicRecord({
        recordId,
        category,
        title,
        verificationStatus,
        verificationNotes,
        payload,
        isBaselineOverride: editingItem ? editingItem.isBaseline : false,
      });
      onSaved(isEditing ? `Updated "${title}"` : `Added "${title}"`);
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unable to save record.');
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (
    label: string,
    key: string,
    opts?: { type?: string; required?: boolean; placeholder?: string }
  ) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">
        {label} {opts?.required && '*'}
      </label>
      <input
        type={opts?.type ?? 'text'}
        value={fields[key] ?? ''}
        onChange={(e) => setField(key, e.target.value)}
        required={opts?.required}
        placeholder={opts?.placeholder}
        className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md bg-white focus:border-[#0F294A] focus:outline-none"
      />
    </div>
  );

  const renderTextarea = (
    label: string,
    key: string,
    opts?: { rows?: number; required?: boolean; hint?: string }
  ) => (
    <div>
      <div className="flex items-baseline justify-between gap-2 mb-1">
        <label className="block text-xs font-semibold text-slate-700">
          {label} {opts?.required && '*'}
        </label>
        {opts?.hint && <span className="text-[11px] text-slate-500">{opts.hint}</span>}
      </div>
      <textarea
        rows={opts?.rows ?? 3}
        value={fields[key] ?? ''}
        onChange={(e) => setField(key, e.target.value)}
        required={opts?.required}
        className="w-full p-2.5 text-sm border border-slate-300 rounded-md bg-white focus:border-[#0F294A] focus:outline-none"
      />
    </div>
  );

  const renderSelect = (
    label: string,
    key: string,
    options: Array<{ value: string; label: string }>
  ) => (
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1">{label}</label>
      <select
        value={fields[key] ?? ''}
        onChange={(e) => setField(key, e.target.value)}
        className="w-full h-10 px-3 text-sm border border-slate-300 rounded-md bg-white focus:border-[#0F294A] focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-[2px] flex items-end sm:items-center justify-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${isEditing ? 'Edit' : 'Add'} ${catMeta.singular}`}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-white rounded-t-2xl sm:rounded-xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-[#166534]">{catMeta.label}</p>
            <h2 className="font-editorial text-lg sm:text-xl font-semibold text-[#0F294A]">
              {isEditing ? `Edit ${catMeta.singular}` : `Add ${catMeta.singular}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close editor"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center text-slate-500 hover:text-slate-900 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Verification Status Box */}
          <div className="border border-slate-200 bg-[#FAFAF9] rounded-lg p-3.5 sm:p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-[#0F294A] mb-1">
                  Verification Status *
                </label>
                <select
                  value={verificationStatus}
                  onChange={(e) => setVerificationStatus(e.target.value as VerificationStatus)}
                  className="w-full h-10 px-3 text-sm font-medium border border-slate-300 rounded-md bg-white focus:border-[#0F294A] focus:outline-none"
                >
                  {VERIFICATION_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
              {verificationStatus !== 'Verified' && (
                <button
                  type="button"
                  onClick={() => setVerificationStatus('Verified')}
                  className="inline-flex items-center justify-center gap-1.5 h-10 px-3 text-xs font-semibold text-white bg-[#166534] rounded-md hover:bg-[#14532D] cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                  <span>Mark as Verified</span>
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Verification Notes / Primary Citation
              </label>
              <textarea
                rows={2}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Document reference, ordinance number, or official portal date verified..."
                className="w-full p-2.5 text-sm border border-slate-300 rounded-md bg-white focus:border-[#0F294A] focus:outline-none"
              />
            </div>
          </div>

          {/* Category-Specific Form Fields */}
          {category === 'services' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Service Title (EN)', 'title', { required: true })}
                {renderInput('Service Title (FIL)', 'titleFil')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderSelect(
                  'Service Category',
                  'category',
                  SERVICE_CATEGORIES.map((c) => ({ value: c, label: c }))
                )}
                {renderSelect(
                  'Responsible Office',
                  'officeId',
                  offices.map((o) => ({ value: o.id, label: `${o.acronym} — ${o.name}` }))
                )}
              </div>
              {renderTextarea('Summary (EN)', 'summary', { rows: 2, required: true })}
              {renderTextarea('Summary (FIL)', 'summaryFil', { rows: 2 })}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Applicable Fees', 'applicableFees')}
                {renderInput('Processing Time', 'processingTime')}
              </div>
              {renderInput('Legal Basis', 'legalBasis')}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Office Location', 'officeLocation')}
                {renderInput('Contact Info', 'contactInfo')}
              </div>
              {renderTextarea('Eligibility', 'eligibility', { rows: 2, hint: 'One item per line' })}
              {renderTextarea('Documentary Requirements', 'documentaryRequirements', {
                rows: 3,
                hint: 'One item per line',
              })}
              {renderTextarea('Procedure Steps', 'procedureSteps', {
                rows: 3,
                hint: 'One step per line',
              })}
              {renderInput('Charter Verification Note', 'charterVerificationNote')}
            </div>
          )}

          {category === 'offices' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Office Name (EN)', 'name', { required: true })}
                {renderInput('Office Name (FIL)', 'nameFil')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Acronym', 'acronym', { required: true })}
                {renderSelect('Branch', 'branch', [
                  { value: 'Executive', label: 'Executive' },
                  { value: 'Legislative', label: 'Legislative' },
                  { value: 'Mandatory LGU Department', label: 'Mandatory LGU Department' },
                  { value: 'Specialized / Local Unit', label: 'Specialized / Local Unit' },
                ])}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Department Head', 'officeHead', { placeholder: 'Leave blank if unverified' })}
                {renderInput('Operating Hours', 'operatingHours')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Contact Phone', 'contactPhone')}
                {renderInput('Contact Email', 'contactEmail')}
              </div>
              {renderInput('Office Address', 'address')}
              {renderInput('Mandate Basis', 'mandateBasis')}
              {renderTextarea('Description', 'description', { rows: 3 })}
            </div>
          )}

          {category === 'officials' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Full Name', 'fullName', { required: true })}
                {renderInput('Role / Position Title', 'roleTitle', { required: true })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderSelect(
                  'Office',
                  'officeId',
                  offices.map((o) => ({ value: o.id, label: o.acronym }))
                )}
                {renderSelect('Branch', 'branch', [
                  { value: 'Executive', label: 'Executive' },
                  { value: 'Legislative', label: 'Legislative' },
                ])}
                {renderInput('Term Period', 'termPeriod')}
              </div>
              {renderInput('Committee Assignments', 'committeeAssignments', {
                placeholder: 'Comma-separated (optional)',
              })}
              {renderTextarea('Term Confirmation Note', 'termConfirmationNote', { rows: 2 })}
            </div>
          )}

          {category === 'barangays' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderInput('Barangay Name', 'name', { required: true })}
                {renderInput('PSGC Code', 'psgcCode', { required: true })}
                {renderSelect('Classification', 'classification', [
                  { value: 'Poblacion / Urban Center', label: 'Poblacion / Urban Center' },
                  { value: 'Rural / Agricultural', label: 'Rural / Agricultural' },
                  { value: 'Awaiting Classification', label: 'Awaiting Classification' },
                ])}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('2020 Population (PSA)', 'population2020', { type: 'number' })}
                {renderInput('Population Share (%)', 'populationSharePercent', { type: 'number' })}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Punong Barangay', 'punongBarangay', { placeholder: 'Leave blank if unverified' })}
                {renderInput('Contact Number', 'contactNumber')}
              </div>
              {renderInput('Barangay Hall Location', 'barangayHallLocation')}
              {renderTextarea('Council / Verification Note', 'barangayCouncilNote', { rows: 2 })}
              {renderTextarea('Geographic Notes', 'geographicNotes', { rows: 2 })}
              {renderTextarea('Service Notes', 'serviceNotes', { rows: 2 })}
            </div>
          )}

          {category === 'transparency' && (
            <div className="space-y-3">
              {renderInput('Disclosure Title', 'title', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderSelect(
                  'Transparency Pillar',
                  'section',
                  transparencySections.map((s) => ({ value: s.key, label: s.shortTitle }))
                )}
                {renderInput('Fiscal Year', 'fiscalYear', { type: 'number', required: true })}
                {renderInput('Reporting Period', 'reportingPeriod')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Document Type', 'documentType')}
                {renderInput('Amount / Value Label', 'amountLabel')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Portal Name', 'portalName')}
                {renderInput('Portal URL', 'portalUrl', { type: 'url', placeholder: 'https://...' })}
              </div>
              {renderSelect('Record Availability', 'recordAvailability', [
                { value: 'Verified Public Reference', label: 'Verified Public Reference' },
                { value: 'Awaiting Official LGU Document', label: 'Awaiting Official LGU Document' },
              ])}
              {renderTextarea('Summary', 'summary', { rows: 2 })}
            </div>
          )}

          {category === 'budgets' && (
            <div className="space-y-3">
              {renderInput('Budget / Expenditure Line', 'category', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderInput('Fiscal Year', 'fiscalYear', { type: 'number', required: true })}
                {renderSelect('Record Stage', 'recordType', [
                  { value: 'Approved Budget', label: 'Approved Budget' },
                  { value: 'Obligation', label: 'Obligation' },
                  { value: 'Disbursement', label: 'Disbursement' },
                  { value: 'Actual Expenditure', label: 'Actual Expenditure' },
                  { value: 'NTA Share', label: 'NTA Share' },
                ])}
                {renderInput('Reporting Period', 'reportingPeriod')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Amount (PHP numeric, optional)', 'amountPhp', { type: 'number' })}
                {renderInput('Amount Display Text', 'amountDisplay', { required: true })}
              </div>
              {renderTextarea('Notes', 'notes', { rows: 2 })}
            </div>
          )}

          {category === 'procurement' && (
            <div className="space-y-3">
              {renderInput('Project Title', 'projectTitle', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderInput('Fiscal Year', 'fiscalYear', { type: 'number', required: true })}
                {renderInput('PhilGEPS Ref No.', 'referenceNumber')}
                {renderSelect('Status', 'status', [
                  { value: 'Awaiting PhilGEPS Verification', label: 'Awaiting PhilGEPS Verification' },
                  { value: 'Published', label: 'Published' },
                  { value: 'Completed', label: 'Completed' },
                ])}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Procurement Mode', 'procurementMode')}
                {renderInput('Awardee / Contractor', 'awardee')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('ABC (PHP, optional)', 'approvedBudgetPhp', { type: 'number' })}
                {renderInput('Contract Amount (PHP, optional)', 'contractAmountPhp', { type: 'number' })}
              </div>
            </div>
          )}

          {category === 'projects' && (
            <div className="space-y-3">
              {renderInput('Project Title', 'title', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Location', 'location', { required: true })}
                {renderSelect('Linked Barangay (optional)', 'barangaySlug', [
                  { value: '', label: 'Municipality-wide / Unspecified' },
                  ...barangays.map((b) => ({ value: b.slug, label: b.name })),
                ])}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Implementing Agency', 'implementingAgency')}
                {renderSelect('Implementation Status', 'status', [
                  { value: 'Awaiting Verification', label: 'Awaiting Verification' },
                  { value: 'Verified Reference', label: 'Verified Reference' },
                  { value: 'Planning / Proposed', label: 'Planning / Proposed' },
                  { value: 'Ongoing', label: 'Ongoing' },
                  { value: 'Completed', label: 'Completed' },
                ])}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Project Cost Label', 'projectCostLabel')}
                {renderInput('Funding Source', 'fundingSource')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Contractor', 'contractor')}
                {renderInput('Procurement Ref', 'procurementReference')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Start Date', 'startDate', { placeholder: 'YYYY-MM-DD' })}
                {renderInput('Completion Date', 'completionDate', { placeholder: 'YYYY-MM-DD' })}
              </div>
              {renderTextarea('Description', 'description', { rows: 3 })}
            </div>
          )}

          {category === 'ordinances' && (
            <div className="space-y-3">
              {renderInput('Ordinance Title', 'title', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderInput('Ordinance Number', 'ordinanceNumber', { required: true })}
                {renderInput('Year', 'year', { type: 'number', required: true })}
                {renderInput('Date Approved', 'dateApproved')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderSelect('Category', 'category', [
                  { value: 'Public Safety & Order', label: 'Public Safety & Order' },
                  { value: 'Social Welfare & Youth', label: 'Social Welfare & Youth' },
                  { value: 'Labor & Local Economy', label: 'Labor & Local Economy' },
                  { value: 'Governance & Administration', label: 'Governance & Administration' },
                  { value: 'Health & Sanitation', label: 'Health & Sanitation' },
                  { value: 'Finance & Taxation', label: 'Finance & Taxation' },
                ])}
                {renderInput('Issuing Body', 'issuingBody')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Review Body', 'reviewBody')}
                {renderInput('PDF Attachment URL', 'pdfAttachmentUrl', { type: 'url', placeholder: 'https://...' })}
              </div>
              {renderTextarea('Description', 'description', { rows: 3 })}
            </div>
          )}

          {category === 'resolutions' && (
            <div className="space-y-3">
              {renderInput('Resolution Title', 'title', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderInput('Resolution Number', 'resolutionNumber', { required: true })}
                {renderInput('Year', 'year', { type: 'number', required: true })}
                {renderInput('Date Approved', 'dateApproved')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Category', 'category')}
                {renderInput('Issuing Body', 'issuingBody')}
              </div>
              {renderInput('PDF Attachment URL', 'pdfAttachmentUrl', { type: 'url', placeholder: 'https://...' })}
              {renderTextarea('Description', 'description', { rows: 3 })}
            </div>
          )}

          {category === 'documents' && (
            <div className="space-y-3">
              {renderInput('Document Title', 'title', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderSelect('Document Category', 'documentCategory', [
                  { value: 'Ordinance', label: 'Ordinance' },
                  { value: 'Resolution', label: 'Resolution' },
                  { value: 'Audit Report', label: 'Audit Report' },
                  { value: 'Budget & Finance', label: 'Budget & Finance' },
                  { value: 'Citizen Charter', label: 'Citizen Charter' },
                  { value: 'Census Dataset', label: 'Census Dataset' },
                ])}
                {renderInput('Fiscal Year (optional)', 'fiscalYear', { type: 'number' })}
                {renderInput('Format', 'format')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Issuing Agency', 'issuingAgency')}
                {renderInput('File / Portal URL', 'fileUrl', { type: 'url', placeholder: 'https://...' })}
              </div>
              {renderTextarea('Description', 'description', { rows: 3 })}
            </div>
          )}

          {category === 'announcements' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Title (EN)', 'title', { required: true })}
                {renderInput('Title (FIL)', 'titleFil')}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderSelect('Origin Type', 'originType', [
                  { value: 'Official Government Advisory', label: 'Official Government Advisory' },
                  { value: 'BetterAlcala Project Update', label: 'BetterAlcala Project Update' },
                ])}
                {renderSelect('Category', 'category', [
                  { value: 'Government Announcement', label: 'Government Announcement' },
                  { value: 'Public Advisory', label: 'Public Advisory' },
                  { value: 'Community Program', label: 'Community Program' },
                  { value: 'Public Consultation', label: 'Public Consultation' },
                  { value: 'Important Deadline', label: 'Important Deadline' },
                  { value: 'Disaster Advisory', label: 'Disaster Advisory' },
                  { value: 'Platform Transparency', label: 'Platform Transparency' },
                ])}
                {renderInput('Published Date', 'publishedDate', { type: 'date' })}
              </div>
              {renderTextarea('Short Summary', 'summary', { rows: 2, required: true })}
              {renderTextarea('Body Paragraphs', 'bodyText', {
                rows: 4,
                hint: 'Separate paragraphs with a blank line',
              })}
            </div>
          )}

          {category === 'sources' && (
            <div className="space-y-3">
              {renderInput('Source Title', 'title', { required: true })}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {renderInput('Issuing Agency', 'agency', { required: true })}
                {renderSelect('Document Type', 'documentType', [
                  { value: 'Census & Geographic Dataset', label: 'Census & Geographic Dataset' },
                  { value: 'Provincial Official Portal', label: 'Provincial Official Portal' },
                  { value: 'Audit Report Archive', label: 'Audit Report Archive' },
                  { value: 'Legislative Review Record', label: 'Legislative Review Record' },
                  { value: 'National Statutory Framework', label: 'National Statutory Framework' },
                  { value: 'Financial & Disclosure Portal', label: 'Financial & Disclosure Portal' },
                  { value: 'Municipal Citizen Charter', label: 'Municipal Citizen Charter' },
                  { value: 'Procurement Registry', label: 'Procurement Registry' },
                ])}
              </div>
              {renderInput('Original Source URL', 'originalUrl', { type: 'url', placeholder: 'https://...' })}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {renderInput('Publication Date', 'publicationDate')}
                {renderInput('Date Retrieved', 'dateRetrieved')}
                {renderInput('Last Verified Date', 'lastVerifiedDate')}
              </div>
            </div>
          )}

          {errorMsg && (
            <p role="alert" className="text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
              {errorMsg}
            </p>
          )}

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-[42px] px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="min-h-[42px] px-5 py-2 text-xs font-semibold text-white bg-[#0F294A] rounded-md hover:bg-[#091B33] disabled:opacity-60 cursor-pointer"
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : `Create ${catMeta.singular}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
