import { useState } from 'react'
import { CorrectiveAction } from '@/features/conservation/utils/correctiveActions'
import { AlertTriangle, X } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'

interface CorrectiveActionPopoverProps {
  action: CorrectiveAction
  pointName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function CorrectiveActionPopover({
  action,
  pointName,
  open,
  onOpenChange,
  onConfirm,
}: CorrectiveActionPopoverProps) {
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    if (confirmed) {
      onConfirm()
      // Reset state
      setConfirmed(false)
    }
  }

  const handleCancel = () => {
    onOpenChange(false)
    setConfirmed(false)
  }

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <Popover.Portal>
        <Popover.Content
          className="z-50 w-[400px] rounded-lg border border-gray-200 bg-white p-4 shadow-lg"
          sideOffset={5}
        >
          {/* Header */}
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h3 className="font-semibold text-gray-900">{action.title}</h3>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Chiudi"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Point Name */}
          <p className="mb-2 text-sm font-medium text-gray-700">
            Punto: {pointName}
          </p>

          {/* Description */}
          <p className="mb-4 text-sm text-gray-600">
            {action.description}
          </p>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* Instructions */}
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium text-gray-700">
              📋 Azione correttiva:
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {action.instructions}
            </p>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200" />

          {/* Confirmation Checkbox */}
          <label className="mb-4 flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">
              Ho eseguito l'azione correttiva
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleConfirm}
              disabled={!confirmed}
              className={`
                flex-1 rounded-md px-4 py-2 text-sm font-medium text-white transition-colors
                ${
                  confirmed
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              ✓ Conferma
            </button>
          </div>

          {/* Arrow */}
          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
