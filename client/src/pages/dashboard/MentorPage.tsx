import AIMentor from '../../components/dashboard/AIMentor'

export default function MentorPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">AI Mentor</h1>
        <p className="text-slate-500 text-sm mt-1">Your personal DSA coach — knows your history and weak spots</p>
      </div>
      <AIMentor />
    </div>
  )
}
