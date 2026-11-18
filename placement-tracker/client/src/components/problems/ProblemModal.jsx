import React, { useState, useEffect } from 'react';
import { X, Loader2, AlertCircle, ExternalLink, CheckSquare, Square } from 'lucide-react';
import api from '../../api/axios';

const DSA_TOPICS = [
  'Arrays', 'Strings', 'Hashing', 'Two Pointers', 'Sliding Window',
  'Prefix Sum', 'Binary Search', 'Sorting', 'Greedy', 'Stack', 'Queue',
  'Linked Lists', 'Trees', 'Binary Search Trees', 'Heaps', 'Graphs',
  'Backtracking', 'Dynamic Programming'
];

const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'CodeChef', 'GeeksForGeeks', 'Other'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const STATUSES = [
  { value: 'not_attempted', label: 'Not Attempted' },
  { value: 'attempted', label: 'Attempted' },
  { value: 'solved', label: 'Solved' },
  { value: 'needs_revision', label: 'Needs Revision' }
];

const ProblemModal = ({ isOpen, onClose, onSaveSuccess, problemToEdit = null, initialValues = null }) => {
  const isEditing = !!problemToEdit;

  const initialForm = {
    title: '',
    platform: 'LeetCode',
    url: '',
    topic: 'Arrays',
    difficulty: 'Easy',
    status: 'attempted',
    dateAttempted: new Date().toISOString().split('T')[0],
    timeComplexity: '',
    spaceComplexity: '',
    approach: '',
    notes: '',
    needsRevision: false,
  };

  const [formData, setFormData] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (problemToEdit) {
      setFormData({
        title: problemToEdit.title || '',
        platform: problemToEdit.platform || 'LeetCode',
        url: problemToEdit.url || '',
        topic: problemToEdit.topic || 'Arrays',
        difficulty: problemToEdit.difficulty || 'Easy',
        status: problemToEdit.status || 'attempted',
        dateAttempted: problemToEdit.dateAttempted
          ? new Date(problemToEdit.dateAttempted).toISOString().split('T')[0]
          : '',
        timeComplexity: problemToEdit.timeComplexity || '',
        spaceComplexity: problemToEdit.spaceComplexity || '',
        approach: problemToEdit.approach || '',
        notes: problemToEdit.notes || '',
        needsRevision: !!problemToEdit.needsRevision,
      });
    } else {
      setFormData({ ...initialForm, ...(initialValues || {}) });
    }
    setFieldErrors({});
    setGeneralError('');
  }, [problemToEdit, isOpen, initialValues]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: val };
      // If user marks status as needs_revision, auto-check needsRevision
      if (name === 'status' && value === 'needs_revision') {
        updated.needsRevision = true;
      }
      return updated;
    });

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Problem title is required';
    } else if (formData.title.trim().length < 2) {
      errors.title = 'Title must be at least 2 characters';
    }

    if (formData.url && formData.url.trim()) {
      try {
        new URL(formData.url.trim());
      } catch {
        errors.url = 'Please provide a valid URL (e.g. https://leetcode.com/...)';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setGeneralError('');

    try {
      const payload = {
        title: formData.title.trim(),
        platform: formData.platform,
        url: formData.url.trim() || null,
        topic: formData.topic,
        difficulty: formData.difficulty,
        status: formData.status,
        needsRevision: formData.needsRevision,
        dateAttempted: formData.dateAttempted ? new Date(formData.dateAttempted) : null,
        timeComplexity: formData.timeComplexity.trim() || null,
        spaceComplexity: formData.spaceComplexity.trim() || null,
        approach: formData.approach.trim() || null,
        notes: formData.notes.trim() || null,
      };

      if (isEditing) {
        await api.put(`/problems/${problemToEdit._id}`, payload);
      } else {
        await api.post('/problems', payload);
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      const validationErrs = err.response?.data?.errors;

      if (validationErrs && Array.isArray(validationErrs)) {
        const mapped = {};
        validationErrs.forEach((e) => {
          mapped[e.field] = e.message;
        });
        setFieldErrors(mapped);
      } else if (serverMsg) {
        setGeneralError(serverMsg);
      } else {
        setGeneralError('Failed to save problem. Please check your network and try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl neo-card bg-panel p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-line">
          <div>
            <h2 className="text-xl font-bold text-ink">
              {isEditing ? 'Edit Problem Record' : 'Record New DSA Problem'}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {isEditing
                ? 'Update problem parameters and learning notes'
                : 'Log your problem attempt with approach notes and complexity'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-mist transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {generalError && (
          <div className="p-3.5 rounded-xl bg-punch-500/10 border border-punch-500/30 flex items-start gap-2.5 text-ink text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Title & Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Problem Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Trapping Rain Water"
                className={`w-full px-3.5 py-2 rounded-xl bg-paper border text-sm text-ink placeholder:text-subtle focus:outline-none transition-colors ${
                  fieldErrors.title
                    ? 'border-punch-500/60 focus:border-punch-500'
                    : 'border-line focus:border-punch-500'
                }`}
              />
              {fieldErrors.title && <p className="text-xs text-ink">{fieldErrors.title}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Platform *
              </label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-sm text-ink focus:outline-none focus:border-punch-500"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: External URL */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Problem URL (Optional)
            </label>
            <input
              type="url"
              name="url"
              value={formData.url}
              onChange={handleChange}
              placeholder="https://leetcode.com/problems/..."
              className={`w-full px-3.5 py-2 rounded-xl bg-paper border text-sm text-ink placeholder:text-subtle focus:outline-none transition-colors ${
                fieldErrors.url
                  ? 'border-punch-500/60 focus:border-punch-500'
                  : 'border-line focus:border-punch-500'
              }`}
            />
            {fieldErrors.url && <p className="text-xs text-ink">{fieldErrors.url}</p>}
          </div>

          {/* Row 3: Topic, Difficulty, Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                DSA Topic *
              </label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-sm text-ink focus:outline-none focus:border-punch-500"
              >
                {DSA_TOPICS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Difficulty *
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-sm text-ink focus:outline-none focus:border-punch-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-sm text-ink focus:outline-none focus:border-punch-500"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Complexities & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Time Complexity
              </label>
              <input
                type="text"
                name="timeComplexity"
                value={formData.timeComplexity}
                onChange={handleChange}
                placeholder="e.g. O(n log n)"
                className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-punch-500 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Space Complexity
              </label>
              <input
                type="text"
                name="spaceComplexity"
                value={formData.spaceComplexity}
                onChange={handleChange}
                placeholder="e.g. O(n)"
                className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line text-sm text-ink placeholder:text-subtle focus:outline-none focus:border-punch-500 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Date Attempted
              </label>
              <input
                type="date"
                name="dateAttempted"
                value={formData.dateAttempted}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-xl bg-paper border border-line text-sm text-ink focus:outline-none focus:border-punch-500 text-xs"
              />
            </div>
          </div>

          {/* Row 5: Needs Revision Flag */}
          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                name="needsRevision"
                checked={formData.needsRevision}
                onChange={handleChange}
                className="sr-only"
              />
              <div className="text-punk-500">
                {formData.needsRevision ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4 text-subtle" />
                )}
              </div>
              <span className="text-xs font-medium text-muted">
                Flag this problem in my <strong className="text-ink">Revision Backlog</strong> for review
              </span>
            </label>
          </div>

          {/* Row 6: Solution Approach */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Solution Approach / Algorithm Summary
            </label>
            <textarea
              name="approach"
              rows={2}
              value={formData.approach}
              onChange={handleChange}
              placeholder="e.g. Two-pointer technique from both ends. Increment left pointer when sum is too small..."
              className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-punch-500 leading-relaxed"
            />
          </div>

          {/* Row 7: Notes & Mistakes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
              Mistakes & Revision Notes
            </label>
            <textarea
              name="notes"
              rows={2}
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Forgot to handle the empty string edge case on first submit. Review integer overflow handling."
              className="w-full px-3.5 py-2 rounded-xl bg-paper border border-line text-xs text-ink placeholder:text-subtle focus:outline-none focus:border-punch-500 leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-muted hover:text-ink hover:bg-mist transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-punch-600 text-button text-xs font-bold hover:bg-punch-500 transition-colors flex items-center gap-2 shadow-md shadow-black/10 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>{isEditing ? 'Update Problem' : 'Record Problem'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProblemModal;
