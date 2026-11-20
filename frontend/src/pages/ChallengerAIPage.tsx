import React, { useEffect, useState } from 'react'
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  UserCheck,
  RefreshCw,
  Sliders
} from 'lucide-react'
import { shikharApi } from '../services/api'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'

export const ChallengerAIPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [selectedRec, setSelectedRec] = useState<any>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT'>('APPROVE')
  const [tacticalRationale, setTacticalRationale] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      const res = await shikharApi.getRecommendations()
      setRecommendations(res)
      if (res.length > 0 && !selectedRec) {
        setSelectedRec(res[0])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRecommendations()
  }, [])

  const handleTriggerVerification = async (recId: number) => {
    setIsVerifying(true)
    try {
      const res = await shikharApi.verifyRecommendation(recId)
      // Refresh list
      loadRecommendations()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleExecuteAction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRec) return
    try {
      await shikharApi.takeRecommendationAction(selectedRec.id, {
        action: actionType,
        tactical_rationale: tacticalRationale || 'Authorized in accordance with Operational Theater Directive.'
      })
      setShowActionModal(false)
      setTacticalRationale('')
      loadRecommendations()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      {/* Page Header */}
      <div className="bg-tactical-surface border border-tactical-border rounded p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tactical-green pulse-live" />
            <h1 className="text-base font-mono font-bold uppercase tracking-wider text-tactical-text">
              PAGE 13: AI RECOMMENDATION SAFETY & VERIFICATION WORKFLOW
            </h1>
          </div>
          <p className="text-xs font-mono text-tactical-muted mt-0.5">
            Automated Counter-Factual Scrutiny • Bottleneck Feasibility Auditing • Mandatory Human Authorization Gate
          </p>
        </div>

        {/* Security Rule Warning */}
        <div className="bg-tactical-card px-3 py-1.5 rounded border border-tactical-amber/50 flex items-center space-x-2 text-[10px] font-mono text-tactical-amber">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>RULE: Challenger AI cannot autonomously execute transactions without human authorization.</span>
        </div>
      </div>

      {/* Main Grid: Recommendations List & Verification Detail Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Recommendations Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="tactical-panel p-3 bg-tactical-card/60 flex items-center justify-between text-xs font-mono">
            <span className="text-tactical-muted uppercase font-bold text-[10px]">
              Recommendation Queue ({recommendations.length})
            </span>
            <button
              onClick={loadRecommendations}
              className="text-tactical-muted hover:text-white flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {recommendations.map((rec) => (
              <div
                key={rec.id}
                onClick={() => setSelectedRec(rec)}
                className={`tactical-panel p-3.5 cursor-pointer transition-all ${
                  selectedRec?.id === rec.id
                    ? 'border-tactical-olive ring-1 ring-tactical-olive/50 bg-tactical-card'
                    : 'hover:border-tactical-olive/60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-mono font-bold text-tactical-khaki bg-tactical-surface px-1.5 py-0.5 rounded border border-tactical-border">
                    {rec.recommendation_code}
                  </span>
                  <Badge variant={rec.urgency === 'IMMEDIATE_CRITICAL' ? 'red' : 'amber'}>
                    {rec.urgency.replace('_', ' ')}
                  </Badge>
                </div>

                <h3 className="font-mono text-xs font-bold text-tactical-text mt-2">
                  {rec.title}
                </h3>
                <p className="font-mono text-[10px] text-tactical-muted line-clamp-2 mt-1">
                  {rec.description}
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono pt-2 mt-2 border-t border-tactical-border/50">
                  <span className="text-tactical-oliveLight flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    {rec.challenger_verification_status}
                  </span>
                  <Badge
                    variant={
                      rec.approval_status.includes('APPROVED')
                        ? 'green'
                        : rec.approval_status.includes('REJECTED')
                        ? 'red'
                        : 'amber'
                    }
                  >
                    {rec.approval_status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Challenger AI Verification Deep Audit */}
        <div className="lg:col-span-7 tactical-panel p-5 flex flex-col justify-between space-y-4">
          {selectedRec ? (
            <div className="space-y-4 font-mono">
              {/* Header Dossier */}
              <div className="border-b border-tactical-border/60 pb-3 flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-bold text-tactical-khaki uppercase">
                      TACTICAL REQUISITION DIRECTIVE
                    </span>
                    <span className="text-[10px] text-tactical-muted">• {selectedRec.recommendation_code}</span>
                  </div>
                  <h2 className="text-sm font-bold text-tactical-text mt-1">
                    {selectedRec.title}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-tactical-muted uppercase block">Confidence Score</span>
                  <span className="text-base font-bold text-tactical-green">
                    {(selectedRec.confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Original Proposal Parameters */}
              <div className="p-3 rounded bg-tactical-card border border-tactical-border space-y-1.5 text-xs">
                <span className="text-[10px] font-bold uppercase text-tactical-muted block">
                  Original Logistics Proposal Details:
                </span>
                <p className="text-tactical-text leading-relaxed">{selectedRec.description}</p>
                <div className="grid grid-cols-3 gap-2 pt-2 mt-2 border-t border-tactical-border/40 text-[10px]">
                  <div>Source: <span className="text-tactical-khaki font-semibold">{selectedRec.source_warehouse_name}</span></div>
                  <div>Target: <span className="text-tactical-khaki font-semibold">{selectedRec.target_warehouse_name}</span></div>
                  <div>Payload: <span className="text-tactical-text font-bold">{selectedRec.recommended_quantity} units</span></div>
                </div>
              </div>

              {/* U18 Challenger AI Counter-Analysis Box */}
              <div className="p-4 rounded bg-tactical-surface border border-tactical-olive/60 shadow-inner space-y-2.5">
                <div className="flex items-center justify-between border-b border-tactical-border/50 pb-2">
                  <div className="flex items-center space-x-2 text-tactical-oliveLight font-bold text-xs uppercase">
                    <BrainCircuit className="w-4 h-4" />
                    <span>AI Recommendation Safety Audit</span>
                  </div>
                  <Badge variant={selectedRec.challenger_verification_status.includes('VERIFIED') ? 'green' : 'amber'}>
                    {selectedRec.challenger_verification_status}
                  </Badge>
                </div>

                <div className="text-xs space-y-2">
                  <div>
                    <span className="text-[10px] uppercase text-tactical-khaki font-bold block mb-0.5">
                      Bottleneck & Feasibility Rationale:
                    </span>
                    <p className="text-tactical-text leading-relaxed">
                      {selectedRec.challenger_rationale || 'Awaiting automated constraint verification pass.'}
                    </p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-tactical-cyan font-bold block mb-0.5">
                      Challenger Alternative Counter-Proposal:
                    </span>
                    <p className="text-tactical-cyan/90 leading-relaxed">
                      {selectedRec.alternative_strategy || 'No alternative route required; nominal convoy pass viable.'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-tactical-border/40 flex justify-end">
                  <button
                    onClick={() => handleTriggerVerification(selectedRec.id)}
                    disabled={isVerifying}
                    className="flex items-center space-x-1.5 px-3 py-1 bg-tactical-card border border-tactical-border hover:border-tactical-olive rounded text-[11px] text-tactical-text hover:text-white transition-colors"
                  >
                    <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin text-tactical-olive' : ''}`} />
                    <span>Re-evaluate Constraints</span>
                  </button>
                </div>
              </div>

              {/* Human Authorization Section */}
              <div className="p-3 rounded bg-tactical-card border border-tactical-border flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-tactical-muted block">
                    Command Approval Status:
                  </span>
                  <span className="text-xs font-bold text-tactical-text">
                    {selectedRec.approval_status}
                  </span>
                </div>

                {selectedRec.approval_status === 'PENDING_HUMAN_APPROVAL' ? (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setActionType('REJECT')
                        setShowActionModal(true)
                      }}
                      className="px-3 py-1.5 rounded bg-tactical-red/20 border border-tactical-red text-tactical-red hover:bg-tactical-red/30 text-xs font-bold transition-colors"
                    >
                      Reject Recommendation
                    </button>
                    <button
                      onClick={() => {
                        setActionType('APPROVE')
                        setShowActionModal(true)
                      }}
                      className="px-4 py-1.5 rounded bg-tactical-green hover:bg-tactical-green/90 text-white text-xs font-bold transition-colors shadow"
                    >
                      Authorize & Execute
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-xs text-tactical-green font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Action Signed & Sealed</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-tactical-muted font-mono text-xs py-8">
              Select an AI recommendation from the queue to view Challenger verification dossier.
            </div>
          )}
        </div>
      </div>

      {/* Action Rationale Modal */}
      <Modal
        isOpen={showActionModal}
        onClose={() => setShowActionModal(false)}
        title={actionType === 'APPROVE' ? 'Authorize Tactical Requisition' : 'Reject Logistics Directive'}
        subtitle={`Mandatory commander sign-off for ${selectedRec?.recommendation_code}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleExecuteAction} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-[10px] text-tactical-muted uppercase mb-1">
              Tactical Justification / Authorization Note
            </label>
            <textarea
              required
              rows={3}
              value={tacticalRationale}
              onChange={(e) => setTacticalRationale(e.target.value)}
              placeholder="e.g. Authorized under Winter Preparation Directive 2026. Prioritizing blood plasma and dry rations."
              className="w-full bg-tactical-card border border-tactical-border p-2 rounded text-tactical-text focus:outline-none focus:border-tactical-olive"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2 border-t border-tactical-border">
            <button
              type="button"
              onClick={() => setShowActionModal(false)}
              className="px-3 py-1.5 rounded bg-tactical-card border border-tactical-border text-tactical-muted hover:text-white"
            >
              Abort
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded text-white font-bold ${
                actionType === 'APPROVE' ? 'bg-tactical-green hover:bg-tactical-green/90' : 'bg-tactical-red hover:bg-tactical-red/90'
              }`}
            >
              {actionType === 'APPROVE' ? 'Sign & Authorize' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
