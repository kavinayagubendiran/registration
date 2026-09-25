import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:5000'

const companies = [
  { name: 'TCS', mark: 'T', tone: 'blue' }, { name: 'Infosys', mark: 'I', tone: 'orange' },
  { name: 'Wipro', mark: 'W', tone: 'purple' }, { name: 'HCLTech', mark: 'H', tone: 'red' },
  { name: 'Accenture', mark: 'A', tone: 'violet' }, { name: 'Cognizant', mark: 'C', tone: 'teal' },
  { name: 'Capgemini', mark: 'C', tone: 'blue' }, { name: 'Deloitte', mark: 'D', tone: 'green' },
  { name: 'IBM', mark: 'I', tone: 'navy' }, { name: 'Amazon', mark: 'a', tone: 'gold' },
]

const emptyForm = { name: '', rollNo: '', dob: '', phone: '', email: '', address: '', department: '', gender: '', year: '', section: '', backlogs: '0' }

function App() {
  const [view, setView] = useState('register')
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [registrations, setRegistrations] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const companyCounts = useMemo(() => companies.map((company) => ({ ...company, count: registrations.filter((item) => item.companies?.includes(company.name)).length })), [registrations])

  useEffect(() => {
    const loadRegistrations = async () => {
      try {
        const response = await fetch(`${API_URL}/students`)
        if (!response.ok) throw new Error('Failed to load students')
        const data = await response.json()
        setRegistrations(data)
      } catch (error) {
        console.error(error)
      }
    }

    loadRegistrations()
  }, [])

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  const toggleCompany = (name) => setSelectedCompanies((current) => current.includes(name) ? current.filter((item) => item !== name) : current.length < 4 ? [...current, name] : current)

  const finishRegistration = async (companyChoices) => {
    const payload = {
      ...form,
      backlogs: Number(form.backlogs),
      companies: companyChoices,
    }

    try {
      const response = await fetch(`${API_URL}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Failed to save registration')
      }

      const savedStudent = await response.json()
      setRegistrations((current) => [...current, savedStudent])
      setSubmitted(true)
    } catch (error) {
      console.error(error)
      alert('Unable to save the registration. Please try again.')
    }
  }

  const handleDetailsSubmit = (event) => {
    event.preventDefault()
    Number(form.backlogs) === 0 ? setStep(2) : finishRegistration([])
  }
  const resetRegistration = () => { setForm(emptyForm); setSelectedCompanies([]); setStep(1); setSubmitted(false) }

  return (
    <div className="app-shell">
      <header className="topbar"><button className="brand" type="button" onClick={() => { setView('register'); resetRegistration() }}><span className="brand-mark">N</span><span><strong>NextStep</strong><small>Campus portal</small></span></button><nav className="nav-tabs"><button className={view === 'register' ? 'active' : ''} type="button" onClick={() => setView('register')}>Student registration</button><button className={view === 'admin' ? 'active' : ''} type="button" onClick={() => setView('admin')}>Admin view <span className="nav-count">{registrations.length}</span></button></nav><div className="profile"><span className="profile-dot">AD</span><span><strong>Admin</strong><small>Placement cell</small></span><span className="chevron">⌄</span></div></header>
      {view === 'admin' ? <AdminView registrations={registrations} companyCounts={companyCounts} onNew={() => setView('register')} /> : <RegistrationView form={form} step={step} setStep={setStep} submitted={submitted} selectedCompanies={selectedCompanies} updateForm={updateForm} toggleCompany={toggleCompany} handleDetailsSubmit={handleDetailsSubmit} finishRegistration={finishRegistration} resetRegistration={resetRegistration} />}
      <footer><span>NextStep Placement Portal</span><span>© 2024 · Built for brighter careers</span></footer>
    </div>
  )
}

function AdminView({ registrations, companyCounts, onNew }) {
  return <main className="page admin-page"><div className="page-heading"><div><p className="eyebrow">PLACEMENT CELL / OVERVIEW</p><h1>Registration directory</h1><p className="lead">Track student preferences and prepare company-wise shortlists.</p></div><button className="outline-button" type="button" onClick={onNew}>＋ New registration</button></div><section className="stats-grid"><div className="stat-card"><span className="stat-icon coral">◉</span><div><strong>{registrations.length}</strong><span>Total students</span></div></div><div className="stat-card"><span className="stat-icon mint">✓</span><div><strong>{registrations.filter((item) => item.backlogs === '0').length}</strong><span>Eligible students</span></div></div><div className="stat-card"><span className="stat-icon yellow">▥</span><div><strong>{companies.length}</strong><span>Hiring partners</span></div></div></section><section className="directory-panel"><div className="panel-header"><div><h2>Company-wise registrations</h2><p>Student choices grouped by preferred company</p></div><button className="filter-button" type="button">Filter by year <span>⌄</span></button></div><div className="company-directory">{companyCounts.map((company) => <div className="company-row" key={company.name}><span className={`company-logo ${company.tone}`}>{company.mark}</span><strong>{company.name}</strong><div className="bar-wrap"><div className="bar" style={{ width: `${registrations.length ? Math.max((company.count / registrations.length) * 100, company.count ? 8 : 0) : 0}%` }} /></div><span className="student-count">{company.count} <small>students</small></span><span className="arrow">›</span></div>)}</div></section><section className="recent-panel"><div className="panel-header"><div><h2>Recent registrations</h2><p>Latest students added to the portal</p></div></div>{registrations.length === 0 ? <div className="empty-state"><span>✦</span><strong>No registrations yet</strong><p>New student entries will appear here.</p></div> : <div className="table-wrap"><table><thead><tr><th>Student</th><th>Roll number</th><th>Department</th><th>Preferences</th></tr></thead><tbody>{registrations.slice().reverse().map((student) => <tr key={student.id}><td><strong>{student.name}</strong><small>{student.email}</small></td><td>{student.rollNo}</td><td>{student.department}</td><td>{student.companies.length ? student.companies.join(', ') : 'Not eligible'}</td></tr>)}</tbody></table></div>}</section></main>
}

function RegistrationView({ form, step, setStep, submitted, selectedCompanies, updateForm, toggleCompany, handleDetailsSubmit, finishRegistration, resetRegistration }) {
  return <main className="page registration-page"><div className="page-heading"><div><p className="eyebrow">STUDENT ONBOARDING</p><h1>Start your next step.</h1><p className="lead">Register your details and tell us where you want to go next.</p></div><div className="secure-note"><span>⌁</span> Your information is secure</div></div><div className="progress"><div className={`progress-step ${step >= 1 ? 'current' : ''}`}><span>01</span><div><strong>Student details</strong><small>Personal & academic</small></div></div><div className="progress-line"><span className={step === 2 ? 'filled' : ''} /></div><div className={`progress-step ${step === 2 ? 'current' : ''}`}><span>02</span><div><strong>Company preferences</strong><small>Choose your top four</small></div></div></div>{submitted ? <section className="success-card"><div className="success-icon">✓</div><p className="eyebrow">REGISTRATION COMPLETE</p><h2>You’re on your way, {form.name.split(' ')[0] || 'student'}.</h2><p>Your details have been saved to the placement directory.</p><div className="success-preferences">{selectedCompanies.length ? selectedCompanies.map((name) => <span key={name}>{name}</span>) : <span>Company preferences not applicable</span>}</div><button className="primary-button" type="button" onClick={resetRegistration}>Register another student <span>→</span></button></section> : step === 1 ? <DetailsForm form={form} updateForm={updateForm} handleDetailsSubmit={handleDetailsSubmit} /> : <PreferenceForm selectedCompanies={selectedCompanies} toggleCompany={toggleCompany} setStep={setStep} finishRegistration={finishRegistration} />}</main>
}

function DetailsForm({ form, updateForm, handleDetailsSubmit }) {
  return <form className="form-card" onSubmit={handleDetailsSubmit}><div className="section-intro"><span className="step-badge">01</span><div><h2>Tell us about yourself</h2><p>All fields marked with <b>*</b> are required.</p></div></div><div className="form-grid"><Field label="Full name" name="name" value={form.name} onChange={updateForm} placeholder="e.g. Ananya Sharma" required /><Field label="Roll number" name="rollNo" value={form.rollNo} onChange={updateForm} placeholder="e.g. 21CSE104" required /><Field label="Date of birth" name="dob" type="date" value={form.dob} onChange={updateForm} required /><Field label="Phone number" name="phone" type="tel" value={form.phone} onChange={updateForm} placeholder="+91 98765 43210" required /><Field label="Email ID" name="email" type="email" value={form.email} onChange={updateForm} placeholder="you@example.com" required /><SelectField label="Department of engineering" name="department" value={form.department} onChange={updateForm} options={['Computer Science & Engineering', 'Information Technology', 'Electronics & Communication', 'Mechanical Engineering', 'Civil Engineering']} required /><div className="field full"><label htmlFor="address">Address <b>*</b></label><textarea id="address" name="address" value={form.address} onChange={updateForm} placeholder="Enter your current address" required /></div><SelectField label="Gender" name="gender" value={form.gender} onChange={updateForm} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} required /><SelectField label="Year" name="year" value={form.year} onChange={updateForm} options={['1st year', '2nd year', '3rd year', '4th year']} required /><SelectField label="Section" name="section" value={form.section} onChange={updateForm} options={['A', 'B', 'C', 'D']} required /><Field label="Number of backlogs" name="backlogs" type="number" min="0" value={form.backlogs} onChange={updateForm} required /></div><div className="form-footer"><p>Students with zero backlogs can select company preferences.</p><button className="primary-button" type="submit">Continue <span>→</span></button></div></form>
}

function PreferenceForm({ selectedCompanies, toggleCompany, setStep, finishRegistration }) {
  return <section className="form-card preference-card"><div className="section-intro"><span className="step-badge">02</span><div><h2>Choose your top four</h2><p>Select exactly four companies you would like to apply to.</p></div><span className="choice-count">{selectedCompanies.length}<small>/ 4</small></span></div><div className="company-grid">{companies.map((company) => <button className={`company-choice ${selectedCompanies.includes(company.name) ? 'selected' : ''}`} type="button" key={company.name} onClick={() => toggleCompany(company.name)}><span className={`company-logo ${company.tone}`}>{company.mark}</span><span><strong>{company.name}</strong><small>Hiring partner</small></span><span className="check">✓</span></button>)}</div><div className="form-footer"><button className="back-button" type="button" onClick={() => setStep(1)}>← Back to details</button><button className="primary-button" type="button" disabled={selectedCompanies.length !== 4} onClick={() => finishRegistration(selectedCompanies)}>Submit registration <span>→</span></button></div></section>
}

function Field({ label, name, type = 'text', value, onChange, placeholder, required, min }) { return <div className="field"><label htmlFor={name}>{label} {required && <b>*</b>}</label><input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} /></div> }
function SelectField({ label, name, value, onChange, options, required }) { return <div className="field"><label htmlFor={name}>{label} {required && <b>*</b>}</label><select id={name} name={name} value={value} onChange={onChange} required={required}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option} value={option}>{option}</option>)}</select></div> }

export default App
