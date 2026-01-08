import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient, { OpenJob } from "../api";
import Nav from "../components/Nav";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ImportJobModal, {
  ImportedData,
  ConfidenceBadge,
} from "../components/ImportJobModal";
import { Link as LinkIcon, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
type FormState = {
  company: string;
  role: string;
  location?: string;
  jobUrl?: string;
  dateApplied?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  status?: string;
};

export default function NewApplication() {
  const [form, setForm] = useState<FormState>({
    company: "",
    role: "",
    priority: "MEDIUM",
    status: "SAVED",
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importedData, setImportedData] = useState<ImportedData | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const location = useLocation();
  const job = location.state?.prefillJob as OpenJob | undefined;
  useEffect(() => {
    if (job) {
      setForm({
        company: job.company,
        role: job.role,
        location: job.location,
        jobUrl: job.jobUrl,
      });
    }
  }, [job]);

  const createMut = useMutation<any, Error, FormState>({
    mutationFn: async (payload: FormState) => {
      const res = await apiClient.post("/apps", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apps"] });
      navigate("/");
    },
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: { [key: string]: string } = {};
    if (!form.company || form.company.trim() === "") {
      newErrors.company = "Company is required";
    }
    if (!form.role || form.role.trim() === "") {
      newErrors.role = "Role is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    createMut.mutate(form);
  };

  const handleImportSuccess = (data: ImportedData) => {
    setImportedData(data);
    setForm({
      ...form,
      company: data.company || "",
      role: data.role || "",
      location: data.location || "",
      jobUrl: data.jobUrl || "",
    });
  };

  return (
    <>
      <Nav />
      <ImportJobModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={handleImportSuccess}
      />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              New Application
            </h2>
            <button
              type="button"
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" />
              Import from URL
            </button>
          </div>

          {importedData && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-blue-900">
                    Auto-imported from URL
                  </p>
                  <ConfidenceBadge confidence={importedData.confidence} />
                </div>
              </div>
              {importedData.warnings && importedData.warnings.length > 0 && (
                <div className="mt-2 space-y-1">
                  {importedData.warnings.map((warning, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-yellow-800"
                    >
                      <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-blue-700 mt-2">
                Review and edit the fields below before saving
              </p>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <input
                value={form.company}
                onChange={(e) => {
                  setForm({ ...form, company: e.target.value });
                  if (errors.company) setErrors({ ...errors, company: "" });
                }}
                placeholder="Company"
                className={`w-full p-2 border rounded mb-2 ${
                  errors.company ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.company && (
                <p className="text-red-600 text-sm">{errors.company}</p>
              )}
            </div>

            <div>
              <input
                value={form.role}
                onChange={(e) => {
                  setForm({ ...form, role: e.target.value });
                  if (errors.role) setErrors({ ...errors, role: "" });
                }}
                placeholder="Role"
                className={`w-full p-2 border rounded mb-2 ${
                  errors.role ? "border-red-500" : "border-gray-300"
                }`}
                required
              />
              {errors.role && (
                <p className="text-red-600 text-sm">{errors.role}</p>
              )}
            </div>
            <input
              value={form.location || ""}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Location"
              className="w-full p-2 border rounded mb-2"
            />
            <input
              value={form.jobUrl || ""}
              onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              placeholder="Job URL"
              className="w-full p-2 border rounded mb-2"
            />
            <div className="grid grid-cols-2 gap-4 mb-2">
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  Priority:
                </label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value as any })
                  }
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Med</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="font-medium text-gray-700 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="OA">OA</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <label className="font-medium text-gray-700 whitespace-nowrap">
                Date Applied:
              </label>
              <DatePicker
                selected={form.dateApplied ? new Date(form.dateApplied) : null}
                onChange={(date: Date | null) => {
                  setForm({
                    ...form,
                    dateApplied: date ? date.toISOString() : undefined,
                  });
                }}
                dateFormat="MMM d, yyyy"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholderText="Select date"
                wrapperClassName="flex-1"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                disabled={createMut.isPending}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                {createMut.isPending ? "Creating..." : "Create Application"}
              </button>
            </div>
            {createMut.isError && (
              <div className="mt-2 text-red-600 bg-red-50 p-3 rounded-lg">
                Error creating application
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  );
}
