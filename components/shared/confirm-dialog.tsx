'use client'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  title: string
  description: string
  confirmText?: string
  onConfirm: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  onConfirm,
  destructive = true,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')
  const canConfirm = !confirmText || typed === confirmText

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {confirmText && (
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-2">
              Digite <strong>{confirmText}</strong> para confirmar:
            </p>
            <Input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={confirmText}
            />
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setTyped('')}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => { onConfirm(); setTyped('') }}
            disabled={!canConfirm}
            className={destructive ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : ''}
          >
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
