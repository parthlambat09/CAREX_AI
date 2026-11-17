import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { User, Phone, ShieldAlert, Award, FileText, Building2, CreditCard, AlertCircle, ArrowRight, ArrowLeft, CheckCircle2, Calendar, Globe } from 'lucide-react';
import { UserRole } from '@/types';
import { AuthLayout } from '../components/AuthLayout';
import { RoleBadge } from '../components/RoleBadge';

export const SignupPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get current role from query parameter (default to doctor)
  const roleParam = searchParams.get('role') as UserRole;
  const currentRole: UserRole = (roleParam === 'nurse' || roleParam === 'family' || roleParam === 'patient' || roleParam === 'admin')
    ? (roleParam === 'patient' ? 'family' : roleParam)
    : 'doctor';

  // Form States
  const [fullName, setFullName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [phone, setPhone] = useState('');

  // Doctor Specific States
  const [medRegNo, setMedRegNo] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [hospital, setHospital] = useState('');

  // Patient Specific States
  const [dob, setDob] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('English');

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [demoSuccess, setDemoSuccess] = useState<string | null>(null);

  const handleRoleChange = (newRole: UserRole) => {
    setSearchParams({ role: newRole });
    setErrors({});
    setDemoSuccess(null);
  };

  const getRoleIdLabel = (role: UserRole) => {
    if (role === 'doctor') return 'Doctor ID';
    if (role === 'nurse') return 'Nurse ID';
    if (role === 'family') return 'Patient ID';
    return 'Employee ID';
  };

  const getRoleIdPlaceholder = (role: UserRole) => {
    if (role === 'doctor') return 'DOC-1024';
    if (role === 'nurse') return 'NUR-2048';
    if (role === 'family') return 'PAT-3092';
    return 'EMP-5501';
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    
    if (!roleId.trim()) {
      newErrors.roleId = `${getRoleIdLabel(currentRole)} is required.`;
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^\+?[0-9\s-]{10,15}$/.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number (10-15 digits).';
    }

    // Role-specific validation
    if (currentRole === 'doctor') {
      if (!medRegNo.trim()) newErrors.medRegNo = 'Medical registration number is required.';
      if (!specialization.trim()) newErrors.specialization = 'Specialization is required.';
      if (!hospital.trim()) newErrors.hospital = 'Hospital / Clinic name is required.';
    } else if (currentRole === 'family') {
      if (!dob) {
        newErrors.dob = 'Date of birth is required.';
      } else {
        const selectedDate = new Date(dob);
        const today = new Date();
        if (selectedDate > today) {
          newErrors.dob = 'Date of birth cannot be in the future.';
        }
      }
      if (!preferredLanguage) newErrors.preferredLanguage = 'Preferred language is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSuccess(null);

    if (currentRole === 'admin') {
      return; // Admins cannot sign up publicly
    }

    if (!validate()) {
      return;
    }

    setIsLoading(true);

    // Simulate account registration
    setTimeout(() => {
      setIsLoading(false);
      setDemoSuccess(
        `Profile registration for ${getRoleIdLabel(currentRole)} (${roleId.trim().toUpperCase()}) completed! You can now use your ${getRoleIdLabel(currentRole)} to sign in.`
      );
    }, 600);
  };

  return (
    <AuthLayout subtitle="Secure Member Registration Portal">
      <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-xl relative">
        {/* Role Selector Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <RoleBadge role={currentRole} onChangeRole={handleRoleChange} showSwitch />
          
          <Link
            to="/"
            className="text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Change</span>
          </Link>
        </div>

        {/* Condition 1: Hospital Admin Public Signup Blocked */}
        {currentRole === 'admin' ? (
          <div className="space-y-6 py-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Public Registration Disabled
              </h1>
              <p className="text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                Hospital Admin accounts require organizational authorization and security validation. They cannot be created through public self-registration.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-950 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 space-y-2 leading-relaxed">
              <p className="font-bold text-slate-900 dark:text-zinc-200">To obtain a Hospital Admin account:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Contact your hospital's system administrator or IT helpdesk.</li>
                <li>Ensure your official Employee ID and department code are verified.</li>
                <li>Admins manage critical ICU resources, staff availability, and platform audit logs.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => navigate('/login?role=admin')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black font-bold transition-all text-sm flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Go to Admin Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange('doctor')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-semibold transition-all text-sm"
              >
                Sign up as Doctor instead
              </button>
            </div>
          </div>
        ) : (
          /* Condition 2: Doctor/Nurse/Patient Registration Form */
          <>
            {/* Title */}
            <div className="mb-6 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight">
                Create {currentRole === 'doctor' ? 'Doctor' : currentRole === 'nurse' ? 'Nurse' : 'Patient'} Account
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
                Provide your details to configure your CAREX profile with your ID.
              </p>
            </div>

            {/* Demo Success Alert */}
            {demoSuccess && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-orange-500/10 border border-blue-200 dark:border-orange-500/30 text-blue-900 dark:text-orange-300 text-xs space-y-3 animate-in fade-in duration-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-slate-900 dark:text-zinc-100 text-sm">Registration Successful</p>
                    <p className="mt-1 leading-relaxed text-slate-700 dark:text-zinc-300">{demoSuccess}</p>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-blue-200 dark:border-orange-500/20">
                  <button
                    type="button"
                    onClick={() => navigate(`/login?role=${currentRole}`)}
                    className="flex-1 py-2 px-3 rounded-lg bg-blue-600 text-white dark:bg-orange-500 dark:text-black font-bold hover:bg-blue-700 dark:hover:bg-orange-600 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                    }}
                    placeholder={currentRole === 'doctor' ? 'Dr. Elizabeth Blackwell' : currentRole === 'nurse' ? 'Elena Rostova, RN' : 'Jane Doe'}
                    required
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                      errors.fullName ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                    }`}
                  />
                </div>
                {errors.fullName && (
                  <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{errors.fullName}</span>
                  </div>
                )}
              </div>

              {/* Role ID & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Role ID */}
                <div className="space-y-1.5">
                  <label htmlFor="roleId" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    {getRoleIdLabel(currentRole)} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <input
                      id="roleId"
                      type="text"
                      value={roleId}
                      onChange={(e) => {
                        setRoleId(e.target.value);
                        if (errors.roleId) setErrors((prev) => ({ ...prev, roleId: '' }));
                      }}
                      placeholder={getRoleIdPlaceholder(currentRole)}
                      required
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                        errors.roleId ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                      }`}
                    />
                  </div>
                  {errors.roleId && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.roleId}</span>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
                      }}
                      placeholder="+1 (555) 019-2834"
                      required
                      className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                        errors.phone ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Conditional Form Blocks based on active role */}
              {currentRole === 'doctor' ? (
                /* Doctor Specific Section */
                <div className="space-y-4 border-t border-slate-200 dark:border-zinc-800 pt-4 mt-2">
                  <p className="text-[11px] font-bold text-blue-600 dark:text-orange-400 uppercase tracking-wider">Clinical Details</p>
                  
                  {/* Medical Registration Number */}
                  <div className="space-y-1.5">
                    <label htmlFor="medRegNo" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                      Medical Registration Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                        <Award className="w-4 h-4" />
                      </div>
                      <input
                        id="medRegNo"
                        type="text"
                        value={medRegNo}
                        onChange={(e) => {
                          setMedRegNo(e.target.value);
                          if (errors.medRegNo) setErrors((prev) => ({ ...prev, medRegNo: '' }));
                        }}
                        placeholder="e.g. REG-98317-NY"
                        required
                        className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                          errors.medRegNo ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                        }`}
                      />
                    </div>
                    {errors.medRegNo && (
                      <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{errors.medRegNo}</span>
                      </div>
                    )}
                  </div>

                  {/* Specialization & Hospital Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Specialization */}
                    <div className="space-y-1.5">
                      <label htmlFor="specialization" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                          <FileText className="w-4 h-4" />
                        </div>
                        <input
                          id="specialization"
                          type="text"
                          value={specialization}
                          onChange={(e) => {
                            setSpecialization(e.target.value);
                            if (errors.specialization) setErrors((prev) => ({ ...prev, specialization: '' }));
                          }}
                          placeholder="e.g. ICU Cardiologist"
                          required
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                            errors.specialization ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                          }`}
                        />
                      </div>
                      {errors.specialization && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.specialization}</span>
                        </div>
                      )}
                    </div>

                    {/* Hospital */}
                    <div className="space-y-1.5">
                      <label htmlFor="hospital" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Hospital Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <input
                          id="hospital"
                          type="text"
                          value={hospital}
                          onChange={(e) => {
                            setHospital(e.target.value);
                            if (errors.hospital) setErrors((prev) => ({ ...prev, hospital: '' }));
                          }}
                          placeholder="e.g. AIIMS New Delhi"
                          required
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                            errors.hospital ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                          }`}
                        />
                      </div>
                      {errors.hospital && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.hospital}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Patient Specific Section */
                <div className="space-y-4 border-t border-slate-200 dark:border-zinc-800 pt-4 mt-2">
                  <p className="text-[11px] font-bold text-blue-600 dark:text-orange-400 uppercase tracking-wider">Health Profile Basics</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Date of Birth */}
                    <div className="space-y-1.5">
                      <label htmlFor="dob" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Date of Birth <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          id="dob"
                          type="date"
                          value={dob}
                          onChange={(e) => {
                            setDob(e.target.value);
                            if (errors.dob) setErrors((prev) => ({ ...prev, dob: '' }));
                          }}
                          required
                          className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 ${
                            errors.dob ? 'border-red-500 focus:ring-2 focus:ring-red-500/20' : 'border-slate-200 dark:border-zinc-700 focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20'
                          }`}
                        />
                      </div>
                      {errors.dob && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.dob}</span>
                        </div>
                      )}
                    </div>

                    {/* Preferred Language */}
                    <div className="space-y-1.5">
                      <label htmlFor="preferredLanguage" className="block text-xs font-semibold text-slate-700 dark:text-zinc-300">
                        Preferred Language <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                          <Globe className="w-4 h-4" />
                        </div>
                        <select
                          id="preferredLanguage"
                          value={preferredLanguage}
                          onChange={(e) => {
                            setPreferredLanguage(e.target.value);
                            if (errors.preferredLanguage) setErrors((prev) => ({ ...prev, preferredLanguage: '' }));
                          }}
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 text-sm rounded-xl focus:outline-none focus:border-blue-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-orange-500/20 transition-all"
                        >
                          <option value="English">English</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Marathi">Marathi</option>
                          <option value="Spanish">Spanish</option>
                        </select>
                      </div>
                      {errors.preferredLanguage && (
                        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 pt-0.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.preferredLanguage}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-md flex items-center justify-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-orange-500/50 mt-4 ${
                  isLoading
                    ? 'bg-slate-200 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 cursor-not-allowed border border-slate-300 dark:border-zinc-700'
                    : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-black shadow-sm'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-400 border-t-white dark:border-zinc-600 dark:border-t-black rounded-full animate-spin" />
                    <span>Registering Info...</span>
                  </>
                ) : (
                  <>
                    <span>Create Profile</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Back Links */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-zinc-800 text-center space-y-2">
              <p className="text-xs text-slate-600 dark:text-zinc-400">
                Already have an account?{' '}
                <Link
                  to={`/login?role=${currentRole}`}
                  className="text-blue-600 dark:text-orange-400 hover:text-blue-700 dark:hover:text-orange-300 font-bold hover:underline transition-colors"
                >
                  Sign In
                </Link>
              </p>

              <div>
                <Link
                  to="/"
                  className="inline-block text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 font-medium transition-colors pt-2"
                >
                  ← Back to Role Selection
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  );
};
