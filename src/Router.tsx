import { Routes, Route, Navigate } from 'react-router-dom'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

// Placeholder components - to be implemented
const Dashboard = () => <div>Dashboard</div>
const Conservation = () => <div>Conservation</div>
const Tasks = () => <div>Tasks</div>
const Inventory = () => <div>Inventory</div>
const Settings = () => <div>Settings</div>
const Management = () => <div>Management</div>

function Router() {
  return (
    <>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/conservation" element={<Conservation />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/management" element={<Management />} />
        </Routes>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default Router